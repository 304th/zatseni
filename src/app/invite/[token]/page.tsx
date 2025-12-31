"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface InviteData {
  email: string;
  role: string;
  business: {
    id: string;
    name: string;
    slug: string;
  };
}

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [invite, setInvite] = useState<InviteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchInvite();
  }, [params.token]);

  async function fetchInvite() {
    try {
      const res = await fetch(`/api/invite/${params.token}`);
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Ошибка");
      }
      const data = await res.json();
      setInvite(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  async function handleAccept() {
    setAccepting(true);
    setError("");

    try {
      const res = await fetch(`/api/invite/${params.token}`, {
        method: "POST",
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Ошибка");
      }

      const data = await res.json();
      router.push(`/dashboard/business/${data.businessId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setAccepting(false);
    }
  }

  function getRoleLabel(role: string) {
    const labels: Record<string, string> = {
      owner: "Владелец",
      manager: "Менеджер",
    };
    return labels[role] || role;
  }

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-4xl mb-4">❌</div>
          <h1 className="text-2xl font-bold mb-2">Ошибка</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/" className="text-blue-600 hover:underline">
            На главную
          </Link>
        </div>
      </div>
    );
  }

  if (!invite) {
    return null;
  }

  // Not logged in
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-4xl mb-4">✉️</div>
          <h1 className="text-2xl font-bold mb-2">Приглашение в команду</h1>
          <p className="text-gray-600 mb-2">
            Вас приглашают в команду <strong>{invite.business.name}</strong>
          </p>
          <p className="text-gray-600 mb-6">
            Роль: <strong>{getRoleLabel(invite.role)}</strong>
          </p>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 text-sm">
              Для принятия приглашения войдите или зарегистрируйтесь с email:{" "}
              <strong>{invite.email}</strong>
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              href={`/login?callbackUrl=/invite/${params.token}`}
              className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
            >
              Войти
            </Link>
            <Link
              href={`/signup?email=${encodeURIComponent(invite.email)}&callbackUrl=/invite/${params.token}`}
              className="border border-gray-300 py-2 px-4 rounded-lg hover:bg-gray-50"
            >
              Зарегистрироваться
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Logged in but wrong email
  if (session.user?.email !== invite.email) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-2">Другой аккаунт</h1>
          <p className="text-gray-600 mb-4">
            Приглашение отправлено на <strong>{invite.email}</strong>
          </p>
          <p className="text-gray-600 mb-6">
            Вы вошли как <strong>{session.user?.email}</strong>
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800 text-sm">
              Выйдите из текущего аккаунта и войдите с email {invite.email}
            </p>
          </div>

          <Link
            href="/dashboard"
            className="text-blue-600 hover:underline"
          >
            Перейти в панель управления
          </Link>
        </div>
      </div>
    );
  }

  // Ready to accept
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
        <div className="text-4xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold mb-2">Приглашение в команду</h1>
        <p className="text-gray-600 mb-2">
          Вас приглашают в команду
        </p>
        <p className="text-xl font-semibold mb-4">{invite.business.name}</p>
        <p className="text-gray-600 mb-6">
          Роль: <strong>{getRoleLabel(invite.role)}</strong>
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={handleAccept}
            disabled={accepting}
            className="bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 font-semibold"
          >
            {accepting ? "Принятие..." : "Принять приглашение"}
          </button>
          <Link
            href="/dashboard"
            className="text-gray-600 hover:text-gray-800"
          >
            Отклонить
          </Link>
        </div>
      </div>
    </div>
  );
}
