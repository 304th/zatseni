"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";

interface AnalyticsData {
  summary: {
    totalSent: number;
    opened: number;
    openRate: string;
    reviewed: number;
    reviewRate: string;
    avgRating: string;
    positiveCount: number;
    negativeCount: number;
    feedbackCount: number;
  };
  dailyData: Array<{ date: string; sent: number; opened: number; reviewed: number }>;
  ratingDistribution: number[];
  sources: Record<string, number>;
}

export default function AnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30");

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, period]);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics?businessId=${id}&period=${period}`);
      if (res.ok) {
        setData(await res.json());
      }
    } catch (e) {
      console.error("Failed to fetch analytics", e);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Загрузка...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="text-red-500">Ошибка загрузки данных</div>
      </div>
    );
  }

  const maxDaily = Math.max(...data.dailyData.map((d) => d.sent), 1);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link href={`/dashboard/business/${id}`} className="text-indigo-600 hover:underline">
              ← Назад
            </Link>
            <h1 className="text-2xl font-bold mt-2">Аналитика</h1>
          </div>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="7">7 дней</option>
            <option value="30">30 дней</option>
            <option value="90">90 дней</option>
          </select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">Отправлено</div>
            <div className="text-3xl font-bold">{data.summary.totalSent}</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">Открыто</div>
            <div className="text-3xl font-bold">{data.summary.opened}</div>
            <div className="text-sm text-green-600">{data.summary.openRate}%</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">Оценок</div>
            <div className="text-3xl font-bold">{data.summary.reviewed}</div>
            <div className="text-sm text-green-600">{data.summary.reviewRate}%</div>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-100">
            <div className="text-sm text-gray-500 mb-1">Средняя оценка</div>
            <div className="text-3xl font-bold">{data.summary.avgRating} ⭐</div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Daily Chart */}
          <div className="bg-white p-6 rounded-xl border border-gray-100">
            <h2 className="text-lg font-semibold mb-4">Активность по дням</h2>
            <div className="h-48 flex items-end gap-1">
              {data.dailyData.slice(-14).map((day) => (
                <div key={day.date} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-indigo-500 rounded-t"
                    style={{ height: `${(day.sent / maxDaily) * 100}%`, minHeight: day.sent > 0 ? "4px" : "0" }}
                    title={`${day.sent} отправлено`}
                  />
                  <div className="text-xs text-gray-400 mt-1 -rotate-45 origin-left">
                    {day.date.slice(5)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="bg-white p-6 rounded-xl border border-gray-100">
            <h2 className="text-lg font-semibold mb-4">Распределение оценок</h2>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = data.ratingDistribution[star - 1];
                const total = data.ratingDistribution.reduce((a, b) => a + b, 0);
                const pct = total > 0 ? (count / total) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-3">
                    <div className="w-8 text-sm font-medium">{star} ⭐</div>
                    <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${star >= 4 ? "bg-green-500" : star === 3 ? "bg-yellow-500" : "bg-red-500"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="w-12 text-sm text-gray-500 text-right">{count}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Positive/Negative */}
          <div className="bg-white p-6 rounded-xl border border-gray-100">
            <h2 className="text-lg font-semibold mb-4">Позитивные vs Негативные</h2>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-4xl mb-2">😊</div>
                <div className="text-2xl font-bold text-green-600">{data.summary.positiveCount}</div>
                <div className="text-sm text-gray-500">4-5 звёзд</div>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-2">😞</div>
                <div className="text-2xl font-bold text-red-600">{data.summary.negativeCount}</div>
                <div className="text-sm text-gray-500">1-3 звезды</div>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-2">💬</div>
                <div className="text-2xl font-bold text-blue-600">{data.summary.feedbackCount}</div>
                <div className="text-sm text-gray-500">Отзывов</div>
              </div>
            </div>
          </div>

          {/* Sources */}
          <div className="bg-white p-6 rounded-xl border border-gray-100">
            <h2 className="text-lg font-semibold mb-4">Источники запросов</h2>
            <div className="space-y-2">
              {Object.entries(data.sources).map(([source, count]) => (
                <div key={source} className="flex items-center justify-between">
                  <span className="capitalize">{source === "manual" ? "Ручная отправка" : source}</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
              {Object.keys(data.sources).length === 0 && (
                <div className="text-gray-500">Нет данных</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
