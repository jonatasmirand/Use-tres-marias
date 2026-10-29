import type { Metadata } from "next";
import { connection } from "next/server";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getAdminSession } from "@/services/auth-service";
import { getAdminOrderById } from "@/services/order-service";
import { getDynamicSiteUrl } from "@/lib/site-url";
import OrderDetailClient from "./order-detail-client";

export const instant = false;

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: RouteContext): Promise<Metadata> {
  const { id } = await params;
  const order = await getAdminOrderById(id);

  if (!order) {
    return {
      title: "Pedido Não Encontrado | Use Três Marias Admin",
    };
  }

  return {
    title: `Gerenciar Pedido ${order.reference} | Use Três Marias Admin`,
    description: `Detalhes e atualização de status do pedido ${order.reference}.`,
  };
}

export default async function AdminOrderDetailPage({ params }: RouteContext) {
  await connection();
  const session = await getAdminSession();
  if (!session) {
    redirect("/login");
  }

  const { id } = await params;

  const order = await getAdminOrderById(id);
  if (!order) {
    notFound();
  }

  // Determina dinamicamente a origem do site (configurada no Supabase ou via host de produção)
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") || headerList.get("host") || "";
  const origin = await getDynamicSiteUrl(host);

  return (
    <div className="mx-auto max-w-[1000px] space-y-6">
      {/* Topo de navegação */}
      <div className="flex items-center justify-between border-b border-[#e6e7e4] pb-4">
        <Link
          href="/admin/pedidos"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5f6863] hover:text-[#183428] transition"
        >
          <span>← Voltar para Todos os Pedidos</span>
        </Link>
        <span className="text-xs text-[#7a857f] font-mono">ID: {order.id}</span>
      </div>

      {/* Componente Cliente Interativo para Gerenciamento de Status */}
      <OrderDetailClient initialOrder={order} initialOrigin={origin} />
    </div>
  );
}
