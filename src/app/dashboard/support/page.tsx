"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function SupportDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [tab, setTab] = useState<"businesses" | "users">("businesses");

  const isAuthorized = !!(session?.user?.role && ["support", "admin"].includes(session.user.role));

  useEffect(() => {
    if (status === "loading") return;
    if (!isAuthorized) {
      router.push("/dashboard");
    }
  }, [status, isAuthorized, router]);

  const { data: businesses = [], isLoading: loadingBiz } = useQuery({
    queryKey: ["businesses"],
    queryFn: api.getBusinesses,
    enabled: isAuthorized,
  });

  const { data: users = [], isLoading: loadingUsers } = useQuery({
    queryKey: ["supportUsers"],
    queryFn: api.getSupportUsers,
    enabled: isAuthorized,
  });

  const loading = status === "loading" || loadingBiz || loadingUsers;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-500">Загрузка...</div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <>
      <div className="mb-8">
        <div className="bg-yellow-50 text-yellow-800 text-xs px-3 py-2 rounded-lg inline-block mb-4">
          Режим поддержки
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Панель поддержки</h1>
        <p className="text-gray-500">Все бизнесы и пользователи системы</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border border-gray-100">
          <div className="text-3xl font-bold text-gray-900">{businesses.length}</div>
          <div className="text-gray-500 text-sm">Бизнесов</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100">
          <div className="text-3xl font-bold text-gray-900">{users.length}</div>
          <div className="text-gray-500 text-sm">Пользователей</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100">
          <div className="text-3xl font-bold text-gray-900">
            {users.filter((u) => u.emailVerified).length}
          </div>
          <div className="text-gray-500 text-sm">Подтвержденных</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100">
          <div className="text-3xl font-bold text-gray-900">
            {businesses.reduce((acc, b) => acc + b.smsUsed, 0)}
          </div>
          <div className="text-gray-500 text-sm">SMS отправлено</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setTab("businesses")}
          className={`px-4 py-2 rounded-lg font-medium ${tab === "businesses" ? "bg-indigo-600 text-white" : "bg-white text-gray-600"}`}
        >
          Бизнесы ({businesses.length})
        </button>
        <button
          onClick={() => setTab("users")}
          className={`px-4 py-2 rounded-lg font-medium ${tab === "users" ? "bg-indigo-600 text-white" : "bg-white text-gray-600"}`}
        >
          Пользователи ({users.length})
        </button>
      </div>

      {tab === "businesses" && (
        <div className="bg-white rounded-xl border border-gray-100">
          <div className="divide-y divide-gray-100">
            {businesses.map((biz) => (
              <Link
                key={biz.id}
                href={`/dashboard/business/${biz.id}`}
                className="p-4 flex items-center justify-between hover:bg-gray-50 block"
              >
                <div>
                  <div className="font-medium text-gray-900">{biz.name}</div>
                  <div className="text-sm text-gray-500">
                    {biz.slug}
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-sm text-gray-600">
                    {biz.smsUsed}/{biz.smsLimit} SMS
                  </div>
                  <span className="text-gray-400">→</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {tab === "users" && (
        <div className="bg-white rounded-xl border border-gray-100">
          <div className="divide-y divide-gray-100">
            {users.map((user) => (
              <div key={user.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">
                    {user.name || user.email}
                    {user.role !== "user" && (
                      <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                        {user.role}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
                <div className="flex items-center gap-6 text-sm text-gray-600">
                  <div>{user._count.businesses} бизнес(а)</div>
                  <div>
                    {user.emailVerified ? (
                      <span className="text-green-600">Подтвержден</span>
                    ) : (
                      <span className="text-orange-500">Не подтвержден</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
