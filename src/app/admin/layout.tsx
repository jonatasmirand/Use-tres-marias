import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/services/auth-service";

interface AdminLayoutProps {
  children: ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await getAdminSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-[#fafbf9] text-[#202522]">
      {/* Barra Lateral / Sidebar para Desktop */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-[#e6e7e4] bg-white lg:flex">
        {/* Topo da Sidebar com a Marca */}
        <div className="flex h-16 items-center border-b border-[#e6e7e4] px-6">
          <Link
            href="/admin"
            className="flex items-center gap-2 font-serif text-[20px] font-bold tracking-[-0.04em] text-[#202522]"
          >
            <span>use<span className="text-[#1f6b4f]">Três</span>Marias</span>
            <span className="rounded-md bg-[#eaf3ee] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#1f6b4f]">
              CMS
            </span>
          </Link>
        </div>

        {/* Links de Navegação Administrativa */}
        <nav className="flex-1 space-y-1.5 px-3 py-6" aria-label="Menu administrativo">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.1em] text-[#7f8d85]">
            Conteúdo & Vitrine
          </div>

          <Link
            href="/admin"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold text-[#202522] transition hover:bg-[#eaf3ee] hover:text-[#1f6b4f]"
          >
            <svg className="size-4 shrink-0 text-[#1f6b4f]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Visão Geral</span>
          </Link>

          <Link
            href="/admin/produtos"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold text-[#202522] transition hover:bg-[#eaf3ee] hover:text-[#1f6b4f]"
          >
            <svg className="size-4 shrink-0 text-[#1f6b4f]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span>Produtos (Catálogo)</span>
          </Link>

          <Link
            href="/admin/paginas"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold text-[#202522] transition hover:bg-[#eaf3ee] hover:text-[#1f6b4f]"
          >
            <svg className="size-4 shrink-0 text-[#1f6b4f]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
            <span>Páginas & Seções</span>
          </Link>

          <div className="pt-2 pl-3 pb-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#7f8d85]">
            Vitrines da Home
          </div>

          <Link
            href="/admin/paginas/home-hero"
            className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-[#5f6863] transition hover:bg-[#eaf3ee] hover:text-[#1f6b4f]"
          >
            <span className="size-1.5 rounded-full bg-[#1f6b4f]" />
            <span>Hero Carrossel</span>
          </Link>

          <Link
            href="/admin/paginas/home-novidades"
            className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-[#5f6863] transition hover:bg-[#eaf3ee] hover:text-[#1f6b4f]"
          >
            <span className="size-1.5 rounded-full bg-[#1f6b4f]" />
            <span>Vitrine Novidades</span>
          </Link>

          <Link
            href="/admin/paginas/home-conjuntos"
            className="flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-semibold text-[#5f6863] transition hover:bg-[#eaf3ee] hover:text-[#1f6b4f]"
          >
            <span className="size-1.5 rounded-full bg-[#1f6b4f]" />
            <span>Vitrine Conjuntos</span>
          </Link>

          <div className="pt-4 px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.1em] text-[#7f8d85]">
            E-Commerce
          </div>

          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-xl border border-[#e6e7e4] bg-[#fafbf9] px-3 py-2.5 text-xs font-semibold text-[#5f6863] transition hover:border-[#1f6b4f] hover:bg-white hover:text-[#1f6b4f]"
          >
            <span className="flex items-center gap-2">
              <svg className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span>Ver Loja Pública</span>
            </span>
            <span className="text-[10px] text-[#7f8d85]">Nova aba ↗</span>
          </Link>
        </nav>

        {/* Rodapé da Sidebar */}
        <div className="border-t border-[#e6e7e4] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-[#202522]">Painel Admin</p>
              <p className="max-w-[140px] truncate text-[11px] text-[#7f8d85]" title={session.email}>
                {session.email || "Use Três Marias"}
              </p>
            </div>
            <Link
              href="/login"
              className="rounded-lg p-1.5 text-[#5f6863] transition hover:bg-red-50 hover:text-red-700"
              title="Encerrar sessão"
            >
              <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </Link>
          </div>
        </div>
      </aside>

      {/* Área de Conteúdo Principal */}
      <div className="flex flex-1 flex-col overflow-x-hidden">
        {/* Barra Superior Mobile e Ações Rápidas */}
        <header className="flex h-16 items-center justify-between border-b border-[#e6e7e4] bg-white px-5 lg:hidden">
          <Link
            href="/admin"
            className="font-serif text-[18px] font-bold tracking-[-0.04em] text-[#202522]"
          >
            use<span className="text-[#1f6b4f]">Três</span>Marias <span className="text-xs font-sans text-[#1f6b4f]">CMS</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/paginas/home-hero"
              className="rounded-lg bg-[#eaf3ee] px-2.5 py-1 text-xs font-semibold text-[#1f6b4f]"
            >
              Editor Hero
            </Link>
            <Link
              href="/"
              target="_blank"
              className="text-xs font-medium text-[#5f6863]"
            >
              Loja ↗
            </Link>
          </div>
        </header>

        {/* Conteúdo Injetado */}
        <main className="flex-1 p-5 md:p-8 lg:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
