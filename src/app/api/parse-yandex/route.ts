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

// Extract organization data from embedded JSON in Yandex Maps page
function extractFromEmbeddedJson(html: string): Partial<YandexBusinessData> {
  const data: Partial<YandexBusinessData> = {};

  // Method 1: Look for organization data in script tags
  // Yandex embeds data like: "name":"Business Name","address":{"formatted":"..."}

  // Extract business name - look for patterns in JSON
  const namePatterns = [
    // "name":"Business Name" in organization context
    /"displayName"\s*:\s*"([^"]+)"/,
    /"orgName"\s*:\s*"([^"]+)"/,
    /"title"\s*:\s*"([^"]+)"[^}]*"type"\s*:\s*"business"/,
    // From structured data
    /"name"\s*:\s*"([^"]+)"[^}]*"@type"\s*:\s*"(?:LocalBusiness|Organization|Store|Restaurant|Place)"/,
    /"@type"\s*:\s*"(?:LocalBusiness|Organization|Store|Restaurant|Place)"[^}]*"name"\s*:\s*"([^"]+)"/,
  ];

  for (const pattern of namePatterns) {
    const match = html.match(pattern);
    if (match && match[1] && !match[1].includes("Яндекс") && match[1].length < 100) {
      data.name = match[1];
      break;
    }
  }

  // Extract address
  const addressPatterns = [
    /"formattedAddress"\s*:\s*"([^"]+)"/,
    /"formatted"\s*:\s*"([^"]+)"[^}]*"kind"\s*:\s*"house"/,
    /"address"\s*:\s*\{[^}]*"formatted"\s*:\s*"([^"]+)"/,
    /"streetAddress"\s*:\s*"([^"]+)"/,
    /"fullAddress"\s*:\s*"([^"]+)"/,
    /"text"\s*:\s*"([^"]+)"[^}]*"precision"\s*:\s*"exact"/,
  ];

  for (const pattern of addressPatterns) {
    const match = html.match(pattern);
    if (match && match[1] && match[1].length > 5 && match[1].length < 200) {
      // Clean up address - remove city prefix if too long
      let addr = match[1];
      // Decode unicode escapes
      addr = addr.replace(/\\u([0-9a-fA-F]{4})/g, (_, code) =>
        String.fromCharCode(parseInt(code, 16))
      );
      data.address = addr;
      break;
    }
  }

  // Extract phone
  const phonePatterns = [
    /"phones"\s*:\s*\[\s*\{[^}]*"formatted"\s*:\s*"([^"]+)"/,
    /"phone"\s*:\s*"([^"]+)"/,
    /"telephone"\s*:\s*"([^"]+)"/,
    /"phoneNumber"\s*:\s*"([^"]+)"/,
    /"\+7[\s\d()-]{10,14}"/,
    /"8[\s\d()-]{10,14}"/,
  ];

  for (const pattern of phonePatterns) {
    const match = html.match(pattern);
    if (match) {
      let phone = match[1] || match[0];
      phone = phone.replace(/"/g, "").trim();
      // Validate it looks like a phone
      if (phone.match(/^[\+\d\s\(\)-]{10,}$/)) {
        data.phone = phone;
        break;
      }
    }
  }

  // Extract images
  const images: string[] = [];

  // Look for photo URLs in various formats
  const imagePatterns = [
    /https:\/\/avatars\.mds\.yandex\.net\/get-altay\/[^"'\s]+/g,
    /https:\/\/avatars\.mds\.yandex\.net\/get-yandex-businesses\/[^"'\s]+/g,
    /"photoUrl"\s*:\s*"([^"]+)"/g,
    /"imageUrl"\s*:\s*"([^"]+avatars[^"]+)"/g,
    /"src"\s*:\s*"(https:\/\/[^"]*avatars\.mds\.yandex\.net[^"]+)"/g,
  ];

  for (const pattern of imagePatterns) {
    const matches = html.matchAll(pattern);
    for (const match of matches) {
      let imgUrl = match[1] || match[0];
      imgUrl = imgUrl.replace(/\\u002F/g, "/").replace(/\\/g, "");

      // Filter out small images (icons, logos)
      if (imgUrl.includes("/orig") || imgUrl.includes("/XL") || imgUrl.includes("/L") ||
          (!imgUrl.includes("/S") && !imgUrl.includes("/XS") && !imgUrl.includes("/icon"))) {
        if (!images.includes(imgUrl) && images.length < 5) {
          images.push(imgUrl);
        }
      }
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

  // OG Title - but clean it up
  const titleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i) ||
                     html.match(/<meta\s+content="([^"]+)"\s+property="og:title"/i);
  if (titleMatch) {
    let title = titleMatch[1];
    // Remove common suffixes
    title = title
      .replace(/\s*[-–—|]\s*Яндекс[\s.]?Карты.*$/i, "")
      .replace(/\s*[-–—|]\s*Yandex[\s.]?Maps.*$/i, "")
      .replace(/\s*[-–—|]\s*отзывы.*$/i, "")
      .trim();

    if (title && title.length > 2 && title.length < 100 && !title.toLowerCase().includes("яндекс")) {
      data.name = title;
    }
  }

  // OG Description often contains address
  const descMatch = html.match(/<meta\s+property="og:description"\s+content="([^"]+)"/i) ||
                    html.match(/<meta\s+content="([^"]+)"\s+property="og:description"/i);
  if (descMatch) {
    const desc = descMatch[1];
    // Check if it looks like an address (contains common address words)
    if (desc.match(/(?:ул\.|улица|пр\.|проспект|пер\.|д\.|дом|корп|стр|г\.|город|область|район)/i)) {
      // Extract just the address part
      const addrMatch = desc.match(/^([^.!?]+(?:д\.|дом)[^.!?]*)/i) ||
                       desc.match(/^([^,]+,[^,]+,[^,]+)/);
      if (addrMatch) {
        data.address = addrMatch[1].trim();
      } else if (desc.length < 150) {
        data.address = desc;
      }
    }
  }

  // OG Image
  const imgMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i) ||
                   html.match(/<meta\s+content="([^"]+)"\s+property="og:image"/i);
  if (imgMatch && !imgMatch[1].includes("logo") && imgMatch[1].includes("avatars")) {
    data.images = [imgMatch[1]];
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

      // Handle array of objects
      const items = Array.isArray(jsonLd) ? jsonLd : [jsonLd];

      for (const item of items) {
        if (item["@type"] && ["LocalBusiness", "Organization", "Store", "Restaurant",
            "FoodEstablishment", "HealthAndBeautyBusiness", "Place"].includes(item["@type"])) {

          if (item.name && !data.name) {
            data.name = item.name;
          }

          if (item.address && !data.address) {
            if (typeof item.address === "string") {
              data.address = item.address;
            } else if (item.address.streetAddress) {
              data.address = item.address.streetAddress;
            } else if (item.address.formatted) {
              data.address = item.address.formatted;
            }
          }

          if (item.telephone && !data.phone) {
            data.phone = item.telephone;
          }

          if (item.image && !data.images) {
            data.images = Array.isArray(item.image) ? item.image.slice(0, 5) : [item.image];
          }
        }
      }
    } catch {
      // JSON parse failed, continue
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
    // Clean up title
    title = title
      .replace(/\s*[-–—|:]\s*Яндекс[\s.]?Карты.*$/i, "")
      .replace(/\s*[-–—|:]\s*Yandex[\s.]?Maps.*$/i, "")
      .replace(/\s*[-–—|]\s*карта.*$/i, "")
      .replace(/\s*[-–—|]\s*отзывы.*$/i, "")
      .trim();

    if (title && title.length > 2 && title.length < 100 &&
        !title.toLowerCase().includes("яндекс") &&
        !title.toLowerCase().includes("yandex")) {
      data.name = title;
    }
  }

  return data;
}

