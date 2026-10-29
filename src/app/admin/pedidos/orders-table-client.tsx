"use client";

import { useState } from "react";
import Link from "next/link";
import { Order, OrderStatus, ORDER_STATUS_MAP } from "@/types/order";

interface OrdersTableClientProps {
  initialOrders: Order[];
  totalCount: number;
  activeCount: number;
  completedCount: number;
  statusCounts: Record<OrderStatus, number>;
  initialError?: string | null;
  currentFilter: string;
  currentSearch: string;
  clienteFilter?: {
    id: string;
    email: string;
    name: string;
  } | null;
  siteUrl?: string;
}

export default function OrdersTableClient({
  initialOrders,
  totalCount,
  activeCount,
  completedCount,
  statusCounts,
  initialError,
  currentFilter,
  currentSearch,
  clienteFilter,
  siteUrl,
}: OrdersTableClientProps) {
  const [filter, setFilter] = useState(currentFilter);
  const [search, setSearch] = useState(currentSearch);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "Data não informada";
    try {
      const parsed = new Date(dateStr);
      if (isNaN(parsed.getTime())) return dateStr;
      return new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
        timeZone: "America/Sao_Paulo",
      }).format(parsed);
    } catch {
      return dateStr;
    }
  };

  // Filtra em memória para resposta instantânea ao digitar na busca ou alterar abas
  const filteredOrders = initialOrders.filter((order) => {
    // 1. Filtro por status / aba
    if (filter === "ativos") {
      if (order.status === "completed") return false;
    } else if (filter === "concluidos") {
      if (order.status !== "completed") return false;
    } else if (filter !== "todos" && order.status !== filter) {
      return false;
    }

    // 2. Busca ampla insensível a maiúsculas/minúsculas (referência, nome, e-mail, telefone)
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const matchRef = (order.reference || "").toLowerCase().includes(q);
      const matchClient = (order.customer_name || "").toLowerCase().includes(q);
      const matchEmail = (order.customer_email || "").toLowerCase().includes(q);
      const cleanDigits = q.replace(/\D/g, "");
      const matchPhone =
        cleanDigits.length >= 4 &&
        (order.customer_phone || "").replace(/\D/g, "").includes(cleanDigits);

      if (!matchRef && !matchClient && !matchEmail && !matchPhone) return false;
    }

    return true;
  });

  const handleCopyLink = async (order: Order) => {
    const identifier = order.tracking_token || order.id;
    const baseDomain = siteUrl ? siteUrl.replace(/\/+$/, "") : origin;
    const trackingUrl = `${baseDomain}/pedido/acompanhar/${identifier}`;

    try {
      await navigator.clipboard.writeText(trackingUrl);
      setCopiedId(order.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setCopiedId(order.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Banner de Filtro de Cliente Ativo (se navegado a partir de Gerenciamento de Contas) */}
      {clienteFilter && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[#eaf3ee] border border-[#b8ddcb] px-4 py-3 rounded-2xl text-xs text-[#183428]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-[13px] inline-flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-[#1f6b4f]" />
              Filtrando pedidos do cliente:
            </span>
            <span className="font-bold bg-white px-2.5 py-0.5 rounded-lg border border-[#b8ddcb] text-[#182620]">
              {clienteFilter.name || clienteFilter.email}
            </span>
            {clienteFilter.email && (
              <span className="text-[#5f6863] text-[11px] font-mono">
                ({clienteFilter.email})
              </span>
            )}
            <span className="text-[11px] font-semibold text-[#1f6b4f] bg-white/80 px-2 py-0.5 rounded-md border border-[#b8ddcb]">
              {totalCount} {totalCount === 1 ? "pedido encontrado" : "pedidos encontrados"}
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              window.location.href = "/admin/pedidos";
            }}
            className="inline-flex items-center gap-1.5 font-bold text-[#1f6b4f] hover:text-[#10241b] bg-white hover:bg-[#fafbf9] px-3 py-1.5 rounded-xl border border-[#b8ddcb] shadow-2xs transition self-start sm:self-auto"
            title="Remover filtro de cliente e voltar à listagem geral"
          >
            <span>✕</span>
            <span>Limpar filtro de cliente (Ver todos os pedidos)</span>
          </button>
        </div>
      )}

      {/* Alerta de Erro de Banco de Dados (quando a consulta ao Supabase falhar) */}
      {initialError && (
        <div className="bg-[#fdf2f2] border border-[#f8b4b4] p-6 rounded-2xl text-center space-y-3">
          <span className="text-3xl block">⚠️</span>
          <h3 className="font-bold text-sm text-[#9b1c1c]">
            Não foi possível consultar os pedidos no momento
          </h3>
          <p className="text-xs text-[#771d1d] max-w-lg mx-auto">
            {initialError}
          </p>
          <div>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-1 px-4 py-2 bg-[#9b1c1c] text-white text-xs font-semibold rounded-xl hover:bg-[#771d1d] transition shadow-xs"
            >
              <span>↻</span>
              <span>Tentar novamente</span>
            </button>
          </div>
        </div>
      )}

      {/* Barra de Filtros e Busca */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 bg-white p-4 rounded-2xl border border-[#e6e7e4] shadow-xs">
        {/* Pílulas de Filtro com contagens reais */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setFilter("todos")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              filter === "todos"
                ? "bg-[#183428] text-white shadow-xs"
                : "bg-[#fafbf9] text-[#5f6863] border border-[#e6e7e4] hover:bg-white hover:text-[#202522]"
            }`}
          >
            Todos ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter("ativos")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              filter === "ativos"
                ? "bg-[#183428] text-white shadow-xs"
                : "bg-[#fafbf9] text-[#5f6863] border border-[#e6e7e4] hover:bg-white hover:text-[#202522]"
            }`}
          >
            Ativos ({activeCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter("concluidos")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              filter === "concluidos"
                ? "bg-[#183428] text-white shadow-xs"
                : "bg-[#fafbf9] text-[#5f6863] border border-[#e6e7e4] hover:bg-white hover:text-[#202522]"
            }`}
          >
            Concluídos ({completedCount})
          </button>

          <span className="hidden sm:inline text-gray-300">|</span>

          {Object.entries(ORDER_STATUS_MAP).map(([key, info]) => {
            const count = statusCounts[key as OrderStatus] || 0;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition border flex items-center gap-1 ${
                  filter === key
                    ? "bg-[#183428] text-white border-[#183428] shadow-xs"
                    : `${info.badgeClass} opacity-85 hover:opacity-100`
                }`}
              >
                <span>{info.label}</span>
                <span className="text-[10px] opacity-80 font-mono">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Campo de Busca Ampla */}
        <div className="w-full lg:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por referência, cliente, e-mail..."
            className="w-full px-3.5 py-1.5 text-xs rounded-xl border border-[#e6e7e4] bg-[#fafbf9] focus:bg-white focus:border-[#183428] outline-none transition"
          />
        </div>
      </div>

      {/* Tabela de Pedidos */}
      <div className="bg-white rounded-2xl border border-[#e6e7e4] shadow-sm overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#7a857f] space-y-2">
            <span className="text-3xl block">📦</span>
            <p className="font-semibold text-sm text-[#202522]">Nenhum pedido encontrado</p>
            <p>
              {clienteFilter
                ? `Não há pedidos registrados para o cliente ${clienteFilter.name || clienteFilter.email} com os filtros selecionados.`
                : "Não há pedidos para os critérios selecionados no momento."}
            </p>
            {(search || filter !== "todos" || clienteFilter) && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setFilter("todos");
                    if (clienteFilter) {
                      window.location.href = "/admin/pedidos";
                    }
                  }}
                  className="px-3.5 py-1.5 bg-[#fafbf9] border border-[#e6e7e4] hover:bg-white text-xs font-semibold text-[#182620] rounded-xl transition"
                >
                  Limpar todos os filtros
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#fafbf9] border-b border-[#e6e7e4] text-[11px] font-bold uppercase tracking-wider text-[#7a857f]">
                <tr>
                  <th className="py-3.5 px-4">Referência</th>
                  <th className="py-3.5 px-4">Cliente / E-mail</th>
                  <th className="py-3.5 px-4">Data de Criação</th>
                  <th className="py-3.5 px-4">Itens</th>
                  <th className="py-3.5 px-4">Total</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Última Atualização</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f2f0]">
                {filteredOrders.map((order) => {
                  const statusInfo = ORDER_STATUS_MAP[order.status] || ORDER_STATUS_MAP.pending;
                  const itemsCount = (order.items || []).reduce((acc, i) => acc + (i.quantity || 1), 0);

                  return (
                    <tr key={order.id} className="hover:bg-[#fafbf9] transition">
                      <td className="py-4 px-4 font-bold text-[#182620]">
                        <Link
                          href={`/admin/pedidos/${order.id}`}
                          className="hover:text-[#1f6b4f] hover:underline"
                          title="Abrir detalhes e gerenciar status do pedido"
                        >
                          {order.reference}
                        </Link>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-semibold text-[#182620]">
                            {order.customer_name || "Cliente da Loja"}
                          </p>
                          <p className="text-[11px] text-[#5f6863]">
                            {order.customer_email || "E-mail não informado"}
                          </p>
                          {order.customer_phone && (
                            <p className="text-[10px] text-[#7a857f]">
                              Tel: {order.customer_phone}
                            </p>
                          )}
                          {order.user_id ? (
                            <span className="inline-block mt-0.5 text-[10px] font-semibold text-[#1f6b4f] bg-[#eaf3ee] px-1.5 py-0.2 rounded">
                              ✓ Conta Vinculada
                            </span>
                          ) : (
                            <span className="inline-block mt-0.5 text-[10px] font-semibold text-[#7a857f] bg-[#fafbf9] border border-[#e6e7e4] px-1.5 py-0.2 rounded">
                              Cliente não vinculado
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-[#5f6863]">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="py-4 px-4 text-[#5f6863]">
                        {itemsCount} {itemsCount === 1 ? "peça" : "peças"}
                      </td>
                      <td className="py-4 px-4 font-bold text-[#182620]">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusInfo.badgeClass}`}
                        >
                          <span className="size-1.5 rounded-full bg-current" />
                          <span>{statusInfo.label}</span>
                        </span>
                      </td>
                      <td className="py-4 px-4 text-[#7a857f] text-[11px]">
                        {formatDate(order.updated_at || order.created_at)}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/pedidos/${order.id}`}
                            className="px-3 py-1.5 bg-[#183428] hover:bg-[#10241b] text-white font-semibold rounded-lg transition"
                          >
                            Gerenciar
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleCopyLink(order)}
                            title="Copiar link de acompanhamento seguro do cliente"
                            className="p-1.5 border border-[#e6e7e4] rounded-lg text-[#5f6863] hover:text-[#183428] hover:bg-[#fafbf9] transition text-xs"
                          >
                            {copiedId === order.id ? "✓ Copiado" : "🔗 Link"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
