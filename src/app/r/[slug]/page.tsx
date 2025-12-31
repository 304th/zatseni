import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ReviewForm from "./ReviewForm";

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
              <span className="text-3xl">⭐</span>
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

        <p className="text-center text-gray-400 text-sm mt-6">
          Powered by Зацени
        </p>
      </div>
    </div>
  );
}
