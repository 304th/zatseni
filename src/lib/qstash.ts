import { Client } from "@upstash/qstash";

// Lazy init to avoid build-time errors
let _qstash: Client | null = null;

function getQstash() {
  if (!_qstash) {
    _qstash = new Client({ token: process.env.QSTASH_TOKEN! });
  }
  return _qstash;
}

// Schedule a scrape job for a specific request
export async function scheduleScrapeJob(
  requestId: string,
  businessId: string,
  platform: "yandex" | "gis",
  delayHours = 2
) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL;
  if (!baseUrl) {
    console.error("No base URL configured for QStash callback");
    return;
  }

  const url = `${baseUrl.startsWith("http") ? baseUrl : `https://${baseUrl}`}/api/scrape`;

  await getQstash().publishJSON({
    url,
    delay: `${delayHours}h` as `${bigint}h`,
    body: { requestId, businessId, platform },
  });
}
