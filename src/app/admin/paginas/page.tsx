import type { Metadata } from "next";
import { connection } from "next/server";
import Link from "next/link";
import { getAdminPageSections } from "@/services/cms-service";

export const instant = false;

export const metadata: Metadata = {
  title: "Gerenciamento de Seções | Use Três Marias CMS",
  description: "Organize e configure as seções da página inicial.",
};

export default async function AdminPaginasPage() {
  await connection();
  const { sections } = await getAdminPageSections("home");

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-[#202522] md:text-3xl">
            Páginas & Seções
          </h1>
          <p className="text-xs text-[#5f6863]">
            Gerencie a ordem, estado de publicação e conteúdo das seções da Página Inicial.
          </p>
        </div>

        <Link
          href="/admin/paginas/hero"
          className="inline-flex items-center gap-2 rounded-xl bg-[#1f6b4f] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#18563f]"
        >
          <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span>Editar Seção Hero</span>
        </Link>
      </div>

      <div className="rounded-2xl border border-[#e6e7e4] bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between border-b border-[#f0f2f0] pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#7f8d85]">
            Seção da Página
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-[#7f8d85]">
            Ações
          </span>
        </div>

        <div className="space-y-3">
          {sections.map((section) => (
            <div
              key={section.id}
              className="flex flex-col gap-4 rounded-xl border border-[#e6e7e4] bg-[#fafbf9] p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-7 items-center justify-center rounded-lg bg-white border border-[#e6e7e4] text-xs font-bold text-[#202522]">
                  {section.position}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#202522]">
                      {section.internal_title}
                    </h3>
                    <span className="rounded bg-[#eaf3ee] px-2 py-0.5 text-[10px] font-semibold text-[#1f6b4f] uppercase">
                      {section.section_type}
                    </span>
                  </div>
                  <p className="text-xs text-[#7f8d85]">
                    Chave estável: <code className="font-mono text-[#1f6b4f]">{section.stable_key}</code>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                    section.status === "published"
                      ? "bg-[#eaf3ee] text-[#1f6b4f]"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {section.status === "published" ? "Publicada" : "Rascunho"}
                </span>

                <Link
                  href={`/admin/paginas/${section.stable_key}`}
                  className="rounded-lg bg-white border border-[#e6e7e4] px-3 py-1.5 text-xs font-semibold text-[#202522] transition hover:border-[#1f6b4f] hover:text-[#1f6b4f]"
                >
                  Editar Seção →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
