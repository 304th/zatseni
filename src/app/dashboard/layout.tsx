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
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mobile header with hamburger */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 flex items-center px-4 z-30">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 -ml-2 text-gray-600 hover:text-gray-900"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="ml-3 font-semibold text-gray-900">Отзовик</span>
      </div>

      <main className="md:ml-64 p-4 md:p-8 pt-20 md:pt-8">
        {needsPhoneVerification && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
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
              className="bg-amber-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-amber-700 whitespace-nowrap"
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
