"use client";

import { useState, use } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { api } from "@/lib/api";

const INTEGRATIONS = [
  { id: "generic", name: "Generic API", path: "/api/webhook", desc: "Универсальный webhook для любых систем" },
  { id: "bitrix24", name: "Bitrix24", path: "/api/webhook/bitrix24", desc: "CRM и автоматизация" },
  { id: "amocrm", name: "AmoCRM", path: "/api/webhook/amocrm", desc: "CRM для продаж" },
  { id: "yclients", name: "YCLIENTS", path: "/api/webhook/yclients", desc: "Для салонов и услуг" },
  { id: "iiko", name: "iiko", path: "/api/webhook/iiko", desc: "POS для ресторанов" },
  { id: "rkeeper", name: "R-Keeper", path: "/api/webhook/rkeeper", desc: "POS для ресторанов (UCS)" },
  { id: "poster", name: "Poster", path: "/api/webhook/poster", desc: "POS система" },
];

export default function IntegrationsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [newKeyName, setNewKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  const userPlan = session?.user?.plan || "start";
  const canUseIntegrations = userPlan === "business" || userPlan === "network";

  const { data: apiKeys = [], isLoading } = useQuery({
    queryKey: ["apiKeys", id],
    queryFn: () => api.getApiKeys(id),
    enabled: canUseIntegrations,
  });

  const createKeyMutation = useMutation({
    mutationFn: () => api.createApiKey(id, newKeyName),
    onSuccess: (data) => {
      setCreatedKey(data.key);
      setNewKeyName("");
      queryClient.invalidateQueries({ queryKey: ["apiKeys", id] });
    },
  });

  const deleteKeyMutation = useMutation({
    mutationFn: (keyId: string) => api.deleteApiKey(id, keyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["apiKeys", id] });
    },
  });

  function handleCreateKey() {
    if (!newKeyName.trim()) return;
    createKeyMutation.mutate();
  }

  function handleDeleteKey(keyId: string) {
    if (!confirm("Удалить ключ? Интеграции перестанут работать.")) return;
    deleteKeyMutation.mutate(keyId);
  }

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <>
      {!canUseIntegrations && (
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 mb-8 text-white">
          <h2 className="text-xl font-bold mb-2">Интеграции доступны на платных тарифах</h2>
          <p className="mb-4 opacity-90">
            Подключите CRM, POS или любую другую систему для автоматической отправки запросов на отзыв после каждого визита клиента.
          </p>
          <div className="flex gap-3">
            <Link
              href="/pricing"
              className="bg-white text-indigo-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100"
            >
              Выбрать тариф
            </Link>
            <Link
              href={`/dashboard/business/${id}/upgrade`}
              className="bg-white/20 text-white px-6 py-2 rounded-lg font-medium hover:bg-white/30"
            >
              Сравнить планы
            </Link>
          </div>
        </div>
      )}

      {/* API Keys */}
      <div className={`bg-white rounded-xl border border-gray-100 p-6 mb-8 ${!canUseIntegrations ? "opacity-50 pointer-events-none" : ""}`}>
        <h2 className="text-lg font-semibold mb-4">API ключи</h2>

        {createdKey && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-green-800 mb-2">
              Ключ создан! Скопируйте его сейчас - он больше не будет показан:
            </p>
            <code className="bg-green-100 px-2 py-1 rounded text-sm break-all">
              {createdKey}
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(createdKey);
                alert("Скопировано!");
              }}
              className="ml-2 text-green-700 underline text-sm"
            >
              Копировать
            </button>
          </div>
        )}

        {isLoading ? (
          <p className="text-gray-500">Загрузка...</p>
        ) : (
          <>
            {apiKeys.length > 0 && (
              <div className="space-y-2 mb-4">
                {apiKeys.map((key) => (
                  <div key={key.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                    <div>
                      <div className="font-medium">{key.name}</div>
                      <div className="text-sm text-gray-500">
                        {key.key} · {key.lastUsedAt ? `Использован ${new Date(key.lastUsedAt).toLocaleDateString()}` : "Не использовался"}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteKey(key.id)}
                      className="text-red-600 text-sm hover:underline"
                    >
                      Удалить
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="Название ключа (напр. iiko)"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
              />
              <button
                onClick={handleCreateKey}
                disabled={createKeyMutation.isPending || !newKeyName.trim()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {createKeyMutation.isPending ? "..." : "Создать"}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Webhook URLs */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-lg font-semibold mb-4">Webhook URL-ы</h2>
        <p className="text-sm text-gray-600 mb-4">
          Укажите эти URL в настройках вашей CRM/POS. Добавьте ?key=ВАШ_КЛЮЧ
        </p>

        <div className="space-y-3">
          {INTEGRATIONS.map((int) => (
            <div key={int.id} className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium">{int.name}</span>
                <span className="text-xs text-gray-500">{int.desc}</span>
              </div>
              <code className="text-sm text-indigo-600 break-all">
                {baseUrl}{int.path}?key=YOUR_API_KEY
              </code>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Пример запроса</h3>
          <pre className="text-sm text-blue-800 overflow-x-auto">
{`curl -X POST "${baseUrl}/api/webhook?key=YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"phone": "+79991234567"}'`}
          </pre>
        </div>
      </div>
    </>
  );
}
