"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { generateSlug } from "@/lib/slug";
import { api } from "@/lib/api";

interface ParsedData {
  name?: string;
  address?: string;
  phone?: string;
  images?: string[];
  yandexUrl?: string;
}

export default function NewBusinessPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState("");
  const [parsedImages, setParsedImages] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    phone: "",
    address: "",
    yandexUrl: "",
    gisUrl: "",
  });

  const parseMutation = useMutation({
    mutationFn: (url: string) => api.parseYandex(url),
    onSuccess: (data) => {
      setFormData((prev) => ({
        ...prev,
        yandexUrl: data.yandexUrl || prev.yandexUrl,
        name: data.name || prev.name,
        address: data.address || prev.address,
        phone: data.phone || prev.phone,
        slug: data.name ? generateSlug(data.name) : prev.slug,
      }));
      if (data.images && data.images.length > 0) {
        setParsedImages(data.images);
      }
    },
    onError: (err: Error) => setError(err.message),
  });

  const createMutation = useMutation({
    mutationFn: () => {
      const data = {
        ...formData,
        images: parsedImages.length > 0 ? JSON.stringify(parsedImages) : null,
      };
      return api.createBusiness(data as Parameters<typeof api.createBusiness>[0]);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businesses"] });
      router.push("/dashboard");
    },
    onError: (err: Error) => setError(err.message),
  });

  function handleYandexPaste(url: string) {
    if (!url.includes("yandex.ru/maps") && !url.includes("yandex.com/maps")) {
      return;
    }
    setError("");
    parseMutation.mutate(url);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    createMutation.mutate();
  }

  const loading = createMutation.isPending;
  const parsing = parseMutation.isPending;

  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Добавить бизнес</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Yandex URL first */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <label className="block text-sm font-medium mb-1 text-blue-800">
              Ссылка на Яндекс Карты
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={formData.yandexUrl}
                onChange={(e) => setFormData({ ...formData, yandexUrl: e.target.value })}
                onPaste={(e) => {
                  const pasted = e.clipboardData.getData("text");
                  if (pasted) {
                    setTimeout(() => handleYandexPaste(pasted), 100);
                  }
                }}
                className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Вставьте ссылку — данные заполнятся автоматически"
              />
              {parsing && (
                <div className="flex items-center text-blue-600">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
              )}
            </div>
            <p className="text-xs text-blue-600 mt-1">
              Вставьте ссылку на ваш бизнес в Яндекс Картах — мы автоматически заполним остальные поля
            </p>
          </div>

          {/* Parsed images */}
          {parsedImages.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Фото с Яндекс Карт ({parsedImages.length})
              </label>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {parsedImages.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`Фото ${i + 1}`}
                    className="w-20 h-20 object-cover rounded-lg border flex-shrink-0"
                  />
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">
              Название бизнеса *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                const name = e.target.value;
                setFormData({
                  ...formData,
                  name,
                  slug: formData.slug || generateSlug(name),
                });
              }}
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Кофейня У Петра"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              URL-slug *
            </label>
            <div className="flex items-center">
              <span className="text-gray-500 mr-1">zatseni.ru/r/</span>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                required
                pattern="[a-z0-9-]+"
                className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="kofeyna-u-petra"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Только латинские буквы, цифры и дефис
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Телефон</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="+7 (999) 123-45-67"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Адрес</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="г. Москва, ул. Примерная, д. 1"
            />
          </div>

          <div className="border-t pt-4 mt-4">
            <h3 className="font-medium mb-3">Дополнительные ссылки</h3>
            <div>
              <label className="block text-sm font-medium mb-1">2ГИС</label>
              <input
                type="url"
                value={formData.gisUrl}
                onChange={(e) => setFormData({ ...formData, gisUrl: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="https://2gis.ru/..."
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading || parsing}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Создание..." : "Создать бизнес"}
            </button>
            <Link
              href="/dashboard"
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Отмена
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
