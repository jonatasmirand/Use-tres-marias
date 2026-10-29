"use client";

import { useState } from "react";
import Link from "next/link";
import { Order, ORDER_STATUS_MAP } from "@/types/order";

interface OrdersTableClientProps {
  initialOrders: Order[];
  currentFilter: string;
  currentSearch: string;
  siteUrl?: string;
}

export default function OrdersTableClient({
  initialOrders,
  currentFilter,
  currentSearch,
  siteUrl,
}: OrdersTableClientProps) {
  const [filter, setFilter] = useState(currentFilter);
  const [search, setSearch] = useState(currentSearch);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  const formatDate = (dateStr: string) =>
    new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(
      new Date(dateStr)
    );

  // Filtra em memória para resposta instantânea na UI
  const filteredOrders = initialOrders.filter((order) => {
    if (filter === "ativos") {
      if (order.status === "completed") return false;
    } else if (filter === "concluidos") {
      if (order.status !== "completed") return false;
    } else if (filter !== "todos" && order.status !== filter) {
      return false;
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      const matchRef = order.reference.toLowerCase().includes(q);
      const matchClient = (order.customer_name || "").toLowerCase().includes(q);
      if (!matchRef && !matchClient) return false;
    }

    return true;
  });

  const handleCopyLink = async (order: Order) => {
    // Para pedidos que têm token gerado, podemos usar o path padrão
    const identifier = order.tracking_token || order.id;
    const baseDomain = siteUrl ? siteUrl.replace(/\/$/, "") : origin;
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

  const activeCount = initialOrders.filter((o) => o.status !== "completed").length;
  const completedCount = initialOrders.filter((o) => o.status === "completed").length;

  return (
    <div className="space-y-4">
      {/* Barra de Filtros e Busca */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-2xl border border-[#e6e7e4] shadow-xs">
        {/* Pílulas de Filtro */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => setFilter("todos")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              filter === "todos"
                ? "bg-[#183428] text-white"
                : "bg-[#fafbf9] text-[#5f6863] border border-[#e6e7e4] hover:bg-white hover:text-[#202522]"
            }`}
          >
            Todos ({initialOrders.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("ativos")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              filter === "ativos"
                ? "bg-[#183428] text-white"
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
                ? "bg-[#183428] text-white"
                : "bg-[#fafbf9] text-[#5f6863] border border-[#e6e7e4] hover:bg-white hover:text-[#202522]"
            }`}
          >
            Concluídos ({completedCount})
          </button>

          <span className="hidden sm:inline text-gray-300">|</span>

          {Object.entries(ORDER_STATUS_MAP).map(([key, info]) => (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition border ${
                filter === key
                  ? "bg-[#183428] text-white border-[#183428]"
                  : `${info.badgeClass} opacity-80 hover:opacity-100`
              }`}
            >
              {info.label}
            </button>
          ))}
        </div>

        {/* Campo de Busca por Referência */}
        <div className="w-full sm:w-64">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por referência..."
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
            <p>Não há pedidos para os filtros selecionados no momento.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#fafbf9] border-b border-[#e6e7e4] text-[11px] font-bold uppercase tracking-wider text-[#7a857f]">
                <tr>
                  <th className="py-3.5 px-4">Referência</th>
                  <th className="py-3.5 px-4">Cliente / E-mail</th>
                  <th className="py-3.5 px-4">Data</th>
                  <th className="py-3.5 px-4">Itens</th>
                  <th className="py-3.5 px-4">Total</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0f2f0]">
                {filteredOrders.map((order) => {
                  const statusInfo = ORDER_STATUS_MAP[order.status] || ORDER_STATUS_MAP.pending;
                  const itemsCount = (order.items || []).reduce((acc, i) => acc + i.quantity, 0);

                  return (
                    <tr key={order.id} className="hover:bg-[#fafbf9] transition">
                      <td className="py-4 px-4 font-bold text-[#182620]">
                        <Link
                          href={`/admin/pedidos/${order.id}`}
                          className="hover:text-[#1f6b4f] hover:underline"
                        >
                          {order.reference}
                        </Link>
                      </td>
                      <td className="py-4 px-4">
                        {order.user_id ? (
                          <div>
                            <p className="font-semibold text-[#182620]">
                              {order.customer_name || "Cliente Cadastrado"}
                            </p>
                            <p className="text-[11px] text-[#5f6863]">
                              {order.customer_email || "E-mail não informado"}
                            </p>
                            <span className="inline-block mt-0.5 text-[10px] font-semibold text-[#1f6b4f] bg-[#eaf3ee] px-1.5 py-0.2 rounded">
                              ✓ Conta Vinculada
                            </span>
                          </div>
                        ) : (
                          <div>
                            <p className="font-medium text-[#202522]">
                              {order.customer_name || "Cliente"}
                            </p>
                            <span className="inline-block mt-0.5 text-[10px] font-semibold text-[#7a857f] bg-[#fafbf9] border border-[#e6e7e4] px-1.5 py-0.2 rounded">
                              Cliente não vinculado
                            </span>
                          </div>
                        )}
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
                            title="Copiar link do pedido"
                            className="p-1.5 border border-[#e6e7e4] rounded-lg text-[#5f6863] hover:text-[#183428] hover:bg-[#fafbf9] transition"
                          >
                            {copiedId === order.id ? "✓ Copiado" : "🔗 Copiar"}
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
