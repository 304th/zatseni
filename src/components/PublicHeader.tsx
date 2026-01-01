"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo1 } from "@/components/Logo";

export default function PublicHeader() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/how-it-works", label: "Как работает" },
    { href: "/pricing", label: "Цены" },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Logo1 size={28} />
          <span className="text-2xl font-bold text-gray-900">Отзовик</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/#features"
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-3 py-2 rounded-lg"
          >
            Возможности
          </Link>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-2 rounded-lg ${
                isActive(link.href)
                  ? "text-indigo-600 bg-indigo-50 font-medium"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className={`px-3 py-2 rounded-lg ${
              isActive("/login")
                ? "text-indigo-600 bg-indigo-50 font-medium"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            }`}
          >
            Войти
          </Link>
          <Link
            href="/signup"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            Начать бесплатно
          </Link>
        </div>
      </div>
    </header>
  );
}
