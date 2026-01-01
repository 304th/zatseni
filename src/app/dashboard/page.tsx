"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { Logo1 } from "@/components/Logo";

interface Business {
  id: string;
  name: string;
  slug: string;
  plan: string;
  smsLimit: number;
  smsUsed: number;
  _count?: {
    requests: number;
  };
}

interface Stats {
  totalSent: number;
  totalOpened: number;
  totalReviewed: number;
  avgRating: number;
}

export default function Dashboard() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalSent: 0,
    totalOpened: 0,
    totalReviewed: 0,
    avgRating: 0,
  });
  const [loading, setLoading] = useState(true);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [phone, setPhone] = useState("");
  const [sendingSms, setSendingSms] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const res = await fetch("/api/businesses");
      const data = await res.json();
      setBusinesses(data);
      if (data.length > 0) {
        setSelectedBusiness(data[0]);
        // Calculate stats from all businesses
        let sent = 0;
        data.forEach((b: Business) => {
          sent += b.smsUsed;
        });
        setStats({
          totalSent: sent,
          totalOpened: Math.round(sent * 0.63),
          totalReviewed: Math.round(sent * 0.22),
          avgRating: 4.6,
        });
      }
    } catch (err) {
      console.error("Failed to fetch businesses", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSendSms(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedBusiness) return;
    setSendingSms(true);

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessId: selectedBusiness.id,
          phone,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Ошибка");
      }

      setShowModal(false);
      setPhone("");
      fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Ошибка отправки");
    } finally {
      setSendingSms(false);
    }
  }

  const statCards = [
    { label: "Отправлено", value: stats.totalSent.toString(), change: "всего SMS", icon: "📤" },
    { label: "Открыто", value: stats.totalOpened.toString(), change: "~63%", icon: "👁️" },
    { label: "Отзывов", value: stats.totalReviewed.toString(), change: "~22%", icon: "⭐" },
    { label: "Рейтинг", value: stats.avgRating.toFixed(1), change: "средний", icon: "📈" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 p-4">
        <Link href="/" className="flex items-center gap-2 mb-8">
          <Logo1 size={28} />
          <span className="text-xl font-bold text-gray-900">Отзовик</span>
        </Link>

        <nav className="space-y-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 bg-indigo-50 text-indigo-600 rounded-lg font-medium">
            <span>📊</span> Дашборд
          </Link>
          <Link href="/dashboard/business/new" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">
            <span>➕</span> Добавить бизнес
          </Link>
          <Link href="/dashboard/billing" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">
            <span>💳</span> Тариф и оплата
          </Link>
          <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">
            <span>⚙️</span> Настройки
          </Link>
        </nav>

        {/* Business list */}
        <div className="mt-6">
          <div className="text-xs font-medium text-gray-400 uppercase px-4 mb-2">Мои бизнесы</div>
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
                  className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg text-sm"
                >
                  <span>🏢</span>
                  <span className="truncate">{biz.name}</span>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="absolute bottom-4 left-4 right-4 space-y-2">
          {selectedBusiness && (
            <div className="bg-indigo-50 rounded-lg p-4">
              <div className="text-sm font-medium text-indigo-900 mb-1">
                Тариф «{selectedBusiness.plan}»
              </div>
              <div className="text-xs text-indigo-600 mb-2">
                {selectedBusiness.smsUsed} / {selectedBusiness.smsLimit} SMS
              </div>
              <div className="w-full bg-indigo-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full"
                  style={{ width: `${Math.min((selectedBusiness.smsUsed / selectedBusiness.smsLimit) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full text-sm text-gray-500 hover:text-gray-700 py-2"
          >
            Выйти
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Дашборд</h1>
            {selectedBusiness && (
              <p className="text-gray-500">{selectedBusiness.name}</p>
            )}
          </div>
          {businesses.length > 0 ? (
            <button
              onClick={() => setShowModal(true)}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center gap-2"
            >
              <span>+</span> Запросить отзыв
            </button>
          ) : (
            <Link
              href="/dashboard/business/new"
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Добавить бизнес
            </Link>
          )}
        </div>

        {businesses.length === 0 ? (
          <div className="space-y-6">
            {/* Trial banner */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold mb-1">14 дней бесплатного пробного периода</h2>
                  <p className="opacity-90">50 бесплатных SMS для тестирования сервиса</p>
                </div>
                <div className="text-4xl">🎁</div>
              </div>
            </div>

            {/* Welcome card */}
            <div className="bg-white rounded-xl border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Добро пожаловать в Отзовик!</h2>
              <p className="text-gray-500 mb-8">
                Начните собирать положительные отзывы за 3 простых шага
              </p>

              {/* Steps */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 border border-gray-100 rounded-xl">
                  <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                    1
                  </div>
                  <div className="text-3xl mb-3">🏢</div>
                  <h3 className="font-semibold text-gray-900 mb-2">Добавьте бизнес</h3>
                  <p className="text-sm text-gray-500">
                    Укажите название и ссылки на Яндекс Карты и 2ГИС
                  </p>
                </div>

                <div className="text-center p-6 border border-gray-100 rounded-xl">
                  <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                    2
                  </div>
                  <div className="text-3xl mb-3">📱</div>
                  <h3 className="font-semibold text-gray-900 mb-2">Отправьте SMS</h3>
                  <p className="text-sm text-gray-500">
                    После визита клиента отправьте SMS с просьбой оставить отзыв
                  </p>
                </div>

                <div className="text-center p-6 border border-gray-100 rounded-xl">
                  <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                    3
                  </div>
                  <div className="text-3xl mb-3">⭐</div>
                  <h3 className="font-semibold text-gray-900 mb-2">Получите отзывы</h3>
                  <p className="text-sm text-gray-500">
                    Довольные клиенты идут на карты, недовольные — пишут вам лично
                  </p>
                </div>
              </div>

              <div className="text-center">
                <Link
                  href="/dashboard/business/new"
                  className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700"
                >
                  Добавить бизнес
                </Link>
              </div>
            </div>

            {/* How it works link */}
            <div className="text-center">
              <Link href="/how-it-works" className="text-indigo-600 hover:underline text-sm">
                Подробнее о том, как работает Отзовик →
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-4 gap-6 mb-8">
              {statCards.map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-xl border border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{stat.icon}</span>
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                      {stat.change}
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-gray-500 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Businesses Grid */}
            <div className="bg-white rounded-xl border border-gray-100">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Мои бизнесы</h2>
                <Link
                  href="/dashboard/business/new"
                  className="text-indigo-600 text-sm font-medium hover:text-indigo-700"
                >
                  + Добавить
                </Link>
              </div>
              <div className="divide-y divide-gray-100">
                {businesses.map((biz) => (
                  <Link
                    key={biz.id}
                    href={`/dashboard/business/${biz.id}`}
                    className="p-4 flex items-center justify-between hover:bg-gray-50 block"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center text-xl">
                        🏢
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{biz.name}</div>
                        <div className="text-sm text-gray-500">
                          otzovik.ai/r/{biz.slug}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {biz.smsUsed} SMS
                        </div>
                        <div className="text-xs text-gray-500">отправлено</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">
                          {biz.smsLimit - biz.smsUsed}
                        </div>
                        <div className="text-xs text-gray-500">осталось</div>
                      </div>
                      <span className="text-gray-400">→</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}
      </main>

      {/* SMS Modal */}
      {showModal && selectedBusiness && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Запросить отзыв</h2>
            <p className="text-gray-500 mb-4">Отправим SMS с просьбой оставить отзыв</p>

            {businesses.length > 1 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Бизнес
                </label>
                <select
                  value={selectedBusiness.id}
                  onChange={(e) => {
                    const biz = businesses.find((b) => b.id === e.target.value);
                    if (biz) setSelectedBusiness(biz);
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                >
                  {businesses.map((biz) => (
                    <option key={biz.id} value={biz.id}>
                      {biz.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <form onSubmit={handleSendSms}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Номер телефона
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+7 (999) 123-45-67"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Предпросмотр
                </label>
                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                  Спасибо за визит в {selectedBusiness.name}!<br /><br />
                  Нам важно ваше мнение. Оставьте отзыв:<br />
                  <span className="text-indigo-600">otzovik.ai/r/{selectedBusiness.slug}</span>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={sendingSms}
                  className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
                >
                  {sendingSms ? "Отправка..." : "Отправить"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
