import type { Metadata } from "next";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminSession } from "@/services/auth-service";
import { listUsers, syncAuthenticatedUser } from "@/services/user-service";
import AccountsTableClient from "./accounts-table-client";
import { UserRole, UserStatus } from "@/types/user";

export const instant = false;

export const metadata: Metadata = {
  title: "Gerenciamento de Contas | Use Três Marias Admin",
  description: "Gerencie contas de clientes e administradores da loja Use Três Marias.",
};

type RouteContext = {
  searchParams: Promise<{
    busca?: string;
    tipo?: string;
    status?: string;
    pagina?: string;
  }>;
};

export default async function AdminContasPage({ searchParams }: RouteContext) {
  await connection();
  const session = await getAdminSession();

  if (!session) {
    redirect("/login");
  }

  // Sincroniza a conta do administrador logado
  await syncAuthenticatedUser({
    id: session.id,
    email: session.email,
    role: "admin",
    status: "active",
  }).catch(() => {});

  const { busca, tipo, status, pagina } = await searchParams;

  const validRole =
    tipo === "admin" || tipo === "customer" ? (tipo as UserRole) : "all";
  const validStatus =
    status === "active" || status === "blocked" ? (status as UserStatus) : "all";
  const pageNum = parseInt(pagina || "1", 10);

  const initialData = await listUsers({
    search: busca,
    role: validRole,
    status: validStatus,
    page: isNaN(pageNum) ? 1 : pageNum,
    perPage: 25,
  });

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      {/* Topo da Página */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#e6e7e4] pb-5">
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-[#202522] md:text-3xl">
            Gerenciamento de Contas
          </h1>
          <p className="mt-1 text-xs text-[#5f6863]">
            Consulte contas de clientes, controle permissões e convide novos administradores de forma segura.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin"
            className="rounded-xl border border-[#e6e7e4] bg-white px-3.5 py-2 text-xs font-semibold text-[#5f6863] transition hover:bg-[#fafbf9]"
          >
            ← Painel Principal
          </Link>
        </div>
      </div>

      {/* Componente Interativo de Tabela e Ações */}
      <AccountsTableClient
        initialData={initialData}
        currentAdminId={session.id}
        initialFilterRole={validRole}
        initialFilterStatus={validStatus}
        initialSearch={busca || ""}
      />
    </div>
  );
}

