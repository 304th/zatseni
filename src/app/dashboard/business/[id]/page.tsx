"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { api } from "@/lib/api";

export default function BusinessPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const businessId = params.id as string;

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [smsPhone, setSmsPhone] = useState("");

  const { data: business, isLoading } = useQuery({
    queryKey: ["business", businessId],
    queryFn: () => api.getBusiness(businessId),
  });

  const updateMutation = useMutation({
    mutationFn: (data: Parameters<typeof api.updateBusiness>[1]) =>
      api.updateBusiness(businessId, data),
    onSuccess: () => {
      setSuccess("Изменения сохранены");
      queryClient.invalidateQueries({ queryKey: ["business", businessId] });
    },
    onError: (err: Error) => setError(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: () => api.deleteBusiness(businessId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["businesses"] });
      router.push("/dashboard");
    },
    onError: (err: Error) => setError(err.message),
  });

  const smsMutation = useMutation({
    mutationFn: (phone: string) => api.sendSms(businessId, phone),
    onSuccess: () => {
      setShowSmsModal(false);
      setSmsPhone("");
      setSuccess("SMS отправлено!");
      queryClient.invalidateQueries({ queryKey: ["business", businessId] });
    },
    onError: (err: Error) => setError(err.message),
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");
    const formData = new FormData(e.currentTarget);
    updateMutation.mutate({
      name: formData.get("name") as string,
      phone: formData.get("phone") as string,
      address: formData.get("address") as string,
      yandexUrl: formData.get("yandexUrl") as string,
      gisUrl: formData.get("gisUrl") as string,
    });
  }

  function handleDelete() {
    if (!confirm("Удалить бизнес? Это действие необратимо.")) return;
    deleteMutation.mutate();
  }

  function handleSendSms(e: React.FormEvent) {
    e.preventDefault();
    smsMutation.mutate(smsPhone);
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
                disabled={updateMutation.isPending}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {updateMutation.isPending ? "Сохранение..." : "Сохранить"}
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
                  disabled={smsMutation.isPending}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {smsMutation.isPending ? "Отправка..." : "Отправить"}
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
