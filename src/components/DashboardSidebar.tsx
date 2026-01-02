"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { Logo1 } from "@/components/Logo";

interface Business {
  id: string;
  name: string;
  slug: string;
  plan: string;
  smsLimit: number;
  smsUsed: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

async function fetchBusinesses(): Promise<Business[]> {
  const res = await fetch("/api/businesses");
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

export default function DashboardSidebar({ isOpen, onClose }: Props) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const { data: businesses = [] } = useQuery({
    queryKey: ["businesses"],
    queryFn: fetchBusinesses,
  });

  const navItems = [
    { href: "/dashboard", label: "Дашборд", icon: "📊" },
    { href: "/dashboard/business/new", label: "Добавить бизнес", icon: "➕" },
    { href: "/dashboard/billing", label: "Тариф и оплата", icon: "💳" },
    { href: "/dashboard/settings", label: "Настройки", icon: "⚙️" },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const currentBusiness = businesses[0];

  const handleNavClick = () => {
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 p-4 flex flex-col z-50
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center gap-2">
            <Logo1 size={28} />
            <span className="text-xl font-bold text-gray-900">Отзовик</span>
          </Link>
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="md:hidden p-2 text-gray-500 hover:text-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleNavClick}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
                isActive(item.href)
                  ? "bg-indigo-50 text-indigo-600 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span>{item.icon}</span> {item.label}
            </Link>
          ))}
        </nav>

        {/* Business list */}
        <div className="mt-6 flex-1 overflow-y-auto">
          <div className="text-xs font-medium text-gray-400 uppercase px-4 mb-2">
            Мои бизнесы
          </div>
          <div className="space-y-1">
            {businesses.length === 0 ? (
              <div className="px-4 py-2 text-gray-400 text-sm">
                Пока нет бизнесов
              </div>
            ) : (
              businesses.map((biz) => (
                <Link
                  key={biz.id}
                  href={`/dashboard/business/${biz.id}`}
                  onClick={handleNavClick}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm ${
                    pathname.includes(biz.id)
                      ? "bg-indigo-50 text-indigo-600 font-medium"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span>🏢</span>
                  <span className="truncate">{biz.name}</span>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-gray-100">
          {currentBusiness && (
            <div className="bg-indigo-50 rounded-lg p-3">
              <div className="text-sm font-medium text-indigo-900 mb-1">
                Тариф «{currentBusiness.plan}»
              </div>
              <div className="text-xs text-indigo-600 mb-2">
                {currentBusiness.smsUsed} / {currentBusiness.smsLimit} SMS
              </div>
              <div className="w-full bg-indigo-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full"
                  style={{
                    width: `${Math.min(
                      (currentBusiness.smsUsed / currentBusiness.smsLimit) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* User info */}
          {session?.user && (
            <div className="flex items-center gap-3 px-2 py-2">
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt=""
                  className="w-9 h-9 rounded-full"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-medium">
                  {(session.user.name || session.user.email || "U").slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {session.user.name || "Пользователь"}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {session.user.email}
                </div>
              </div>
            </div>
          )}

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 py-2 rounded-lg"
          >
            Выйти
          </button>
        </div>
      </aside>
    </>
  );
}
