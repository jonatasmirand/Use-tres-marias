import type { Metadata } from "next";
import { connection } from "next/server";
import Link from "next/link";
import { getAdminPageSections } from "@/services/cms-service";

export const instant = false;

export const metadata: Metadata = {
  title: "Painel de Controle | Use Três Marias CMS",
  description: "Gerenciamento de páginas, seções e conteúdo da loja.",
};

export default async function AdminDashboardPage() {
  await connection();
  const { sections } = await getAdminPageSections("home");

  return (
    <div className="mx-auto max-w-[1200px] space-y-8">
      {/* Cabeçalho do Painel */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-[#202522] md:text-3xl">
            Painel de Controle do CMS
          </h1>
          <p className="mt-1 text-xs text-[#5f6863]">
            Gerencie o conteúdo dinâmico, seções da Home, contas e campanhas da Use Três Marias.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/produtos"
            className="inline-flex items-center gap-2 rounded-xl bg-[#1f6b4f] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#18563f]"
          >
            <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span>Gerenciar Produtos</span>
          </Link>
          <Link
            href="/admin/contas"
            className="inline-flex items-center gap-2 rounded-xl border border-[#e6e7e4] bg-white px-4 py-2.5 text-xs font-semibold text-[#202522] shadow-sm transition hover:bg-[#fafbf9]"
          >
            <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <span>Gerenciar Contas</span>
          </Link>
          <Link
            href="/admin/paginas/home-hero"
            className="inline-flex items-center gap-2 rounded-xl border border-[#e6e7e4] bg-white px-4 py-2.5 text-xs font-semibold text-[#202522] shadow-sm transition hover:bg-[#fafbf9]"
          >
            <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>Editar Carrossel Hero</span>
          </Link>
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#e6e7e4] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#202522] transition hover:bg-[#fafbf9]"
          >
            <span>Ver Loja</span>
            <span className="text-[#7f8d85]">↗</span>
          </Link>
        </div>
      </div>

      {/* Cards de Métricas e Status */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-[#e6e7e4] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7f8d85]">
              Seções na Home
            </span>
            <span className="inline-flex size-8 items-center justify-center rounded-lg bg-[#eaf3ee] text-[#1f6b4f]">
              <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </span>
          </div>
          <p className="mt-4 font-serif text-3xl font-bold text-[#202522]">
            {sections.length}
          </p>
          <p className="mt-1 text-xs text-[#5f6863]">
            {sections.filter((s) => s.status === "published" && s.is_active).length} ativas e publicadas
          </p>
        </div>

        <div className="rounded-2xl border border-[#e6e7e4] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7f8d85]">
              Status da Seção Hero
            </span>
            <span className="inline-flex size-8 items-center justify-center rounded-lg bg-[#eaf3ee] text-[#1f6b4f]">
              <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
          <p className="mt-4 font-serif text-3xl font-bold text-[#1f6b4f]">
            Pronta
          </p>
          <p className="mt-1 text-xs text-[#5f6863]">
            Editor dedicado com upload e rascunho
          </p>
        </div>

        <div className="rounded-2xl border border-[#e6e7e4] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#7f8d85]">
              Publicação
            </span>
            <span className="inline-flex size-8 items-center justify-center rounded-lg bg-[#eaf3ee] text-[#1f6b4f]">
              <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </span>
          </div>
          <p className="mt-4 font-serif text-3xl font-bold text-[#202522]">
            Em Tempo Real
          </p>
          <p className="mt-1 text-xs text-[#5f6863]">
            Rascunho isolado da loja pública
          </p>
        </div>
      </div>

      {/* Lista de Seções Configuradas na Página Inicial */}
      <section className="rounded-2xl border border-[#e6e7e4] bg-white p-6 shadow-sm sm:p-7">
        <div className="flex items-center justify-between border-b border-[#f0f2f0] pb-4">
          <div>
            <h2 className="font-serif text-lg font-bold text-[#202522]">
              Seções da Página Inicial
            </h2>
            <p className="text-xs text-[#5f6863]">
              Controle de visibilidade, ordem e atalho para o editor especializado.
            </p>
          </div>

          <Link
            href="/admin/paginas"
            className="text-xs font-semibold text-[#1f6b4f] hover:underline"
          >
            Gerenciar ordem →
          </Link>
        </div>

        <div className="mt-4 divide-y divide-[#f0f2f0]">
          {sections.map((section) => (
            <div
              key={section.id}
              className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex size-8 items-center justify-center rounded-lg bg-[#fafbf9] text-xs font-bold text-[#7f8d85] border border-[#e6e7e4]">
                  {section.position}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-[#202522]">
                      {section.internal_title}
                    </h3>
                    <span className="rounded-md bg-[#fafbf9] border border-[#e6e7e4] px-2 py-0.5 text-[10px] font-medium uppercase text-[#5f6863]">
                      {section.section_type}
                    </span>
                  </div>
                  <p className="text-xs text-[#7f8d85]">
                    Identificador estável: <code className="text-[#1f6b4f]">{section.stable_key}</code>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                    section.status === "published"
                      ? "bg-[#eaf3ee] text-[#1f6b4f]"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {section.status === "published" ? "Publicada" : "Rascunho"}
                </span>

                <Link
                  href={`/admin/paginas/${section.stable_key}`}
                  className="rounded-xl border border-[#e6e7e4] bg-[#fafbf9] px-3.5 py-1.5 text-xs font-semibold text-[#202522] transition hover:border-[#1f6b4f] hover:bg-white hover:text-[#1f6b4f]"
                >
                  Abrir Editor →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
