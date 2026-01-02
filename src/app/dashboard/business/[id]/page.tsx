"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

interface Business {
  id: string;
  name: string;
  slug: string;
  phone: string | null;
  address: string | null;
  yandexUrl: string | null;
  gisUrl: string | null;
  plan: string;
  smsLimit: number;
  smsUsed: number;
  userRole: "owner" | "manager";
  _count?: { members: number; requests: number };
}

export default function BusinessPage() {
  const params = useParams();
  const router = useRouter();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // SMS modal state
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [smsPhone, setSmsPhone] = useState("");
  const [sendingSms, setSendingSms] = useState(false);

  useEffect(() => {
    fetchBusiness();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function fetchBusiness() {
    try {
      const res = await fetch(`/api/businesses/${params.id}`);
      if (!res.ok) throw new Error("Бизнес не найден");
      const data = await res.json();
      setBusiness(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      phone: formData.get("phone"),
      address: formData.get("address"),
      yandexUrl: formData.get("yandexUrl"),
      gisUrl: formData.get("gisUrl"),
    };

    try {
      const res = await fetch(`/api/businesses/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Ошибка сохранения");
      }

      setSuccess("Изменения сохранены");
      fetchBusiness();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setSaving(false);
    }
  }

  async function handleSendSms(e: React.FormEvent) {
    e.preventDefault();
    setSendingSms(true);

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: business?.id,
          phone: smsPhone,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Ошибка отправки");
      }

      setShowSmsModal(false);
      setSmsPhone("");
      setSuccess("SMS отправлено!");
      fetchBusiness();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка отправки SMS");
    } finally {
      setSendingSms(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Удалить бизнес? Это действие необратимо.")) return;

    try {
      const res = await fetch(`/api/businesses/${params.id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Ошибка удаления");
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка удаления");
    }
  }

  if (loading) {
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
          <p className="text-red-600 mb-4">{error || "Бизнес не найден"}</p>
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            Вернуться к панели
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Stats Card */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {business.plan}
            </span>
            {business.userRole === "owner" && (
              <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                Владелец
              </span>
            )}
          </div>
        </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-2xl font-bold text-blue-600">
                {business.smsUsed}
              </div>
              <div className="text-xs text-gray-500">SMS отправлено</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-2xl font-bold text-green-600">
                {business.smsLimit - business.smsUsed}
              </div>
              <div className="text-xs text-gray-500">SMS осталось</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-2xl font-bold text-purple-600">
                {business.smsLimit}
              </div>
              <div className="text-xs text-gray-500">Лимит SMS</div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowSmsModal(true)}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
            >
              Отправить SMS
            </button>
            <Link
              href={`/r/${business.slug}`}
              target="_blank"
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Открыть страницу отзыва
            </Link>
          </div>

          <div className="mt-3 p-2 bg-gray-100 rounded text-sm text-gray-600">
            Ссылка для клиентов:{" "}
            <code className="bg-white px-2 py-1 rounded">
              otzovik.ai/r/{business.slug}
            </code>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
            {success}
          </div>
        )}

        {/* Edit Form - Only for owners */}
        {business.userRole === "owner" && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Редактировать</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Название</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={business.name}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Телефон</label>
                <input
                  type="tel"
                  name="phone"
                  defaultValue={business.phone || ""}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Адрес</label>
                <input
                  type="text"
                  name="address"
                  defaultValue={business.address || ""}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Яндекс Карты URL
                </label>
                <input
                  type="url"
                  name="yandexUrl"
                  defaultValue={business.yandexUrl || ""}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">2ГИС URL</label>
                <input
                  type="url"
                  name="gisUrl"
                  defaultValue={business.gisUrl || ""}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? "Сохранение..." : "Сохранить"}
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                >
                  Удалить
                </button>
              </div>
            </form>
          </div>
        )}

      {/* SMS Modal */}
      {showSmsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Отправить SMS</h3>
            <form onSubmit={handleSendSms}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Номер телефона
                </label>
                <input
                  type="tel"
                  value={smsPhone}
                  onChange={(e) => setSmsPhone(e.target.value)}
                  placeholder="+7 (999) 123-45-67"
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={sendingSms}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {sendingSms ? "Отправка..." : "Отправить"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowSmsModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
