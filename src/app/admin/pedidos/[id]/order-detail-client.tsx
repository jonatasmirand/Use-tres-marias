"use client";

import { useState } from "react";
import Image from "next/image";
import { Order, OrderStatus, ORDER_STATUS_MAP } from "@/types/order";

interface OrderDetailClientProps {
  initialOrder: Order;
}

export default function OrderDetailClient({ initialOrder }: OrderDetailClientProps) {
  const [order, setOrder] = useState<Order>(initialOrder);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(initialOrder.status);
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );
  const [copiedLink, setCopiedLink] = useState(false);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  const formatDate = (dateStr: string) =>
    new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" }).format(
      new Date(dateStr)
    );

  const statusInfo = ORDER_STATUS_MAP[order.status] || ORDER_STATUS_MAP.pending;

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStatus === order.status && !notes.trim()) {
      return;
    }

    setIsSaving(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: selectedStatus, notes: notes.trim() || undefined }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Erro ao atualizar status do pedido.");
      }

      setOrder(data.data);
      setNotes("");
      setFeedback({
        type: "success",
        message: `Status atualizado para "${ORDER_STATUS_MAP[selectedStatus].label}" com sucesso!`,
      });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao atualizar status.";
      setFeedback({ type: "error", message: msg });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyTrackingLink = async () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const identifier = order.tracking_token || order.id;
    const trackingUrl = `${origin}/pedido/acompanhar/${identifier}`;

    try {
      await navigator.clipboard.writeText(trackingUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const trackingIdentifier = order.tracking_token || order.id;
  const whatsappMessage = encodeURIComponent(
    `Olá! Seu pedido ${order.reference} na Use Três Marias teve uma atualização de status:\n\n*Status Atual:* ${statusInfo.label}\n\nVocê pode acompanhar todas as etapas pelo link oficial da loja:\n${typeof window !== "undefined" ? window.location.origin : ""}/pedido/acompanhar/${trackingIdentifier}\n\nEstamos à disposição!`
  );

  return (
    <div className="space-y-6">
      {/* Topo do Pedido */}
      <div className="bg-white rounded-2xl border border-[#e6e7e4] p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#7a857f]">
            Referência do Pedido
          </span>
          <h1 className="font-serif text-3xl font-bold text-[#182620] mt-0.5">
            {order.reference}
          </h1>
          <p className="text-xs text-[#5f6863] mt-1">
            Criado em: {formatDate(order.created_at)}
          </p>
        </div>

        <div className="flex flex-col sm:items-end gap-2">
          <span
            className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border ${statusInfo.badgeClass}`}
          >
            <span className="size-2 rounded-full bg-current animate-pulse" />
            <span>{statusInfo.label}</span>
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyTrackingLink}
              className="text-xs px-3 py-1.5 bg-[#fafbf9] border border-[#e6e7e4] text-[#202522] rounded-lg font-medium hover:bg-white transition"
            >
              {copiedLink ? "✓ Link Copiado" : "🔗 Copiar Link de Acompanhamento"}
            </button>

            <a
              href={`https://wa.me/?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs px-3 py-1.5 bg-[#25D366] text-white rounded-lg font-bold hover:bg-[#20ba5a] transition flex items-center gap-1.5"
            >
              <span>WhatsApp</span>
              <span>↗</span>
            </a>
          </div>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold ${
            feedback.type === "success"
              ? "bg-[#eaf3ee] text-[#1f6b4f] border border-[#b2d3c2]"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Grid com Painel de Atualização e Detalhes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna 1 & 2: Itens do Pedido & Financeiro */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card de Itens */}
          <div className="bg-white rounded-2xl border border-[#e6e7e4] p-6 shadow-sm">
            <h2 className="font-serif text-lg font-bold text-[#182620] mb-4">
              Itens do Pedido ({order.items?.length || 0})
            </h2>

            <div className="divide-y divide-[#f0f2f0]">
              {(order.items || []).map((item) => (
                <div key={item.id} className="py-4 flex items-center gap-4">
                  {item.image_url ? (
                    <div className="size-16 rounded-xl overflow-hidden bg-[#fafbf9] border border-[#e6e7e4] shrink-0 relative">
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        className="object-cover object-top"
                        sizes="64px"
                      />
                    </div>
                  ) : (
                    <div className="size-16 rounded-xl bg-[#fafbf9] border border-[#e6e7e4] flex items-center justify-center text-[10px] text-[#7a857f] shrink-0">
                      Sem foto
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-semibold text-[#182620] truncate">
                      {item.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] font-semibold text-[#5f6863] bg-[#fafbf9] border border-[#e6e7e4] px-1.5 py-0.5 rounded">
                        Tam: {item.size}
                      </span>
                      <span className="text-xs text-[#7a857f]">
                        Qtd: {item.quantity}
                      </span>
                      <span className="text-xs text-[#7a857f]">
                        ({formatCurrency(item.price)} cada)
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-[#182620]">
                      {formatCurrency(item.subtotal)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Resumo Financeiro */}
            <div className="mt-4 pt-4 border-t border-[#e6e7e4] space-y-1.5 text-xs text-[#5f6863]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-[#182620]">{formatCurrency(order.subtotal)}</span>
              </div>
              {order.frete > 0 && (
                <div className="flex justify-between">
                  <span>Frete</span>
                  <span className="font-semibold text-[#182620]">{formatCurrency(order.frete)}</span>
                </div>
              )}
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Desconto</span>
                  <span className="font-semibold">-{formatCurrency(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-bold text-[#182620] pt-2 border-t border-[#f0f2f0]">
                <span>Total do Pedido</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Histórico de Auditoria de Mudança de Status */}
          <div className="bg-white rounded-2xl border border-[#e6e7e4] p-6 shadow-sm">
            <h2 className="font-serif text-lg font-bold text-[#182620] mb-4">
              Histórico de Alterações de Status
            </h2>

            <div className="space-y-4">
              {(order.status_history || []).map((entry, idx) => {
                const sInfo = ORDER_STATUS_MAP[entry.status] || ORDER_STATUS_MAP.pending;
                return (
                  <div key={idx} className="flex items-start gap-3 text-xs">
                    <span className="size-2 rounded-full bg-[#183428] mt-1.5 shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${sInfo.badgeClass}`}>
                          {sInfo.label}
                        </span>
                        <span className="text-[#7a857f] text-[11px]">
                          {formatDate(entry.changed_at)}
                        </span>
                      </div>
                      <p className="text-[#202522] mt-1 font-medium">{entry.notes}</p>
                      <p className="text-[10px] text-[#7a857f]">Responsável: {entry.changed_by}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Coluna 3: Painel de Controle de Status */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-[#e6e7e4] p-6 shadow-sm">
            <h2 className="font-serif text-lg font-bold text-[#182620] mb-3">
              Atualizar Status
            </h2>
            <p className="text-xs text-[#5f6863] mb-4 leading-relaxed">
              Altere a etapa do pedido para que o cliente consiga acompanhar o progresso pelo link exclusivo.
            </p>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7a857f]">
                  Selecione o Novo Status
                </label>
                <div className="space-y-1.5">
                  {(Object.keys(ORDER_STATUS_MAP) as OrderStatus[]).map((st) => {
                    const info = ORDER_STATUS_MAP[st];
                    const isSelected = selectedStatus === st;
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setSelectedStatus(st)}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition ${
                          isSelected
                            ? "bg-[#183428] text-white border-[#183428] shadow-xs"
                            : "bg-[#fafbf9] text-[#202522] border-[#e6e7e4] hover:bg-white"
                        }`}
                      >
                        <span>{info.label}</span>
                        {isSelected && <span>✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#7a857f] mb-1">
                  Nota Interna / Justificativa
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ex: Pagamento confirmado via PIX, pacote despachado nos Correios com código..."
                  className="w-full p-3 text-xs rounded-xl border border-[#e6e7e4] bg-[#fafbf9] focus:bg-white focus:border-[#183428] outline-none transition resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSaving || (selectedStatus === order.status && !notes.trim())}
                className="w-full py-3 bg-[#183428] hover:bg-[#10241b] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-xs disabled:opacity-50"
              >
                {isSaving ? "Salvando..." : "Confirmar Alteração"}
              </button>
            </form>
          </div>

          {/* Dados do Cliente e Vinculação de Conta */}
          <div className="bg-white rounded-2xl border border-[#e6e7e4] p-5 shadow-sm space-y-3 text-xs">
            <div className="flex items-center justify-between border-b border-[#f0f2f0] pb-2">
              <h3 className="font-serif font-bold text-[#182620]">Dados do Comprador</h3>
              {order.user_id ? (
                <span className="text-[10px] font-bold text-[#1f6b4f] bg-[#eaf3ee] px-2 py-0.5 rounded-full">
                  ✓ Conta Vinculada
                </span>
              ) : (
                <span className="text-[10px] font-semibold text-[#7a857f] bg-[#fafbf9] border border-[#e6e7e4] px-2 py-0.5 rounded-full">
                  Cliente não vinculado
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              <p>
                <strong className="text-[#5f6863]">Nome:</strong>{" "}
                <span className="text-[#182620] font-medium">{order.customer_name || "Não informado"}</span>
              </p>
              <p>
                <strong className="text-[#5f6863]">E-mail:</strong>{" "}
                <span className="text-[#182620] font-medium">{order.customer_email || "Não informado"}</span>
              </p>
              {order.customer_phone && (
                <p>
                  <strong className="text-[#5f6863]">Telefone / WhatsApp:</strong>{" "}
                  <span className="text-[#182620] font-medium">{order.customer_phone}</span>
                </p>
              )}
              {order.user_id && (
                <p className="text-[11px] text-[#7a857f] font-mono break-all pt-1 border-t border-[#f0f2f0]">
                  User ID: {order.user_id}
                </p>
              )}
              {order.customer_notes && (
                <div className="pt-2 border-t border-[#f0f2f0]">
                  <strong className="text-[#5f6863] block mb-0.5">Endereço / Observações:</strong>
                  <p className="text-[#202522] leading-relaxed bg-[#fafbf9] p-2.5 rounded-xl border border-[#e6e7e4]">
                    {order.customer_notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
