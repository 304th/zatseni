"use client";

import { useState } from "react";
import SocialButtons from "./SocialButtons";
import TelegramLogin from "./TelegramLogin";
import PhoneAuth from "./PhoneAuth";

interface AuthProvidersProps {
  plan?: string;
  onSuccess?: () => void;
}

export default function AuthProviders({ plan, onSuccess }: AuthProvidersProps) {
  const [showPhone, setShowPhone] = useState(false);

  return (
    <div className="space-y-4">
      {/* OAuth buttons */}
      <SocialButtons plan={plan} />

      {/* Telegram */}
      <div className="flex justify-center">
        <TelegramLogin plan={plan} onSuccess={onSuccess} />
      </div>

      {/* Phone auth toggle */}
      {!showPhone ? (
        <button
          onClick={() => setShowPhone(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
        >
          <span className="text-lg">📱</span>
          <span className="font-medium text-gray-700">Войти по номеру телефона</span>
        </button>
      ) : (
        <div className="border border-gray-200 rounded-lg p-4">
          <PhoneAuth plan={plan} onSuccess={onSuccess} />
        </div>
      )}

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-white text-gray-500">или по email</span>
        </div>
      </div>
    </div>
  );
}
