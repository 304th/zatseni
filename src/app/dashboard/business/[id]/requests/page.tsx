"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { api } from "@/lib/api";

export default function RequestsPage() {
  const params = useParams();
  const businessId = params.id as string;
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const { data: business } = useQuery({
    queryKey: ["business", businessId],
    queryFn: () => api.getBusiness(businessId),
  });

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["requests", businessId],
    queryFn: () => api.getRequests(businessId),
  });

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
    return phone.replace(/(\d{4})$/, "****$1").slice(-8);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-500">Загрузка...</div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="max-w-4xl">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-red-600 mb-4">Бизнес не найден</p>
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            Вернуться к панели
          </Link>
        </div>
      </div>
    );
  }

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
    <>
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
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {requests.map((req) => {
                  const hasFeedback = !!req.feedback;
                  const isExpanded = expandedRows.has(req.id);
                  return [
                    <tr
                      key={req.id}
                      className={`hover:bg-gray-50 ${hasFeedback ? "cursor-pointer" : ""}`}
                      onClick={() => hasFeedback && toggleRow(req.id)}
                    >
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
                      <td className="px-4 py-3 text-gray-400">
                        {hasFeedback && (
                          <span className={`inline-block transition-transform ${isExpanded ? "rotate-180" : ""}`}>
                            ▼
                          </span>
                        )}
                      </td>
                    </tr>,
                    isExpanded && req.feedback && (
                      <tr key={`${req.id}-feedback`} className="bg-yellow-50">
                        <td colSpan={6} className="px-4 py-3 text-sm text-gray-700 border-l-2 border-yellow-400">
                          {req.feedback}
                        </td>
                      </tr>
                    ),
                  ];
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
