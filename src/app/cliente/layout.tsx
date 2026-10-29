import { ReactNode } from "react";
import { connection } from "next/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/account/LogoutButton";
import Logo from "@/components/brand/Logo";

export const instant = false;

export default async function CustomerAreaLayout({
  children,
}: {
  children: ReactNode;
}) {
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

  const customerName =
    (user.user_metadata?.full_name as string) ||
    (user.user_metadata?.name as string) ||
    user.email?.split("@")[0] ||
    "Cliente";

  return (
    <div className="min-h-screen bg-[#fafbf9] text-[#202522]">
      {/* Barra Superior da Área do Cliente */}
      <header className="sticky top-0 z-20 border-b border-[#e6e7e4] bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-6">
            <Logo href="/" imageClassName="h-7 w-auto" />

            <span className="hidden sm:inline-block text-xs font-semibold uppercase tracking-wider text-[#7a857f] border-l border-[#e6e7e4] pl-4">
              Área do Cliente
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="hidden md:inline-block text-[#5f6863]">
              Olá, <strong className="text-[#202522]">{customerName}</strong>
            </span>

            <Link
              href="/"
              className="px-3 py-1.5 rounded-lg border border-[#e6e7e4] text-[#5f6863] hover:text-[#202522] hover:bg-[#fafbf9] transition font-medium"
            >
              Voltar à Loja
            </Link>

            <LogoutButton />
          </div>
        </div>

        {/* Abas de Navegação */}
        <div className="border-t border-[#f0f2f0] bg-white">
          <div className="mx-auto flex max-w-[1200px] items-center gap-2 px-4 sm:px-6 py-2 overflow-x-auto text-xs font-semibold">
            <Link
              href="/cliente"
              className="px-3.5 py-1.5 rounded-lg text-[#5f6863] hover:text-[#183428] hover:bg-[#fafbf9] transition"
            >
              Visão Geral
            </Link>
            <Link
              href="/cliente/pedidos"
              className="px-3.5 py-1.5 rounded-lg text-[#5f6863] hover:text-[#183428] hover:bg-[#fafbf9] transition"
            >
              Meus Pedidos
            </Link>
            <Link
              href="/novidades"
              className="px-3.5 py-1.5 rounded-lg text-[#1f6b4f] hover:bg-[#eaf3ee] transition ml-auto"
            >
              Explorar Catálogo →
            </Link>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal da Área do Cliente */}
      <main className="mx-auto max-w-[1200px] px-4 sm:px-6 py-8">
        {children}
      </main>
    </div>
  );
}
