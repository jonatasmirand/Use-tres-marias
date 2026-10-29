"use client";

import { useState } from "react";
import Link from "next/link";
import { ManagedUser, GetUsersResponse, UserRole, UserStatus } from "@/types/user";

interface AccountsTableClientProps {
  initialData: GetUsersResponse;
  currentAdminId: string;
  initialFilterRole: "all" | UserRole;
  initialFilterStatus: "all" | UserStatus;
  initialSearch: string;
}

export default function AccountsTableClient({
  initialData,
  currentAdminId,
  initialFilterRole,
  initialFilterStatus,
  initialSearch,
}: AccountsTableClientProps) {
  const [users, setUsers] = useState<ManagedUser[]>(initialData.users);
  const [search, setSearch] = useState(initialSearch);
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>(initialFilterRole);
  const [statusFilter, setStatusFilter] = useState<"all" | UserStatus>(initialFilterStatus);

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  // Modal de Confirmação de Alteração de Acesso (Bloqueio / Reativação)
  const [actionTarget, setActionTarget] = useState<{
    user: ManagedUser;
    action: "block" | "unblock";
  } | null>(null);
  const [blockReason, setBlockReason] = useState("");
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // Modal de Convite / Cadastro de Novo Administrador
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitePassword, setInvitePassword] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [isInviting, setIsInviting] = useState(false);

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "Nunca acessou";
    try {
      return new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
        timeZone: "America/Sao_Paulo",
      }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  };

  const handleCopyId = async (id: string) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Filtragem dinâmica instantânea na interface
  const filteredUsers = users.filter((u) => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (statusFilter !== "all" && u.status !== statusFilter) return false;

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const matchName = u.name.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      const matchId = u.id.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchId) return false;
    }
    return true;
  });

  // Executa bloqueio ou reativação com confirmação
  const handleConfirmAction = async () => {
    if (!actionTarget) return;

    setIsProcessingAction(true);
    setFeedback(null);

    const isBlocking = actionTarget.action === "block";

    try {
      const res = await fetch(`/api/admin/users/${actionTarget.user.id}/block`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          block: isBlocking,
          reason: blockReason.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Erro ao atualizar situação da conta.");
      }

      // Atualiza usuário no estado local
      setUsers((prev) =>
        prev.map((u) =>
          u.id === actionTarget.user.id
            ? {
                ...u,
                status: isBlocking ? "blocked" : "active",
                blocked_at: isBlocking ? new Date().toISOString() : null,
                blocked_reason: isBlocking ? blockReason.trim() || null : null,
              }
            : u
        )
      );

      setFeedback({
        type: "success",
        message: data.message || `Situação da conta alterada com sucesso.`,
      });

      setTimeout(() => setFeedback(null), 5000);
      setActionTarget(null);
      setBlockReason("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao alterar acesso.";
      setFeedback({ type: "error", message: msg });
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Executa cadastro / convite de administrador
  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError("");

    const cleanEmail = inviteEmail.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setInviteError("Informe um endereço de e-mail corporativo válido.");
      return;
    }

    if (invitePassword && invitePassword.length < 6) {
      setInviteError("A senha temporária deve conter no mínimo 6 caracteres.");
      return;
    }

    setIsInviting(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: cleanEmail,
          name: inviteName.trim() || undefined,
          password: invitePassword || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Erro ao registrar administrador.");
      }

      if (data.user) {
        setUsers((prev) => [data.user, ...prev]);
      }

      setFeedback({
        type: "success",
        message: data.message || "Administrador registrado com sucesso.",
      });

      setTimeout(() => setFeedback(null), 5000);
      setIsInviteOpen(false);
      setInviteEmail("");
      setInviteName("");
      setInvitePassword("");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao registrar administrador.";
      setInviteError(msg);
    } finally {
      setIsInviting(false);
    }
  };

  const activeCount = users.filter((u) => u.status === "active").length;
  const blockedCount = users.filter((u) => u.status === "blocked").length;
  const customersCount = users.filter((u) => u.role === "customer").length;
  const adminsCount = users.filter((u) => u.role === "admin").length;

  return (
    <div className="space-y-5">
      {/* Mensagem de Feedback Global */}
      {feedback && (
        <div
          role="alert"
          className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs transition animate-fade-in ${
            feedback.type === "success"
              ? "bg-[#eaf3ee] text-[#1f6b4f] border border-[#b2d3c2]"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          <span>{feedback.message}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-sm font-bold opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {/* Barra de Filtros, Pesquisa e Ação */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-5 rounded-2xl border border-[#e6e7e4] shadow-xs">
        {/* Campo de Busca */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, e-mail ou identificador..."
            className="w-full pl-9 pr-8 py-2.5 text-xs rounded-xl border border-[#e6e7e4] bg-[#fafbf9] focus:bg-white focus:border-[#183428] outline-none transition"
          />
          <span className="absolute left-3 top-3 text-[#7a857f] text-xs">🔍</span>
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-2.5 text-xs text-[#7a857f] hover:text-[#202522]"
            >
              ✕
            </button>
          )}
        </div>

        {/* Pílulas de Filtro e Botão de Convite */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Filtro por Papel */}
          <div className="flex items-center gap-1 border border-[#e6e7e4] p-1 rounded-xl bg-[#fafbf9]">
            <button
              type="button"
              onClick={() => setRoleFilter("all")}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition ${
                roleFilter === "all"
                  ? "bg-[#183428] text-white shadow-xs"
                  : "text-[#5f6863] hover:text-[#202522]"
              }`}
            >
              Todos ({users.length})
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter("customer")}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition ${
                roleFilter === "customer"
                  ? "bg-[#183428] text-white shadow-xs"
                  : "text-[#5f6863] hover:text-[#202522]"
              }`}
            >
              Clientes ({customersCount})
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter("admin")}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition ${
                roleFilter === "admin"
                  ? "bg-[#183428] text-white shadow-xs"
                  : "text-[#5f6863] hover:text-[#202522]"
              }`}
            >
              Admins ({adminsCount})
            </button>
          </div>

          {/* Filtro por Situação */}
          <div className="flex items-center gap-1 border border-[#e6e7e4] p-1 rounded-xl bg-[#fafbf9]">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition ${
                statusFilter === "all"
                  ? "bg-[#1f6b4f] text-white shadow-xs"
                  : "text-[#5f6863] hover:text-[#202522]"
              }`}
            >
              Todas
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("active")}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition ${
                statusFilter === "active"
                  ? "bg-[#1f6b4f] text-white shadow-xs"
                  : "text-[#5f6863] hover:text-[#202522]"
              }`}
            >
              Ativas ({activeCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("blocked")}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition ${
                statusFilter === "blocked"
                  ? "bg-red-700 text-white shadow-xs"
                  : "text-[#5f6863] hover:text-[#202522]"
              }`}
            >
              Bloqueadas ({blockedCount})
            </button>
          </div>

          {/* Botão Convidar / Novo Admin */}
          <button
            type="button"
            onClick={() => {
              setInviteError("");
              setIsInviteOpen(true);
            }}
            className="px-3.5 py-2 bg-[#183428] hover:bg-[#10241b] text-white text-xs font-semibold rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer ml-auto sm:ml-0"
          >
            <span>+</span>
            <span>Novo Administrador</span>
          </button>
        </div>
      </div>

      {/* Tabela de Contas */}
      <div className="bg-white rounded-2xl border border-[#e6e7e4] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#e6e7e4] bg-[#fafbf9] text-[11px] font-bold uppercase tracking-wider text-[#7a857f]">
                <th className="py-3.5 px-4">Usuário</th>
                <th className="py-3.5 px-4">Identificador (ID)</th>
                <th className="py-3.5 px-4">Tipo</th>
                <th className="py-3.5 px-4">Situação</th>
                <th className="py-3.5 px-4">Cadastro</th>
                <th className="py-3.5 px-4">Último Acesso</th>
                <th className="py-3.5 px-4">Pedidos</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f2f0]">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-[#7a857f]">
                    <span className="text-3xl block mb-2">👤</span>
                    Nenhuma conta encontrada com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isCurrentAdmin = user.id === currentAdminId;
                  const isCustomer = user.role === "customer";
                  const isBlocked = user.status === "blocked";

                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-[#fafbf9] transition-colors group"
                    >
                      {/* Nome e E-mail */}
                      <td className="py-4 px-4">
                        <div className="font-semibold text-[#182620]">{user.name}</div>
                        <div className="text-[11px] text-[#5f6863]">{user.email}</div>
                      </td>

                      {/* ID com botão copiar */}
                      <td className="py-4 px-4 font-mono text-[11px] text-[#7a857f]">
                        <div className="flex items-center gap-1.5">
                          <span className="max-w-[110px] truncate" title={user.id}>
                            {user.id}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyId(user.id)}
                            className="p-1 hover:text-[#202522] rounded transition text-[10px]"
                            title="Copiar ID"
                          >
                            {copiedId === user.id ? "✓" : "📋"}
                          </button>
                        </div>
                      </td>

                      {/* Tipo / Papel */}
                      <td className="py-4 px-4">
                        {user.role === "admin" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#183428] text-white">
                            <span>🛡️</span>
                            <span>Admin</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#eaf3ee] text-[#1f6b4f] border border-[#b2d3c2]">
                            <span>👤</span>
                            <span>Cliente</span>
                          </span>
                        )}
                      </td>

                      {/* Situação */}
                      <td className="py-4 px-4">
                        {isBlocked ? (
                          <div>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
                              <span className="size-1.5 rounded-full bg-red-600" />
                              <span>Bloqueada</span>
                            </span>
                            {user.blocked_reason && (
                              <p className="text-[10px] text-red-700 mt-0.5 max-w-[160px] truncate" title={user.blocked_reason}>
                                {user.blocked_reason}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="size-1.5 rounded-full bg-emerald-600" />
                            <span>Ativa</span>
                          </span>
                        )}
                      </td>

                      {/* Cadastro */}
                      <td className="py-4 px-4 text-[11px] text-[#5f6863]">
                        {formatDate(user.created_at)}
                      </td>

                      {/* Último Acesso */}
                      <td className="py-4 px-4 text-[11px] text-[#5f6863]">
                        {formatDate(user.last_sign_in_at)}
                      </td>

                      {/* Pedidos */}
                      <td className="py-4 px-4">
                        {isCustomer ? (
                          user.orders_count && user.orders_count > 0 ? (
                            <Link
                              href={`/admin/pedidos?clienteId=${encodeURIComponent(user.id)}&clienteEmail=${encodeURIComponent(user.email)}&clienteNome=${encodeURIComponent(user.name)}`}
                              className="text-xs font-semibold text-[#1f6b4f] hover:underline inline-flex items-center gap-1"
                              title={`Ver pedidos de ${user.name} (${user.email})`}
                            >
                              <span>{user.orders_count} {user.orders_count === 1 ? "pedido" : "pedidos"}</span>
                              <span aria-hidden="true">→</span>
                            </Link>
                          ) : (
                            <span className="text-[11px] text-[#7a857f]">0 pedidos</span>
                          )
                        ) : (
                          <span className="text-[11px] text-[#7a857f]">—</span>
                        )}
                      </td>

                      {/* Ações */}
                      <td className="py-4 px-4 text-right">
                        {isCurrentAdmin ? (
                          <span className="text-[11px] font-semibold text-[#7a857f] italic">
                            (Sua conta)
                          </span>
                        ) : isCustomer ? (
                          isBlocked ? (
                            <button
                              type="button"
                              onClick={() => {
                                setBlockReason("");
                                setActionTarget({ user, action: "unblock" });
                              }}
                              className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-lg hover:bg-emerald-100 transition cursor-pointer"
                            >
                              Reativar Conta
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setBlockReason("");
                                setActionTarget({ user, action: "block" });
                              }}
                              className="px-2.5 py-1 text-xs font-semibold bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition cursor-pointer"
                            >
                              Bloquear
                            </button>
                          )
                        ) : (
                          <span className="text-[11px] text-[#7a857f]">Admin ativo</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE CONFIRMAÇÃO: Bloquear ou Reativar Conta */}
      {actionTarget && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#e6e7e4] space-y-4">
            <div className="flex items-center justify-between border-b border-[#f0f2f0] pb-3">
              <h3 className="font-serif text-lg font-bold text-[#182620]">
                {actionTarget.action === "block" ? "Bloquear Conta de Cliente" : "Reativar Conta"}
              </h3>
              <button
                type="button"
                onClick={() => setActionTarget(null)}
                className="text-[#7a857f] hover:text-[#202522] text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#5f6863] leading-relaxed">
              Você está prestes a{" "}
              <strong className="text-[#182620]">
                {actionTarget.action === "block" ? "bloquear o acesso de" : "reativar a conta de"}
              </strong>{" "}
              <span className="font-semibold text-[#183428]">{actionTarget.user.name}</span> (
              {actionTarget.user.email}).
            </p>

            {actionTarget.action === "block" && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7a857f] mb-1">
                  Motivo do Bloqueio (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="Ex: Contestação de pagamento, uso indevido da conta..."
                  className="w-full p-2.5 text-xs rounded-xl border border-[#e6e7e4] bg-[#fafbf9] focus:bg-white focus:border-[#183428] outline-none transition resize-none"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setActionTarget(null)}
                disabled={isProcessingAction}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-[#e6e7e4] text-[#5f6863] hover:bg-[#fafbf9] transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                disabled={isProcessingAction}
                className={`px-4 py-2 text-xs font-bold rounded-xl text-white transition shadow-xs ${
                  actionTarget.action === "block"
                    ? "bg-red-700 hover:bg-red-800"
                    : "bg-[#183428] hover:bg-[#10241b]"
                }`}
              >
                {isProcessingAction
                  ? "Processando..."
                  : actionTarget.action === "block"
                  ? "Confirmar Bloqueio"
                  : "Confirmar Reativação"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CADASTRO / CONVITE DE NOVO ADMINISTRADOR */}
      {isInviteOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#e6e7e4] space-y-4">
            <div className="flex items-center justify-between border-b border-[#f0f2f0] pb-3">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#182620]">
                  Novo Administrador
                </h3>
                <p className="text-[11px] text-[#5f6863]">
                  Conceda acesso restrito de gerenciamento ao painel.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsInviteOpen(false)}
                className="text-[#7a857f] hover:text-[#202522] text-sm"
              >
                ✕
              </button>
            </div>

            {inviteError && (
              <div className="p-3 rounded-xl text-xs bg-red-50 text-red-700 border border-red-200">
                {inviteError}
              </div>
            )}

            <form onSubmit={handleInviteSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7a857f] mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="Ex: Roberta Alencar"
                  className="w-full p-2.5 text-xs rounded-xl border border-[#e6e7e4] bg-[#fafbf9] focus:bg-white focus:border-[#183428] outline-none transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7a857f] mb-1">
                  E-mail Corporativo
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="admin@usetresmarias.com.br"
                  className="w-full p-2.5 text-xs rounded-xl border border-[#e6e7e4] bg-[#fafbf9] focus:bg-white focus:border-[#183428] outline-none transition"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7a857f] mb-1">
                  Senha Inicial (Opcional)
                </label>
                <input
                  type="password"
                  value={invitePassword}
                  onChange={(e) => setInvitePassword(e.target.value)}
                  placeholder="Deixe em branco para enviar convite por e-mail"
                  className="w-full p-2.5 text-xs rounded-xl border border-[#e6e7e4] bg-[#fafbf9] focus:bg-white focus:border-[#183428] outline-none transition"
                />
                <span className="text-[10px] text-[#7a857f] block mt-1">
                  Se preenchida (mín. 6 caracteres), o acesso é criado imediatamente. Se em branco, um e-mail com link de convite é disparado.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#f0f2f0]">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  disabled={isInviting}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-[#e6e7e4] text-[#5f6863] hover:bg-[#fafbf9] transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isInviting}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-[#183428] hover:bg-[#10241b] text-white transition shadow-xs disabled:opacity-50"
                >
                  {isInviting ? "Processando..." : "Confirmar Cadastro"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

