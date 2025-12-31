"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    if (!token || !email) {
      setError("Недействительная ссылка");
      setStatus("error");
      return;
    }

    verifyEmail(token, email);
  }, [searchParams]);

  async function verifyEmail(token: string, email: string) {
    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Ошибка");
      }

      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
      setStatus("error");
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Подтверждение email...</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-4xl mb-4">❌</div>
          <h1 className="text-2xl font-bold mb-2">Ошибка</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/login"
            className="text-blue-600 hover:underline"
          >
            Перейти к входу
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="text-4xl mb-4">✅</div>
        <h1 className="text-2xl font-bold mb-2">Email подтвержден!</h1>
        <p className="text-gray-600 mb-6">
          Ваш email успешно подтвержден. Теперь вы можете войти в систему.
        </p>
        <Link
          href="/login"
          className="inline-block bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700"
        >
          Войти
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-gray-600">Загрузка...</p>
          </div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
}
