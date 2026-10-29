import type { Metadata } from "next";
import { connection } from "next/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCustomerOrders } from "@/services/order-service";
import { ORDER_STATUS_MAP } from "@/types/order";

export const instant = false;

export const metadata: Metadata = {
  title: "Área do Cliente | Use Três Marias",
  description: "Acompanhe seus pedidos e gerencie suas compras na Use Três Marias.",
};

export default async function CustomerAccountPage() {
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/cliente");
  }

  // Política estrita: Administradores não devem acessar ou permanecer na área de clientes
  if (user.app_metadata?.role === "admin") {
    redirect("/admin");
  }

  const orders = await getCustomerOrders(user.id);
  const recentOrders = orders.slice(0, 3);

  const customerName =
    (user.user_metadata?.full_name as string) ||
    (user.user_metadata?.name as string) ||
    "Cliente";

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  const formatDate = (dateStr: string) =>
    new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(dateStr));

  return (
    <div className="space-y-8">
      {/* Banner de Boas-Vindas da Cliente */}
      <section className="rounded-3xl border border-[#e6e7e4] bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#1f6b4f] bg-[#eaf3ee] px-2.5 py-0.5 rounded-full">
              Conta de Cliente Verificada
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#182620] mt-2">
              Bem-vinda, {customerName}!
            </h1>
            <p className="text-xs text-[#5f6863] mt-1">
              E-mail cadastrado: <span className="font-semibold text-[#202522]">{user.email}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/cliente/pedidos"
              className="px-4 py-2.5 bg-[#183428] text-white text-xs font-semibold rounded-xl hover:bg-[#10241b] transition shadow-xs"
            >
              Ver Meus Pedidos ({orders.length})
            </Link>
            <Link
              href="/novidades"
              className="px-4 py-2.5 bg-white border border-[#e6e7e4] text-[#202522] text-xs font-semibold rounded-xl hover:bg-[#fafbf9] transition shadow-xs"
            >
              Explorar Coleção →
            </Link>
          </div>
        </div>
      </section>

      {/* Seção de Pedidos Recentes do Cliente */}
      <section className="rounded-3xl border border-[#e6e7e4] bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#182620]">
              Últimos Pedidos
            </h2>
            <p className="text-xs text-[#5f6863] mt-0.5">
              Consulte o status em tempo real e os links de entrega das suas compras mais recentes.
            </p>
          </div>

          {orders.length > 3 && (
            <Link
              href="/cliente/pedidos"
              className="text-xs font-semibold text-[#1f6b4f] hover:underline"
            >
              Ver todos ({orders.length}) →
            </Link>
          )}
        </div>

        {recentOrders.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#7a857f] space-y-3">
            <span className="text-4xl block">🛍️</span>
            <p className="font-semibold text-sm text-[#202522]">
              Você ainda não realizou nenhum pedido.
            </p>
            <p className="max-w-xs mx-auto">
              Navegue pelo nosso catálogo exclusivo e adicione suas peças favoritas à sacola!
            </p>
            <Link
              href="/novidades"
              className="inline-block mt-2 px-4 py-2.5 bg-[#1f6b4f] text-white font-semibold rounded-xl hover:bg-[#164d3a] transition shadow-xs"
            >
              Explorar Coleção
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-[#f0f2f0]">
            {recentOrders.map((order) => {
              const statusInfo = ORDER_STATUS_MAP[order.status] || ORDER_STATUS_MAP.pending;
              const itemsCount = (order.items || []).reduce((acc, i) => acc + i.quantity, 0);

              return (
                <div
                  key={order.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 hover:bg-[#fafbf9] -mx-4 px-4 rounded-xl transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
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
                      Realizado em {formatDate(order.created_at)} • {itemsCount}{" "}
                      {itemsCount === 1 ? "item" : "itens"}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 justify-between sm:justify-end">
                    <span className="text-xs font-bold text-[#182620]">
                      {formatCurrency(order.total)}
                    </span>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/cliente/pedidos/${order.id}`}
                        className="px-3 py-1.5 text-xs font-semibold bg-[#fafbf9] border border-[#e6e7e4] text-[#202522] rounded-lg hover:bg-white hover:border-[#183428] transition"
                      >
                        Detalhes
                      </Link>

                      <Link
                        href={`/pedido/acompanhar/${order.tracking_token || order.id}`}
                        className="px-3 py-1.5 text-xs font-semibold bg-[#183428] text-white rounded-lg hover:bg-[#10241b] transition"
                      >
                        Acompanhar Entrega
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Cards de Apoio e Atendimento ao Cliente */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-[#e6e7e4] bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="size-10 rounded-xl bg-[#eaf3ee] text-[#1f6b4f] flex items-center justify-center text-lg mb-3">
              💬
            </div>
            <h3 className="font-serif text-base font-bold text-[#182620]">
              Precisa de ajuda com uma compra?
            </h3>
            <p className="text-xs text-[#5f6863] mt-1">
              Fale diretamente com nossa equipe de suporte para tirar dúvidas sobre pedidos, prazos de entrega ou trocas.
            </p>
          </div>
          <Link
            href="/contato"
            className="text-xs font-semibold text-[#1f6b4f] hover:underline mt-4 inline-block"
          >
            Falar com o Atendimento →
          </Link>
        </div>

        <div className="rounded-2xl border border-[#e6e7e4] bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="size-10 rounded-xl bg-[#eaf3ee] text-[#1f6b4f] flex items-center justify-center text-lg mb-3">
              👗
            </div>
            <h3 className="font-serif text-base font-bold text-[#182620]">
              Novidades e Tendências
            </h3>
            <p className="text-xs text-[#5f6863] mt-1">
              Descubra nossas coleções exclusivas, tecidos nobres e lançamentos feitos especialmente para você.
            </p>
          </div>
          <Link
            href="/novidades"
            className="text-xs font-semibold text-[#1f6b4f] hover:underline mt-4 inline-block"
          >
            Ver Coleção Completa →
          </Link>
        </div>
      </div>
    </div>
  );
}
