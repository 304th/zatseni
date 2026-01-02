import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ReviewForm from "./ReviewForm";
import { getPlan } from "@/lib/plans";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ReviewPage({ params }: PageProps) {
  const { slug } = await params;

  const business = await prisma.business.findUnique({
    where: { slug },
    select: {
      id: true,
      name: true,
      logo: true,
      plan: true,
      yandexUrl: true,
      gisUrl: true,
    },
  });

  if (!business) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {business.logo ? (
            <img
              src={business.logo}
              alt={business.name}
              className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-indigo-100 mx-auto mb-4 flex items-center justify-center">
              <svg width="48" height="48" viewBox="4 4 24 24" fill="none">
                <path d="M4 6C4 4.89543 4.89543 4 6 4H26C27.1046 4 28 4.89543 28 6V20C28 21.1046 27.1046 22 26 22H18L12 28V22H6C4.89543 22 4 21.1046 4 20V6Z" fill="#4F46E5"/>
                <path d="M16 7L17.5 11.5H22L18.5 14L20 18.5L16 15.5L12 18.5L13.5 14L10 11.5H14.5L16 7Z" fill="#FBBF24"/>
              </svg>
            </div>
          )}

          <h1 className="text-2xl font-bold text-gray-900 mb-2">{business.name}</h1>
          <p className="text-gray-600 mb-6">Как вам у нас?</p>

          <ReviewForm
            businessId={business.id}
            yandexUrl={business.yandexUrl}
            gisUrl={business.gisUrl}
          />
        </div>

        {!getPlan(business.plan).features.custom_branding && (
          <p className="text-center text-gray-400 text-sm mt-6">
            Powered by Отзовик
          </p>
        )}
      </div>
    </div>
  );
}
