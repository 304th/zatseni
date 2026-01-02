import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface YandexBusinessData {
  name?: string;
  address?: string;
  phone?: string;
  images?: string[];
  yandexUrl?: string;
}

// Normalize image URL to base form for deduplication
function normalizeImageUrl(url: string): string {
  // Remove size suffixes and query params for comparison
  return url
    .replace(/\/[a-z_]+$/, "") // Remove size suffix like /orig, /XL
    .replace(/\?.*$/, "") // Remove query params
    .replace(/\\u002F/g, "/")
    .replace(/\\/g, "");
}

// Check if URL is a valid business photo (not icon/logo)
function isValidBusinessPhoto(url: string): boolean {
  const normalized = url.toLowerCase();
  // Must be from Yandex image CDN
  if (!normalized.includes("avatars.mds.yandex.net")) return false;
  // Skip icons and small images
  if (normalized.includes("/icon") || normalized.includes("/logo")) return false;
  // Must be business or altay photos
  if (!normalized.includes("get-altay") &&
      !normalized.includes("get-yandex-businesses") &&
      !normalized.includes("get-snippets")) return false;
  return true;
}

// Extract organization data from embedded JSON in Yandex Maps page
function extractFromEmbeddedJson(html: string): Partial<YandexBusinessData> {
  const data: Partial<YandexBusinessData> = {};

  // Look for specific Yandex Maps data patterns

  // Name patterns - be more specific to avoid getting combined name+address
  const namePatterns = [
    /"displayName"\s*:\s*"([^"]{2,80})"/,
    /"orgName"\s*:\s*"([^"]{2,80})"/,
    /"companyName"\s*:\s*"([^"]{2,80})"/,
    /"shortName"\s*:\s*"([^"]{2,80})"/,
  ];

  for (const pattern of namePatterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      let name = match[1];
      // Decode unicode
      name = name.replace(/\\u([0-9a-fA-F]{4})/g, (_, code) =>
        String.fromCharCode(parseInt(code, 16))
      );
      // Skip if it looks like an address or contains Yandex
      if (!name.includes("Яндекс") &&
          !name.includes("yandex") &&
          !name.match(/^(г\.|ул\.|пр\.|д\.)/i) &&
          !name.match(/\d{6}/) && // postal code
          name.length < 80) {
        data.name = name;
        break;
      }
    }
  }

  // Address patterns
  const addressPatterns = [
    /"formattedAddress"\s*:\s*"([^"]+)"/,
    /"address"\s*:\s*"([^"]+)"/g, // Note: use first non-name match
    /"fullAddress"\s*:\s*"([^"]+)"/,
  ];

  for (const pattern of addressPatterns) {
    const matches = html.matchAll(new RegExp(pattern.source, "g"));
    for (const match of matches) {
      if (match[1] && match[1].length > 10 && match[1].length < 200) {
        let addr = match[1];
        // Decode unicode
        addr = addr.replace(/\\u([0-9a-fA-F]{4})/g, (_, code) =>
          String.fromCharCode(parseInt(code, 16))
        );
        // Must look like an address
        if (addr.match(/(?:г\.|ул\.|пр\.|пер\.|д\.|дом|\d+)/i)) {
          // Don't use if it's the same as name
          if (data.name && addr.includes(data.name)) continue;
          data.address = addr;
          break;
        }
      }
    }
    if (data.address) break;
  }

  // Phone patterns
  const phonePatterns = [
    /"phones"\s*:\s*\[\s*\{[^}]*"formatted"\s*:\s*"([^"]+)"/,
    /"phoneNumbers"\s*:\s*\[\s*"([^"]+)"/,
    /"phone"\s*:\s*"(\+?[78][^"]{9,14})"/,
    /"telephone"\s*:\s*"(\+?[78][^"]{9,14})"/,
  ];

  for (const pattern of phonePatterns) {
    const match = html.match(pattern);
    if (match && match[1]) {
      let phone = match[1].replace(/"/g, "").trim();
      if (phone.match(/^[\+\d\s\(\)-]{10,}/)) {
        data.phone = phone;
        break;
      }
    }
  }

  // Extract images - collect unique base URLs
  const imageBaseUrls = new Set<string>();
  const images: string[] = [];

  // Find all potential image URLs
  const imgRegex = /https:\/\/avatars\.mds\.yandex\.net\/get-(?:altay|yandex-businesses|snippets)\/\d+\/[^"'\s\\]+/g;
  const matches = html.matchAll(imgRegex);

  for (const match of matches) {
    let imgUrl = match[0];
    // Clean up URL
    imgUrl = imgUrl.replace(/\\u002F/g, "/").replace(/\\/g, "");

    if (!isValidBusinessPhoto(imgUrl)) continue;

    // Normalize for dedup
    const baseUrl = normalizeImageUrl(imgUrl);

    if (!imageBaseUrls.has(baseUrl)) {
      imageBaseUrls.add(baseUrl);
      // Prefer larger size
      const fullUrl = imgUrl.includes("/orig") ? imgUrl : imgUrl.replace(/\/[a-z_]+$/, "/XL");
      images.push(fullUrl);
      if (images.length >= 5) break;
    }
  }

  if (images.length > 0) {
    data.images = images;
  }

  return data;
}

// Extract from meta tags as fallback
function extractFromMetaTags(html: string): Partial<YandexBusinessData> {
  const data: Partial<YandexBusinessData> = {};

  // OG Title
  const titleMatch = html.match(/<meta\s+(?:property="og:title"\s+content="([^"]+)"|content="([^"]+)"\s+property="og:title")/i);
  if (titleMatch) {
    let title = titleMatch[1] || titleMatch[2];
    // Remove suffixes
    title = title
      .replace(/\s*[-–—|:,]\s*Яндекс[\s.]?Карты.*$/i, "")
      .replace(/\s*[-–—|:,]\s*Yandex[\s.]?Maps.*$/i, "")
      .replace(/\s*[-–—|]\s*отзывы.*$/i, "")
      .trim();

    // Split if it contains address (comma followed by address-like text)
    const parts = title.split(/\s*,\s*/);
    if (parts.length > 1 && parts[1].match(/^(г\.|ул\.|пр\.|\d)/i)) {
      // First part is name, rest is address
      if (parts[0].length > 2 && parts[0].length < 80 && !parts[0].toLowerCase().includes("яндекс")) {
        data.name = parts[0];
      }
      // Join remaining parts as address
      const addr = parts.slice(1).join(", ");
      if (addr.length > 5) {
        data.address = addr;
      }
    } else if (title.length > 2 && title.length < 80 && !title.toLowerCase().includes("яндекс")) {
      data.name = title;
    }
  }

  // OG Description for address if not found
  if (!data.address) {
    const descMatch = html.match(/<meta\s+(?:property="og:description"\s+content="([^"]+)"|content="([^"]+)"\s+property="og:description")/i);
    if (descMatch) {
      const desc = descMatch[1] || descMatch[2];
      // Extract address if it looks like one
      if (desc.match(/(?:ул\.|улица|пр\.|проспект|пер\.|д\.|дом)/i)) {
        const addrMatch = desc.match(/([^.!?]*(?:ул\.|пр\.|д\.)[^.!?]*)/i);
        if (addrMatch && addrMatch[1].length < 150) {
          data.address = addrMatch[1].trim();
        }
      }
    }
  }

  // OG Image
  const imgMatch = html.match(/<meta\s+(?:property="og:image"\s+content="([^"]+)"|content="([^"]+)"\s+property="og:image")/i);
  if (imgMatch) {
    const img = imgMatch[1] || imgMatch[2];
    if (isValidBusinessPhoto(img)) {
      data.images = [img];
    }
  }

  return data;
}

// Extract from JSON-LD structured data
function extractFromJsonLd(html: string): Partial<YandexBusinessData> {
  const data: Partial<YandexBusinessData> = {};

  const jsonLdMatches = html.matchAll(/<script\s+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi);

  for (const match of jsonLdMatches) {
    try {
      const jsonLd = JSON.parse(match[1]);
      const items = Array.isArray(jsonLd) ? jsonLd : [jsonLd];

      for (const item of items) {
        const itemType = item["@type"];
        if (!itemType) continue;

        const validTypes = ["LocalBusiness", "Organization", "Store", "Restaurant",
          "FoodEstablishment", "HealthAndBeautyBusiness", "Place", "CafeOrCoffeeShop"];

        if (!validTypes.includes(itemType)) continue;

        if (item.name && !data.name && item.name.length < 80) {
          data.name = item.name;
        }

        if (item.address && !data.address) {
          if (typeof item.address === "string") {
            data.address = item.address;
          } else if (item.address.streetAddress) {
            data.address = item.address.streetAddress;
          }
        }

        if (item.telephone && !data.phone) {
          data.phone = item.telephone;
        }

        if (item.image && !data.images) {
          const imgs = Array.isArray(item.image) ? item.image : [item.image];
          data.images = imgs.filter(isValidBusinessPhoto).slice(0, 5);
        }
      }
    } catch {
      // JSON parse failed
    }
  }

  return data;
}

// Extract from page title
function extractFromTitle(html: string): Partial<YandexBusinessData> {
  const data: Partial<YandexBusinessData> = {};

  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  if (titleMatch) {
    let title = titleMatch[1];
    title = title
      .replace(/\s*[-–—|:]\s*Яндекс[\s.]?Карты.*$/i, "")
      .replace(/\s*[-–—|:]\s*Yandex[\s.]?Maps.*$/i, "")
      .trim();

    // Split on comma if address-like
    const parts = title.split(/\s*,\s*/);
    if (parts.length > 1 && parts[1].match(/^(г\.|ул\.|пр\.|\d)/i)) {
      if (parts[0].length > 2 && parts[0].length < 80 && !parts[0].toLowerCase().includes("яндекс")) {
        data.name = parts[0];
      }
    } else if (title.length > 2 && title.length < 80 && !title.toLowerCase().includes("яндекс")) {
      data.name = title;
    }
  }

  return data;
}

// Main parsing function
function parseYandexHtml(html: string, url: string): YandexBusinessData {
  const result: YandexBusinessData = { yandexUrl: url };

  const jsonData = extractFromEmbeddedJson(html);
  const jsonLdData = extractFromJsonLd(html);
  const metaData = extractFromMetaTags(html);
  const titleData = extractFromTitle(html);

  // Priority: embedded JSON > JSON-LD > meta > title
  result.name = jsonData.name || jsonLdData.name || metaData.name || titleData.name;
  result.address = jsonData.address || jsonLdData.address || metaData.address;
  result.phone = jsonData.phone || jsonLdData.phone;

  // Collect unique images
  const allImages = [
    ...(jsonData.images || []),
    ...(jsonLdData.images || []),
    ...(metaData.images || []),
  ];

  // Deduplicate by base URL
  const seenBases = new Set<string>();
  const uniqueImages: string[] = [];
  for (const img of allImages) {
    const base = normalizeImageUrl(img);
    if (!seenBases.has(base)) {
      seenBases.add(base);
      uniqueImages.push(img);
      if (uniqueImages.length >= 5) break;
    }
  }

  if (uniqueImages.length > 0) {
    result.images = uniqueImages;
  }

  // Clean phone
  if (result.phone) {
    result.phone = result.phone.replace(/[^\d+]/g, "");
    if (result.phone.startsWith("8") && result.phone.length === 11) {
      result.phone = "+7" + result.phone.slice(1);
    }
  }

  // Clean name - remove address if accidentally included
  if (result.name && result.address && result.name.includes(result.address)) {
    result.name = result.name.replace(result.address, "").replace(/[,\s]+$/, "").trim();
  }

  return result;
}

// Fetch with retry
async function fetchWithRetry(url: string, retries = 2): Promise<Response> {
  let lastError: Error | null = null;

  for (let i = 0; i <= retries; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "ru-RU,ru;q=0.9,en;q=0.8",
          "Sec-Fetch-Dest": "document",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-Site": "none",
        },
        redirect: "follow",
        signal: AbortSignal.timeout(10000), // 10s timeout
      });

      if (response.ok) {
        return response;
      }

      // If we get a redirect to captcha, retry
      if (response.status === 403 || response.url.includes("captcha")) {
        lastError = new Error(`Blocked: ${response.status}`);
        await new Promise(r => setTimeout(r, 1000 * (i + 1))); // Backoff
        continue;
      }

      return response; // Return non-OK response to handle error
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (i < retries) {
        await new Promise(r => setTimeout(r, 1000 * (i + 1)));
      }
    }
  }

  throw lastError || new Error("Fetch failed");
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
    }

    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL обязателен" }, { status: 400 });
    }

    if (!url.includes("yandex.ru/maps") && !url.includes("yandex.com/maps")) {
      return NextResponse.json(
        { error: "Не похоже на ссылку Яндекс Карт" },
        { status: 400 }
      );
    }

    let response: Response;
    try {
      response = await fetchWithRetry(url);
    } catch (err) {
      return NextResponse.json(
        { error: "Не удалось загрузить страницу. Попробуйте ещё раз." },
        { status: 400 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: `Ошибка загрузки: ${response.status}` },
        { status: 400 }
      );
    }

    const html = await response.text();
    const finalUrl = response.url;

    const data = parseYandexHtml(html, finalUrl);

    // Return even partial data
    if (!data.name && !data.address && !data.phone) {
      return NextResponse.json(
        { error: "Не удалось распознать данные. Введите вручную." },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Parse Yandex error:", error);
    return NextResponse.json(
      { error: "Ошибка: " + (error instanceof Error ? error.message : "unknown") },
      { status: 500 }
    );
  }
}
