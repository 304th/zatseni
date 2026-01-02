"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface User {
  id: string;
  name: string | null;
  email: string | null;
}

interface Member {
  id: string;
  role: string;
  user: User;
  createdAt: string;
}

interface Invite {
  id: string;
  email: string;
  role: string;
  expiresAt: string;
  createdAt: string;
}

interface TeamData {
  owner: User;
  members: Member[];
  invites: Invite[];
  userRole: string;
}

export default function TeamPage() {
  const params = useParams();
  const [data, setData] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Invite form
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("manager");
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    fetchTeam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function fetchTeam() {
    try {
      const res = await fetch(`/api/businesses/${params.id}/team`);
      if (!res.ok) throw new Error("Не удалось загрузить команду");
      const teamData = await res.json();
      setData(teamData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true);
    setError("");

    try {
      const res = await fetch(`/api/businesses/${params.id}/team`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Ошибка");
      }

      setSuccess("Приглашение отправлено");
      setShowInviteModal(false);
      setInviteEmail("");
      fetchTeam();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setInviting(false);
    }
  }

  async function handleRemoveMember(memberId: string) {
    if (!confirm("Удалить участника из команды?")) return;

    try {
      const res = await fetch(
        `/api/businesses/${params.id}/team?memberId=${memberId}`,
        { method: "DELETE" }
      );

      if (!res.ok) throw new Error("Ошибка удаления");
      setSuccess("Участник удалён");
      fetchTeam();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    }
  }

  async function handleCancelInvite(inviteId: string) {
    if (!confirm("Отменить приглашение?")) return;

    try {
      const res = await fetch(
        `/api/businesses/${params.id}/team?inviteId=${inviteId}`,
        { method: "DELETE" }
      );

      if (!res.ok) throw new Error("Ошибка отмены");
      setSuccess("Приглашение отменено");
      fetchTeam();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка");
    }
  }

  function getRoleBadge(role: string) {
    const styles: Record<string, string> = {
      owner: "bg-purple-100 text-purple-800",
      manager: "bg-blue-100 text-blue-800",
    };
    const labels: Record<string, string> = {
      owner: "Владелец",
      manager: "Менеджер",
    };
    return (
      <span className={`px-2 py-1 rounded text-xs ${styles[role] || styles.manager}`}>
        {labels[role] || role}
      </span>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-gray-500">Загрузка...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-2xl">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-red-600 mb-4">{error || "Ошибка загрузки"}</p>
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            Вернуться к панели
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = data.userRole === "owner";

  return (
    <>
      {isOwner && (
        <div className="flex justify-end mb-6">
          <button
            onClick={() => setShowInviteModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Пригласить
          </button>
        </div>
      )}

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        {/* Owner */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-4 border-b">
            <h2 className="font-semibold">Владелец</h2>
          </div>
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                👑
              </div>
              <div>
                <div className="font-medium">
                  {data.owner.name || "Без имени"}
                </div>
                <div className="text-sm text-gray-500">{data.owner.email}</div>
              </div>
            </div>
            {getRoleBadge("owner")}
          </div>
        </div>

        {/* Members */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-4 border-b">
            <h2 className="font-semibold">
              Участники ({data.members.length})
            </h2>
          </div>
          {data.members.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Пока нет участников
            </div>
          ) : (
            <div className="divide-y">
              {data.members.map((member) => (
                <div
                  key={member.id}
                  className="p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      👤
                    </div>
                    <div>
                      <div className="font-medium">
                        {member.user.name || "Без имени"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {member.user.email}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getRoleBadge(member.role)}
                    {isOwner && (
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Удалить
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Invites */}
        {isOwner && data.invites.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b">
              <h2 className="font-semibold">
                Ожидают принятия ({data.invites.length})
              </h2>
            </div>
            <div className="divide-y">
              {data.invites.map((invite) => (
                <div
                  key={invite.id}
                  className="p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                      ✉️
                    </div>
                    <div>
                      <div className="font-medium">{invite.email}</div>
                      <div className="text-sm text-gray-500">
                        Истекает:{" "}
                        {new Date(invite.expiresAt).toLocaleDateString("ru-RU")}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getRoleBadge(invite.role)}
                    <button
                      onClick={() => handleCancelInvite(invite.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Отменить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Permissions Info */}
        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">Права доступа</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>
              <strong>Владелец:</strong> полный доступ, приглашение участников,
              удаление бизнеса
            </li>
            <li>
              <strong>Менеджер:</strong> отправка SMS, просмотр статистики
            </li>
          </ul>
        </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Пригласить участника</h3>
            <form onSubmit={handleInvite}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="email@example.com"
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Роль</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="manager">Менеджер</option>
                  <option value="owner">Владелец</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={inviting}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {inviting ? "Отправка..." : "Отправить"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
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
