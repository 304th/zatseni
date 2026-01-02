"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import PhoneVerification from "@/components/PhoneVerification";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showVerification, setShowVerification] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Загрузка...</div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  const needsPhoneVerification = !session?.user?.phoneVerified;

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar />
      <main className="ml-64 p-8">
        {needsPhoneVerification && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📱</span>
              <div>
                <p className="font-medium text-amber-900">
                  Подтвердите номер телефона
                </p>
                <p className="text-sm text-amber-700">
                  Для отправки SMS-запросов необходимо подтвердить ваш номер
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowVerification(true)}
              className="bg-amber-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-amber-700"
            >
              Подтвердить
            </button>
          </div>
        )}
        {children}
      </main>

      {showVerification && (
        <PhoneVerification
          onClose={() => setShowVerification(false)}
          onVerified={() => {
            setShowVerification(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
