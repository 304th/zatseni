"use client";

import { useParams, usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { api } from "@/lib/api";

export default function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const businessId = params.id as string;

  const { data: business, isLoading } = useQuery({
    queryKey: ["business", businessId],
    queryFn: () => api.getBusiness(businessId),
  });

  const basePath = `/dashboard/business/${businessId}`;

  const tabs = [
    { href: basePath, label: "Обзор", icon: "📋" },
    { href: `${basePath}/analytics`, label: "Аналитика", icon: "📊" },
    { href: `${basePath}/requests`, label: "История", icon: "📜" },
    { href: `${basePath}/team`, label: "Команда", icon: "👥", ownerOnly: true },
    { href: `${basePath}/integrations`, label: "Интеграции", icon: "🔗", ownerOnly: true },
  ];

  const isActive = (href: string) => {
    if (href === basePath) return pathname === basePath;
    return pathname.startsWith(href);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-500">Загрузка...</div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="max-w-2xl">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-red-600 mb-4">Бизнес не найден</p>
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            Вернуться к панели
          </Link>
        </div>
      </div>
    );
  }

  const visibleTabs = tabs.filter(
    (tab) => !tab.ownerOnly || business.userRole === "owner"
  );

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <Link
            href="/dashboard"
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold">{business.name}</h1>
          {business.userRole === "manager" && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
              Менеджер
            </span>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-gray-200 overflow-x-auto pb-px">
          {visibleTabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
                isActive(tab.href)
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Content */}
      {children}
    </div>
  );
}
