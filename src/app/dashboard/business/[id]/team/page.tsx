"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { api } from "@/lib/api";

export default function TeamPage() {
  const params = useParams();
  const queryClient = useQueryClient();
  const businessId = params.id as string;

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("manager");

  const { data, isLoading } = useQuery({
    queryKey: ["team", businessId],
    queryFn: () => api.getTeam(businessId),
  });

  const inviteMutation = useMutation({
    mutationFn: () => api.inviteTeamMember(businessId, inviteEmail, inviteRole),
    onSuccess: () => {
      setSuccess("Приглашение отправлено");
      setShowInviteModal(false);
      setInviteEmail("");
      queryClient.invalidateQueries({ queryKey: ["team", businessId] });
    },
    onError: (err: Error) => setError(err.message),
  });

  const removeMemberMutation = useMutation({
    mutationFn: (memberId: string) => api.removeTeamMember(businessId, memberId),
    onSuccess: () => {
      setSuccess("Участник удалён");
      queryClient.invalidateQueries({ queryKey: ["team", businessId] });
    },
    onError: (err: Error) => setError(err.message),
  });

  const cancelInviteMutation = useMutation({
    mutationFn: (inviteId: string) => api.cancelInvite(businessId, inviteId),
    onSuccess: () => {
      setSuccess("Приглашение отменено");
      queryClient.invalidateQueries({ queryKey: ["team", businessId] });
    },
    onError: (err: Error) => setError(err.message),
  });

  function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    inviteMutation.mutate();
  }

  function handleRemoveMember(memberId: string) {
    if (!confirm("Удалить участника из команды?")) return;
    removeMemberMutation.mutate(memberId);
  }

  function handleCancelInvite(inviteId: string) {
    if (!confirm("Отменить приглашение?")) return;
    cancelInviteMutation.mutate(inviteId);
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

  if (isLoading) {
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
                  disabled={inviteMutation.isPending}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {inviteMutation.isPending ? "Отправка..." : "Отправить"}
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
