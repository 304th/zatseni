import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "Отзовик — Отзывы для бизнеса на автопилоте",
  description: "Собирайте отзывы на Яндекс Картах и 2ГИС автоматически. Поднимите рейтинг с 3.8 до 4.6+ за месяц.",
  keywords: "отзывы, яндекс карты, 2гис, рейтинг, репутация, бизнес",
  icons: {
    icon: "/favicon.ico?v=2",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
