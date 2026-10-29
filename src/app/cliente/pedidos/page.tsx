import type { Metadata } from "next";
import { connection } from "next/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCustomerOrders } from "@/services/order-service";
import { ORDER_STATUS_MAP } from "@/types/order";

export const instant = false;

export const metadata: Metadata = {
  title: "Meus Pedidos | Use Três Marias",
  description: "Histórico completo dos seus pedidos na Use Três Marias.",
};

export default async function CustomerOrdersPage() {
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/cliente/pedidos");
  }

  // Política estrita: Administradores não devem acessar ou permanecer na área de clientes
  if (user.app_metadata?.role === "admin") {
    redirect("/admin");
  }

  const orders = await getCustomerOrders(user.id);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  const formatDate = (dateStr: string) =>
    new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium", timeStyle: "short" }).format(
      new Date(dateStr)
    );

  return (
    <div className="space-y-6">
      {/* Topo da Página */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#182620]">
            Meus Pedidos
          </h1>
          <p className="text-xs text-[#5f6863] mt-1">
            Consulte seu histórico de compras e acompanhe o andamento de cada entrega.
          </p>
        </div>

        <Link
          href="/novidades"
          className="self-start sm:self-auto px-4 py-2 bg-[#1f6b4f] hover:bg-[#164d3a] text-white text-xs font-semibold rounded-xl transition shadow-xs"
        >
          Nova Compra +
        </Link>
      </div>

      {/* Lista de Pedidos */}
      <div className="rounded-3xl border border-[#e6e7e4] bg-white p-6 shadow-xs overflow-hidden">
        {orders.length === 0 ? (
          <div className="py-16 text-center text-xs text-[#7a857f] space-y-3">
            <span className="text-4xl block">🛍️</span>
            <p className="font-semibold text-sm text-[#202522]">
              Nenhum pedido encontrado.
            </p>
            <p className="max-w-xs mx-auto">
              Quando você finalizar um pedido na loja, ele aparecerá aqui automaticamente com o status em tempo real.
            </p>
            <Link
              href="/"
              className="inline-block mt-2 px-4 py-2 bg-[#183428] text-white font-semibold rounded-xl hover:bg-[#10241b] transition shadow-xs"
            >
              Ir às Compras
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[#f0f2f0]">
            {orders.map((order) => {
              const statusInfo = ORDER_STATUS_MAP[order.status] || ORDER_STATUS_MAP.pending;
              const itemsCount = (order.items || []).reduce((acc, i) => acc + i.quantity, 0);

              return (
                <div
                  key={order.id}
                  className="py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 hover:bg-[#fafbf9] -mx-4 px-4 rounded-2xl transition"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-sm text-[#182620]">
                        {order.reference}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${statusInfo.badgeClass}`}
                      >
                        {statusInfo.label}
                      </span>
                    </div>

                    <p className="text-xs text-[#5f6863]">
                      Data: <strong>{formatDate(order.created_at)}</strong> • {itemsCount}{" "}
                      {itemsCount === 1 ? "peça" : "peças"}
                    </p>

                    {/* Preview dos itens */}
                    {order.items && order.items.length > 0 && (
                      <p className="text-[11px] text-[#7a857f] line-clamp-1">
                        {order.items.map((i) => `${i.quantity}x ${i.name} (${i.size})`).join(", ")}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-4 justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-[#f0f2f0]">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] uppercase tracking-wider text-[#7a857f] block">
                        Valor Total
                      </span>
                      <span className="text-sm font-bold text-[#182620]">
                        {formatCurrency(order.total)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/cliente/pedidos/${order.id}`}
                        className="px-3.5 py-2 text-xs font-semibold bg-[#fafbf9] border border-[#e6e7e4] text-[#202522] rounded-xl hover:bg-white hover:border-[#183428] transition"
                      >
                        Ver Detalhes
                      </Link>

                      <Link
                        href={`/pedido/acompanhar/${order.tracking_token || order.id}`}
                        className="px-3.5 py-2 text-xs font-semibold bg-[#183428] text-white rounded-xl hover:bg-[#10241b] transition shadow-xs"
                      >
                        Acompanhar Rastreio
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
