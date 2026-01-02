// Yandex Maps reviews scraper
// Uses internal API endpoint (unofficial, may break)

interface YandexReview {
  id: string;
  rating: number;
  text: string | null;
  authorName: string | null;
  publishedAt: Date;
}

// Extract org ID from Yandex Maps URL
// e.g. https://yandex.ru/maps/org/company_name/1234567890/ -> 1234567890
export function extractYandexOrgId(url: string): string | null {
  const match = url.match(/\/org\/[^/]+\/(\d+)/);
  return match ? match[1] : null;
}

// Fetch reviews from Yandex Maps
export async function fetchYandexReviews(yandexUrl: string): Promise<YandexReview[]> {
  const orgId = extractYandexOrgId(yandexUrl);
  if (!orgId) {
    console.error("Could not extract org ID from Yandex URL:", yandexUrl);
    return [];
  }

  try {
    // First, get CSRF token by loading the org page
    const orgPageUrl = `https://yandex.ru/maps/org/${orgId}/reviews/`;
    const pageRes = await fetch(orgPageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    if (!pageRes.ok) {
      console.error("Failed to load Yandex org page:", pageRes.status);
      return [];
    }

    const html = await pageRes.text();

    // Try to extract CSRF token from page
    const csrfMatch = html.match(/"csrfToken":"([^"]+)"/);
    if (!csrfMatch) {
      // Fallback to HTML parsing
      return parseYandexHtml(html, orgId);
    }

    const csrfToken = csrfMatch[1];

    // Fetch reviews via internal API
    const apiUrl = `https://yandex.ru/maps/api/business/fetchReviews?businessId=${orgId}&csrfToken=${csrfToken}&ajax=1&page=0&pageSize=50&ranking=by_time`;

    const apiRes = await fetch(apiUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Accept": "application/json",
        "Referer": orgPageUrl,
      },
    });

    if (!apiRes.ok) {
      console.error("Yandex API request failed:", apiRes.status);
      return parseYandexHtml(html, orgId);
    }

    const data = await apiRes.json();
    return parseYandexApiResponse(data);
  } catch (error) {
    console.error("Yandex scraper error:", error);
    return [];
  }
}

function parseYandexApiResponse(data: unknown): YandexReview[] {
  const reviews: YandexReview[] = [];

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items = (data as any)?.data?.reviews || [];

    for (const item of items) {
      reviews.push({
        id: String(item.reviewId || item.id || ""),
        rating: item.rating || 0,
        text: item.text || null,
        authorName: item.author?.name || item.authorName || null,
        publishedAt: new Date(item.updatedTime || item.createdTime || Date.now()),
      });
    }
  } catch (e) {
    console.error("Failed to parse Yandex API response:", e);
  }

  return reviews;
}

function parseYandexHtml(html: string, orgId: string): YandexReview[] {
  const reviews: YandexReview[] = [];

  try {
    // Look for embedded JSON data in page
    const jsonMatch = html.match(/<script[^>]*>window\.__PRELOADED_STATE__\s*=\s*(\{[\s\S]+?\})<\/script>/);
    if (jsonMatch) {
      const state = JSON.parse(jsonMatch[1]);
      // Navigate to reviews in state object
      // Structure varies, try common paths
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const reviewsData = findReviewsInState(state as any);
      for (const item of reviewsData) {
        reviews.push({
          id: String(item.reviewId || item.id || Math.random()),
          rating: item.rating || 0,
          text: item.text || null,
          authorName: item.author?.name || null,
          publishedAt: new Date(item.updatedTime || item.createdTime || Date.now()),
        });
      }
    }
  } catch (e) {
    console.error("Failed to parse Yandex HTML:", e);
  }

  return reviews;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function findReviewsInState(state: any): any[] {
  // Try various paths where reviews might be stored
  if (state?.reviews?.items) return state.reviews.items;
  if (state?.orgInfo?.reviews?.items) return state.orgInfo.reviews.items;
  if (state?.business?.reviews) return state.business.reviews;

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
