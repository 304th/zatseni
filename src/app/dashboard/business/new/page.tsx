"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewBusinessPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name"),
      slug: formData.get("slug"),
      phone: formData.get("phone"),
      address: formData.get("address"),
      yandexUrl: formData.get("yandexUrl"),
      gisUrl: formData.get("gisUrl"),
    };

    try {
      const res = await fetch("/api/businesses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Ошибка создания");
      }

      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  function generateSlug(name: string) {
    return name
      .toLowerCase()
      .replace(/[а-яё]/g, (char) => {
        const map: Record<string, string> = {
          а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo",
          ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m",
          н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u",
          ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sch",
          ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
        };
        return map[char] || char;
      })
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

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
            <div>
              <label className="block text-sm font-medium mb-1">
                Название бизнеса *
              </label>
              <input
                type="text"
                name="name"
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Кофейня У Петра"
                onChange={(e) => {
                  const slugInput = document.querySelector(
                    'input[name="slug"]'
                  ) as HTMLInputElement;
                  if (slugInput && !slugInput.dataset.manual) {
                    slugInput.value = generateSlug(e.target.value);
                  }
                }}
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
                  name="slug"
                  required
                  pattern="[a-z0-9-]+"
                  className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="kofeyna-u-petra"
                  onChange={(e) => {
                    (e.target as HTMLInputElement).dataset.manual = "true";
                  }}
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
                name="phone"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="+7 (999) 123-45-67"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Адрес</label>
              <input
                type="text"
                name="address"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="г. Москва, ул. Примерная, д. 1"
              />
            </div>

            <div className="border-t pt-4 mt-4">
              <h3 className="font-medium mb-3">Ссылки на карты (для отзывов)</h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Яндекс Карты
                  </label>
                  <input
                    type="url"
                    name="yandexUrl"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="https://yandex.ru/maps/org/..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">2ГИС</label>
                  <input
                    type="url"
                    name="gisUrl"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="https://2gis.ru/..."
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
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
