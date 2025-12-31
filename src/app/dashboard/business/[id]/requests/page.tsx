"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface ReviewRequest {
  id: string;
  phone: string;
  status: string;
  rating: number | null;
  feedback: string | null;
  sentAt: string;
  openedAt: string | null;
  reviewedAt: string | null;
}

interface Business {
  id: string;
  name: string;
  slug: string;
}

export default function RequestsPage() {
  const params = useParams();
  const [business, setBusiness] = useState<Business | null>(null);
  const [requests, setRequests] = useState<ReviewRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function fetchData() {
    try {
      const [bizRes, reqRes] = await Promise.all([
        fetch(`/api/businesses/${params.id}`),
        fetch(`/api/businesses/${params.id}/requests`),
      ]);

      if (!bizRes.ok) throw new Error("Бизнес не найден");

      const bizData = await bizRes.json();
      const reqData = await reqRes.json();

      setBusiness(bizData);
      setRequests(reqData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  }

  function getStatusBadge(status: string) {
    const styles: Record<string, string> = {
      sent: "bg-gray-100 text-gray-800",
      opened: "bg-blue-100 text-blue-800",
      reviewed: "bg-green-100 text-green-800",
      feedback: "bg-yellow-100 text-yellow-800",
    };
    const labels: Record<string, string> = {
      sent: "Отправлено",
      opened: "Открыто",
      reviewed: "Оставлен отзыв",
      feedback: "Обратная связь",
    };
    return (
      <span className={`px-2 py-1 rounded text-xs ${styles[status] || styles.sent}`}>
        {labels[status] || status}
      </span>
    );
  }

  function getRatingStars(rating: number | null) {
    if (!rating) return "-";
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString("ru-RU", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function maskPhone(phone: string) {
    // Show only last 4 digits
    return phone.replace(/(\d{4})$/, "****$1").slice(-8);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Загрузка...</div>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-red-600 mb-4">{error || "Бизнес не найден"}</p>
            <Link href="/dashboard" className="text-blue-600 hover:underline">
              Вернуться к панели
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calculate stats
  const stats = {
    total: requests.length,
    opened: requests.filter((r) => r.openedAt).length,
    reviewed: requests.filter((r) => r.status === "reviewed").length,
    feedback: requests.filter((r) => r.status === "feedback").length,
    avgRating:
      requests.filter((r) => r.rating).reduce((sum, r) => sum + (r.rating || 0), 0) /
        (requests.filter((r) => r.rating).length || 1) || 0,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <Link
            href={`/dashboard/business/${params.id}`}
            className="text-blue-600 hover:underline"
          >
            ← Назад к {business.name}
          </Link>
        </div>

        <h1 className="text-2xl font-bold mb-6">История запросов</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
            <div className="text-xs text-gray-500">Всего</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.opened}</div>
            <div className="text-xs text-gray-500">Открыто</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.reviewed}</div>
            <div className="text-xs text-gray-500">Отзывы</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.feedback}</div>
            <div className="text-xs text-gray-500">Обр. связь</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {stats.avgRating.toFixed(1)}
            </div>
            <div className="text-xs text-gray-500">Ср. оценка</div>
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {requests.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Пока нет отправленных запросов
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Телефон
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Статус
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Оценка
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Отправлено
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Открыто
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {requests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-mono">
                        {maskPhone(req.phone)}
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(req.status)}</td>
                      <td className="px-4 py-3 text-yellow-500">
                        {getRatingStars(req.rating)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formatDate(req.sentAt)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formatDate(req.openedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Feedback Section */}
        {requests.filter((r) => r.feedback).length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Обратная связь</h2>
            <div className="space-y-4">
              {requests
                .filter((r) => r.feedback)
                .map((req) => (
                  <div key={req.id} className="border-l-4 border-yellow-400 pl-4 py-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-yellow-500">
                        {getRatingStars(req.rating)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(req.reviewedAt)}
                      </span>
                    </div>
                    <p className="text-gray-700">{req.feedback}</p>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
