"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { Logo1 } from "@/components/Logo";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  emailVerified: string | null;
  createdAt: string;
  _count: { businesses: number };
}

interface Business {
  id: string;
  name: string;
  slug: string;
  plan: string;
  smsUsed: number;
  smsLimit: number;
  user?: { email: string; name: string | null };
  _count?: { requests: number; members: number };
}

export default function SupportDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"businesses" | "users">("businesses");

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user?.role || !["support", "admin"].includes(session.user.role)) {
      router.push("/dashboard");
      return;
    }
    fetchData();
  }, [status, session, router]);

  async function fetchData() {
    try {
      const [bizRes, usersRes] = await Promise.all([
        fetch("/api/businesses"),
        fetch("/api/support/users"),
      ]);
      if (bizRes.ok) setBusinesses(await bizRes.json());
      if (usersRes.ok) setUsers(await usersRes.json());
    } catch (err) {
      console.error("Failed to fetch", err);
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 p-4">
        <Link href="/" className="flex items-center gap-2 mb-8">
          <Logo1 size={28} />
          <span className="text-xl font-bold text-gray-900">Отзовик</span>
        </Link>

        <div className="bg-yellow-50 text-yellow-800 text-xs px-3 py-2 rounded-lg mb-4">
          Режим поддержки
        </div>

        <nav className="space-y-1">
          <Link href="/dashboard/support" className="flex items-center gap-3 px-4 py-3 bg-indigo-50 text-indigo-600 rounded-lg font-medium">
            <span>🛠️</span> Поддержка
          </Link>
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-lg">
            <span>📊</span> Мой дашборд
          </Link>
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full text-sm text-gray-500 hover:text-gray-700 py-2"
          >
            Выйти
          </button>
        </div>
      </aside>

      <main className="ml-64 p-8">
        <div className="mb-8">
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
                      {biz.user?.email || "—"} · {biz.slug}
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
      </main>
    </div>
  );
}