// Main parsing function - combines all methods
function parseYandexHtml(html: string, url: string): YandexBusinessData {
  const result: YandexBusinessData = { yandexUrl: url };

  // Try all extraction methods
  const jsonData = extractFromEmbeddedJson(html);
  const jsonLdData = extractFromJsonLd(html);
  const metaData = extractFromMetaTags(html);
  const titleData = extractFromTitle(html);

  // Merge results with priority: embedded JSON > JSON-LD > meta > title
  result.name = jsonData.name || jsonLdData.name || metaData.name || titleData.name;
  result.address = jsonData.address || jsonLdData.address || metaData.address;
  result.phone = jsonData.phone || jsonLdData.phone;

  // Merge images from all sources
  const allImages = [
    ...(jsonData.images || []),
    ...(jsonLdData.images || []),
    ...(metaData.images || []),
  ];

  // Deduplicate and limit
  const uniqueImages = [...new Set(allImages)].slice(0, 5);
  if (uniqueImages.length > 0) {
    result.images = uniqueImages;
  }

  // Clean up phone number
  if (result.phone) {
    result.phone = result.phone.replace(/[^\d+]/g, "");
    // Normalize Russian phone
    if (result.phone.startsWith("8") && result.phone.length === 11) {
      result.phone = "+7" + result.phone.slice(1);
    }
  }

  return result;
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

    // Validate it's a Yandex Maps URL
    if (!url.includes("yandex.ru/maps") && !url.includes("yandex.com/maps")) {
      return NextResponse.json(
        { error: "Не похоже на ссылку Яндекс Карт" },
        { status: 400 }
      );
    }

    // Fetch the page with better headers
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
        "Accept-Encoding": "gzip, deflate, br",
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Не удалось загрузить страницу: ${response.status}` },
        { status: 400 }
      );
    }

    const html = await response.text();
    const finalUrl = response.url;

    // Debug: log a snippet if parsing fails
    const data = parseYandexHtml(html, finalUrl);

    // Return partial data even if name not found
    if (!data.name && !data.address && !data.phone) {
      console.error("Parse failed. HTML snippet:", html.slice(0, 2000));
      return NextResponse.json(
        {
          error: "Не удалось найти информацию о бизнесе. Попробуйте ввести данные вручную.",
          debug: {
            htmlLength: html.length,
            hasJsonLd: html.includes("application/ld+json"),
            hasOgTitle: html.includes("og:title"),
          }
        },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Parse Yandex error:", error);
    return NextResponse.json(
      { error: "Ошибка парсинга: " + (error instanceof Error ? error.message : "unknown") },
      { status: 500 }
    );
  }
}
