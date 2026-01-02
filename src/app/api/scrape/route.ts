import { NextRequest, NextResponse } from "next/server";
import { Receiver } from "@upstash/qstash";
import { prisma } from "@/lib/prisma";
import { fetchYandexReviews, fetchGisReviews } from "@/lib/scrapers";

// How many hours after click we consider a review as potentially matched
const MATCH_WINDOW_HOURS = 4;

export async function POST(req: NextRequest) {
  // Verify QStash signature
  const signature = req.headers.get("upstash-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 401 });
  }

  const body = await req.text();

  const receiver = new Receiver({
    currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
    nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
  });

  const isValid = await receiver.verify({ signature, body }).catch(() => false);
  if (!isValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  try {
    const { requestId, businessId, platform } = JSON.parse(body);

    if (!requestId || !businessId || !platform) {
      return NextResponse.json({ error: "Missing params" }, { status: 400 });
    }

    // Get the request and business
    const request = await prisma.reviewRequest.findUnique({
      where: { id: requestId },
      include: { business: true },
    });

    if (!request) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Already matched
    if (request.externalReviewId) {
      return NextResponse.json({ status: "already_matched" });
    }

    const clickTime = platform === "yandex"
      ? request.clickedYandexAt
      : request.clickedGisAt;

    if (!clickTime) {
      return NextResponse.json({ error: "No click recorded" }, { status: 400 });
    }

    // Scrape reviews
    const url = platform === "yandex"
      ? request.business.yandexUrl
      : request.business.gisUrl;

    if (!url) {
      return NextResponse.json({ error: "No URL configured" }, { status: 400 });
    }

    const reviews = platform === "yandex"
      ? await fetchYandexReviews(url)
      : await fetchGisReviews(url);

    console.log(`Scraped ${reviews.length} reviews from ${platform} for business ${businessId}`);

    // Find reviews posted within window after click
    const clickMs = clickTime.getTime();
    const windowEnd = clickMs + MATCH_WINDOW_HOURS * 60 * 60 * 1000;

    const matchedReview = reviews.find((r) => {
      const reviewMs = r.publishedAt.getTime();
      return reviewMs >= clickMs && reviewMs <= windowEnd;
    });

    if (matchedReview) {
      // Store the matched review
      const stored = await prisma.externalReview.upsert({
        where: {
          platform_externalId: {
            platform,
            externalId: matchedReview.id,
          },
        },
        create: {
          businessId,
          platform,
          externalId: matchedReview.id,
          rating: matchedReview.rating,
          text: matchedReview.text,
          authorName: matchedReview.authorName,
          publishedAt: matchedReview.publishedAt,
        },
        update: {},
      });

      // Link to request
      await prisma.reviewRequest.update({
        where: { id: requestId },
        data: { externalReviewId: stored.id },
      });

      console.log(`Matched review ${matchedReview.id} to request ${requestId}`);
      return NextResponse.json({ status: "matched", reviewId: stored.id });
    }

    console.log(`No matching review found for request ${requestId}`);
    return NextResponse.json({ status: "no_match" });
  } catch (error) {
    console.error("Scrape error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
