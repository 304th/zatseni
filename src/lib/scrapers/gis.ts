// 2GIS reviews scraper
// Uses internal API endpoint (unofficial, may break)

interface GisReview {
  id: string;
  rating: number;
  text: string | null;
  authorName: string | null;
  publishedAt: Date;
}

// Extract firm ID from 2GIS URL
// e.g. https://2gis.ru/moscow/firm/1234567890 -> 1234567890
export function extractGisOrgId(url: string): string | null {
  const match = url.match(/\/firm\/(\d+)/);
  return match ? match[1] : null;
}

// Fetch reviews from 2GIS
export async function fetchGisReviews(gisUrl: string): Promise<GisReview[]> {
  const firmId = extractGisOrgId(gisUrl);
  if (!firmId) {
    console.error("Could not extract firm ID from 2GIS URL:", gisUrl);
    return [];
  }

  try {
    // 2GIS has a public API for reviews
    // API endpoint: https://public-api.reviews.2gis.com/2.0/branches/{firmId}/reviews
    const apiUrl = `https://public-api.reviews.2gis.com/2.0/branches/${firmId}/reviews?limit=50&sort_by=date_created&is_advertiser=false`;

    const apiRes = await fetch(apiUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Accept": "application/json",
      },
    });

    if (!apiRes.ok) {
      console.error("2GIS API request failed:", apiRes.status);
      // Fallback to HTML parsing
      return parseGisHtml(gisUrl, firmId);
    }

    const data = await apiRes.json();
    return parseGisApiResponse(data);
  } catch (error) {
    console.error("2GIS scraper error:", error);
    return [];
  }
}

function parseGisApiResponse(data: unknown): GisReview[] {
  const reviews: GisReview[] = [];

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items = (data as any)?.reviews || (data as any)?.items || [];

    for (const item of items) {
      reviews.push({
        id: String(item.id || ""),
        rating: item.rating || 0,
        text: item.text || null,
        authorName: item.user?.name || item.author?.name || null,
        publishedAt: new Date(item.date_created || item.created_at || Date.now()),
      });
    }
  } catch (e) {
    console.error("Failed to parse 2GIS API response:", e);
  }

  return reviews;
}

async function parseGisHtml(gisUrl: string, firmId: string): Promise<GisReview[]> {
  const reviews: GisReview[] = [];

  try {
    const reviewsUrl = gisUrl.includes("/tab/reviews")
      ? gisUrl
      : `${gisUrl.replace(/\/$/, "")}/tab/reviews`;

    const pageRes = await fetch(reviewsUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    if (!pageRes.ok) {
      console.error("Failed to load 2GIS page:", pageRes.status);
      return [];
    }

    const html = await pageRes.text();

    // Look for embedded JSON data in page
    const jsonMatch = html.match(/<script[^>]*>window\.__PRELOADED_DATA__\s*=\s*(\{[\s\S]+?\})<\/script>/);
    if (jsonMatch) {
      const state = JSON.parse(jsonMatch[1]);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const reviewsData = findReviewsInState(state as any);
      for (const item of reviewsData) {
        reviews.push({
          id: String(item.id || Math.random()),
          rating: item.rating || 0,
          text: item.text || null,
          authorName: item.user?.name || item.author?.name || null,
          publishedAt: new Date(item.date_created || item.created_at || Date.now()),
        });
      }
    }
  } catch (e) {
    console.error("Failed to parse 2GIS HTML:", e);
  }

  return reviews;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function findReviewsInState(state: any): any[] {
  // Try various paths where reviews might be stored
  if (state?.reviews?.items) return state.reviews.items;
  if (state?.firm?.reviews) return state.firm.reviews;

  // Deep search for reviews array
  const searched = new Set();
  function search(obj: unknown, depth = 0): unknown[] {
    if (depth > 5 || !obj || typeof obj !== "object") return [];
    if (searched.has(obj)) return [];
    searched.add(obj);

    if (Array.isArray(obj) && obj.length > 0 && obj[0]?.rating !== undefined) {
      return obj;
    }

    for (const key of Object.keys(obj as object)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = search((obj as any)[key], depth + 1);
      if (result.length > 0) return result;
    }
    return [];
  }

  return search(state) as unknown[];
}
