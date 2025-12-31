"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  lastUsedAt: string | null;
  createdAt: string;
}

const INTEGRATIONS = [
  { id: "generic", name: "Generic API", path: "/api/webhook", desc: "Универсальный webhook для любых систем" },
  { id: "bitrix24", name: "Bitrix24", path: "/api/webhook/bitrix24", desc: "CRM и автоматизация" },
  { id: "amocrm", name: "AmoCRM", path: "/api/webhook/amocrm", desc: "CRM для продаж" },
  { id: "yclients", name: "YCLIENTS", path: "/api/webhook/yclients", desc: "Для салонов и услуг" },
  { id: "iiko", name: "iiko", path: "/api/webhook/iiko", desc: "Для ресторанов" },
  { id: "poster", name: "Poster", path: "/api/webhook/poster", desc: "POS система" },
];

export default function IntegrationsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchKeys();
  }, [id]);

  async function fetchKeys() {
    try {
      const res = await fetch(`/api/businesses/${id}/api-keys`);
      if (res.ok) {
        setApiKeys(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch keys", err);
    } finally {
      setLoading(false);
    }
  }

  async function createKey() {
    if (!newKeyName.trim()) return;
    setCreating(true);
    try {
      const res = await fetch(`/api/businesses/${id}/api-keys`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName }),
      });
      if (res.ok) {
        const data = await res.json();
        setCreatedKey(data.key);
        setNewKeyName("");
        fetchKeys();
      }
    } catch (err) {
      console.error("Failed to create key", err);
    } finally {
      setCreating(false);
    }
  }

  async function deleteKey(keyId: string) {
    if (!confirm("Удалить ключ? Интеграции перестанут работать.")) return;
    try {
      await fetch(`/api/businesses/${id}/api-keys`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyId }),
      });
      fetchKeys();
    } catch (err) {
      console.error("Failed to delete key", err);
    }
  }

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href={`/dashboard/business/${id}`} className="text-indigo-600 hover:underline">
            ← Назад
          </Link>
        </div>

        <h1 className="text-2xl font-bold mb-2">Интеграции</h1>
        <p className="text-gray-600 mb-8">
          Подключите CRM или POS для автоматической отправки запросов на отзыв
        </p>

        {/* API Keys */}
        <div className="bg-white rounded-xl border border-gray-100 p-6 mb-8">
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

          {loading ? (
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
                        onClick={() => deleteKey(key.id)}
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
                  onClick={createKey}
                  disabled={creating || !newKeyName.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {creating ? "..." : "Создать"}
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
      </div>
    </div>
  );
}
