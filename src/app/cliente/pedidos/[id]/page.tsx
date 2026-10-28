import type { Metadata } from "next";
import { connection } from "next/server";
import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCustomerOrderById } from "@/services/order-service";
import { ORDER_STATUS_MAP } from "@/types/order";

export const instant = false;

interface CustomerOrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: CustomerOrderDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Pedido ${id.slice(0, 8)} | Área do Cliente | Use Três Marias`,
    description: "Detalhes do seu pedido na Use Três Marias.",
  };
}

export default async function CustomerOrderDetailPage({
  params,
}: CustomerOrderDetailPageProps) {
  await connection();
  const { id } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/cliente/pedidos/${id}`);
  }

  // 1. Validação estrita de titularidade no servidor:
  // Se o pedido não pertencer a user.id, retorna null
  const order = await getCustomerOrderById(id, user.id);

  if (!order) {
    notFound();
  }

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  const formatDate = (dateStr: string) =>
    new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeStyle: "short" }).format(
      new Date(dateStr)
    );

  const statusInfo = ORDER_STATUS_MAP[order.status] || ORDER_STATUS_MAP.pending;
  const items = order.items || [];

  return (
    <div className="space-y-6">
      {/* Botão de Retorno */}
      <div>
        <Link
          href="/cliente/pedidos"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5f6863] hover:text-[#183428] transition"
        >
          <span>←</span>
          <span>Voltar para todos os pedidos</span>
        </Link>
      </div>

      {/* Topo do Pedido */}
      <div className="rounded-3xl border border-[#e6e7e4] bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7a857f]">
              Pedido Confirmado
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#182620] mt-1">
              {order.reference}
            </h1>
            <p className="text-xs text-[#5f6863] mt-1">
              Realizado em {formatDate(order.created_at)}
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-2">
            <span
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border ${statusInfo.badgeClass}`}
            >
              <span className="size-2 rounded-full bg-current" />
              <span>{statusInfo.label}</span>
            </span>

            <Link
              href={`/pedido/acompanhar/${order.tracking_token || order.id}`}
              className="text-xs px-3.5 py-1.5 bg-[#183428] text-white rounded-xl font-semibold hover:bg-[#10241b] transition shadow-xs"
            >
              Link de Acompanhamento em Tempo Real →
            </Link>
          </div>
        </div>

        {/* Mensagem descritiva da etapa */}
        <div className="mt-6 rounded-2xl bg-[#fafbf9] border border-[#e6e7e4] p-4 text-xs text-[#5f6863] leading-relaxed">
          <strong className="text-[#202522] block mb-1">Status atual: {statusInfo.label}</strong>
          {statusInfo.description}
        </div>
      </div>

      {/* Grid com Itens e Resumo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna 1 & 2: Itens do Pedido */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-3xl border border-[#e6e7e4] bg-white p-6 shadow-xs">
            <h2 className="font-serif text-lg font-bold text-[#182620] mb-4">
              Itens Comprados ({items.length})
            </h2>

            <div className="divide-y divide-[#f0f2f0]">
              {items.map((item) => (
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
                    <span className="text-xs font-bold text-[#182620]">
                      {formatCurrency(item.subtotal)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Histórico de Atualizações */}
          {order.status_history && order.status_history.length > 0 && (
            <div className="rounded-3xl border border-[#e6e7e4] bg-white p-6 shadow-xs">
              <h2 className="font-serif text-lg font-bold text-[#182620] mb-4">
                Linha do Tempo do Pedido
              </h2>

              <div className="space-y-4">
                {order.status_history.map((entry, idx) => {
                  const sInfo = ORDER_STATUS_MAP[entry.status] || ORDER_STATUS_MAP.pending;
                  return (
                    <div key={idx} className="flex items-start gap-3 text-xs">
                      <span className="size-2 rounded-full bg-[#183428] mt-1.5 shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${sInfo.badgeClass}`}
                          >
                            {sInfo.label}
                          </span>
                          <span className="text-[#7a857f] text-[11px]">
                            {new Intl.DateTimeFormat("pt-BR", {
                              dateStyle: "short",
                              timeStyle: "short",
                            }).format(new Date(entry.changed_at))}
                          </span>
                        </div>
                        <p className="text-[#202522] mt-1 font-medium">{entry.notes}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Coluna 3: Resumo Financeiro e Detalhes */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-[#e6e7e4] bg-white p-6 shadow-xs space-y-4">
            <h2 className="font-serif text-lg font-bold text-[#182620]">
              Resumo Financeiro
            </h2>

            <div className="space-y-2 text-xs text-[#5f6863]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-[#182620]">
                  {formatCurrency(order.subtotal)}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Frete</span>
                <span className="font-semibold text-[#182620]">
                  {order.frete > 0 ? formatCurrency(order.frete) : "A combinar com o CEP"}
                </span>
              </div>

              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Desconto</span>
                  <span className="font-semibold">-{formatCurrency(order.discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-base font-bold text-[#182620] pt-3 border-t border-[#f0f2f0]">
                <span>Total</span>
                <span>{formatCurrency(order.total)}</span>
              </div>
            </div>

            {/* Informações registradas no pedido */}
            {(order.customer_phone || order.customer_notes) && (
              <div className="pt-4 border-t border-[#f0f2f0] text-xs space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#7a857f] block">
                  Informações de Contato
                </span>
                {order.customer_phone && (
                  <p>
                    <span className="text-[#5f6863]">Telefone:</span> {order.customer_phone}
                  </p>
                )}
                {order.customer_notes && (
                  <p>
                    <span className="text-[#5f6863]">Observações:</span> {order.customer_notes}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
