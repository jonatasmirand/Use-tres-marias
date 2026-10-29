import type { Metadata } from "next";
import { connection } from "next/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminSession } from "@/services/auth-service";
import { getAdminOrders } from "@/services/order-service";
import { getDynamicSiteUrl } from "@/lib/site-url";
import { ORDER_STATUS_MAP, OrderStatus } from "@/types/order";
import OrdersTableClient from "./orders-table-client";

export const instant = false;

export const metadata: Metadata = {
  title: "Gerenciamento de Pedidos | Use Três Marias Admin",
  description: "Gerencie pedidos reais, acompanhe status e compartilhe links de entrega.",
};

type RouteContext = {
  searchParams: Promise<{
    status?: string;
    filtro?: string;
    busca?: string;
    clienteId?: string;
    clienteEmail?: string;
    clienteNome?: string;
  }>;
};

export default async function AdminPedidosPage({ searchParams }: RouteContext) {
  await connection();
  const session = await getAdminSession();
  if (!session) {
    redirect("/login");
  }

  const { status, filtro, busca, clienteId, clienteEmail, clienteNome } = await searchParams;

  const validStatus =
    status && status in ORDER_STATUS_MAP ? (status as OrderStatus) : undefined;

  const result = await getAdminOrders({
    status: validStatus,
    activeOnly: filtro === "ativos",
    completedOnly: filtro === "concluidos",
    search: busca,
    clienteId,
    clienteEmail,
  });

  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") || headerList.get("host") || "";
  const siteUrl = await getDynamicSiteUrl(host);

  const clienteFilter =
    clienteId || clienteEmail
      ? {
          id: clienteId || "",
          email: clienteEmail || "",
          name: clienteNome || "",
        }
      : null;

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#e6e7e4] pb-5">
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-[#202522] md:text-3xl">
            Pedidos & Status
          </h1>
          <p className="mt-1 text-xs text-[#5f6863]">
            Gerencie o ciclo de vida dos pedidos reais da loja, filtre por cliente e acompanhe cada etapa da entrega.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/contas"
            className="rounded-xl border border-[#e6e7e4] bg-white px-3.5 py-2 text-xs font-semibold text-[#5f6863] transition hover:bg-[#fafbf9]"
          >
            👥 Gerenciar Contas
          </Link>
          <Link
            href="/admin"
            className="rounded-xl border border-[#e6e7e4] bg-white px-3.5 py-2 text-xs font-semibold text-[#5f6863] transition hover:bg-[#fafbf9]"
          >
            ← Painel Admin
          </Link>
        </div>
      </div>

      {/* Componente Interativo de Listagem com Filtros e Ações */}
      <OrdersTableClient
        initialOrders={result.orders}
        totalCount={result.total}
        activeCount={result.activeCount}
        completedCount={result.completedCount}
        statusCounts={result.statusCounts}
        initialError={result.error || null}
        currentFilter={filtro || (status ? status : "todos")}
        currentSearch={busca || ""}
        clienteFilter={clienteFilter}
        siteUrl={siteUrl}
      />
    </div>
  );
}
