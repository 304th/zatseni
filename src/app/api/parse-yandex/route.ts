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

// Extract org ID from various Yandex Maps URL formats
function extractOrgId(url: string): string | null {
  // Format: /org/name/123456789/ or /org/123456789/
  const orgMatch = url.match(/\/org\/(?:[^/]+\/)?(\d+)/);
  if (orgMatch) return orgMatch[1];

  // Format: oid=123456789
  const oidMatch = url.match(/oid=(\d+)/);
  if (oidMatch) return oidMatch[1];

  return null;
}

// Parse HTML to extract business data
function parseYandexHtml(html: string, url: string): YandexBusinessData {
  const data: YandexBusinessData = { yandexUrl: url };

  // Try to find JSON-LD data
  const jsonLdMatch = html.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i);
  if (jsonLdMatch) {
    try {
      const jsonLd = JSON.parse(jsonLdMatch[1]);
      if (jsonLd.name) data.name = jsonLd.name;
      if (jsonLd.address?.streetAddress) data.address = jsonLd.address.streetAddress;
      if (jsonLd.telephone) data.phone = jsonLd.telephone;
      if (jsonLd.image) {
        data.images = Array.isArray(jsonLd.image) ? jsonLd.image.slice(0, 5) : [jsonLd.image];
      }
    } catch {
      // JSON parse failed, continue with other methods
    }
  }

  // Try meta tags
  if (!data.name) {
    const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/);
    if (titleMatch) {
      // Clean up title - often has "- Яндекс Карты" suffix
      data.name = titleMatch[1].replace(/\s*[-–—]\s*Яндекс\s*Карты?.*$/i, "").trim();
    }
  }

  if (!data.address) {
    const descMatch = html.match(/<meta property="og:description" content="([^"]+)"/);
    if (descMatch) {
      // Description often contains address
      const desc = descMatch[1];
      // Try to extract address pattern
      const addressMatch = desc.match(/(?:адрес|address)?:?\s*([^.]+(?:ул\.|пр\.|пер\.|д\.|к\.)[^.]+)/i);
      if (addressMatch) {
        data.address = addressMatch[1].trim();
      } else if (desc.length < 200) {
        // Short description might be the address
        data.address = desc;
      }
    }
  }

  // Extract images from og:image and page content
  if (!data.images || data.images.length === 0) {
    const images: string[] = [];

    // OG image
    const ogImageMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
    if (ogImageMatch && !ogImageMatch[1].includes("logo")) {
      images.push(ogImageMatch[1]);
    }

    // Look for image URLs in the page (Yandex uses avatars.mds.yandex.net for business photos)
    const imageMatches = html.matchAll(/https:\/\/avatars\.mds\.yandex\.net\/[^"'\s]+/g);
    for (const match of imageMatches) {
      const imgUrl = match[0];
      // Filter for reasonable image URLs (not icons, etc)
      if (imgUrl.includes("/get-altay") || imgUrl.includes("/get-yandex-businesses")) {
        if (!images.includes(imgUrl) && images.length < 5) {
          images.push(imgUrl);
        }
      }
    }

    if (images.length > 0) {
      data.images = images.slice(0, 5);
    }
  }

  // Extract phone from page content
  if (!data.phone) {
    // Look for phone patterns in visible content
    const phoneMatch = html.match(/(?:телефон|phone|тел\.?)[:\s]*([+7|8][\s\d()-]{10,})/i);
    if (phoneMatch) {
      data.phone = phoneMatch[1].replace(/[^\d+]/g, "");
    }
  }

  return data;
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

    // Fetch the page
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "ru-RU,ru;q=0.9",
      },
      redirect: "follow",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Не удалось загрузить страницу" },
        { status: 400 }
      );
    }

    const html = await response.text();
    const finalUrl = response.url; // In case of redirects

    const data = parseYandexHtml(html, finalUrl);

    if (!data.name) {
      return NextResponse.json(
        { error: "Не удалось найти информацию о бизнесе", partial: data },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Parse Yandex error:", error);
    return NextResponse.json(
      { error: "Ошибка парсинга" },
      { status: 500 }
    );
  }
}
