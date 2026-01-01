"use client";

import { signIn } from "next-auth/react";

interface SocialButtonsProps {
  plan?: string;
}

export default function SocialButtons({ plan }: SocialButtonsProps) {
  const callbackUrl = plan
    ? `/dashboard?plan=${plan}`
    : "/dashboard";

  const handleYandex = () => {
    signIn("yandex", { callbackUrl });
  };

  const handleVK = () => {
    signIn("vk", { callbackUrl });
  };

  return (
    <div className="space-y-3">
      {/* Yandex button */}
      <button
        onClick={handleYandex}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z"
            fill="#FC3F1D"
          />
          <path
            d="M13.3 18H11.1V13.2L8.5 7H10.9L12.2 10.8L13.5 7H15.9L13.3 13.2V18Z"
            fill="white"
          />
        </svg>
        <span className="font-medium text-gray-700">Войти через Яндекс</span>
      </button>

      {/* VK button */}
      <button
        onClick={handleVK}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24Z"
            fill="#0077FF"
          />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12.7104 16.7C7.50044 16.7 4.53044 13.17 4.40044 7.30005H6.90044C6.99044 11.62 8.89044 13.44 10.4004 13.83V7.30005H12.7404V11.04C14.2304 10.88 15.7904 9.17005 16.3504 7.30005H18.6904C18.2604 9.61005 16.5804 11.32 15.4104 12.04C16.5804 12.63 18.4904 14.11 19.2304 16.7H16.6404C16.0504 14.84 14.5904 13.4 12.7404 13.21V16.7H12.7104Z"
            fill="white"
          />
        </svg>
        <span className="font-medium text-gray-700">Войти через VK</span>
      </button>
    </div>
  );
}
