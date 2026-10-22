"use client";

import { useState } from "react";
import Link from "next/link";
import { CmsSection, ShowcaseContent } from "@/types/cms";
import { normalizeShowcaseContent } from "@/validations/cms-schemas";

interface CardsGridEditorProps {
  initialSection: CmsSection<ShowcaseContent>;
}

export default function CardsGridEditor({ initialSection }: CardsGridEditorProps) {
  const [section, setSection] = useState<CmsSection<ShowcaseContent>>(initialSection);
  const normalized = normalizeShowcaseContent(
    initialSection.draft_content,
    initialSection.stable_key.includes("novidades") ? "/novidades" : "/conjuntos"
  );

  const [headline, setHeadline] = useState(normalized.section_headline);
  const [subheadline, setSubheadline] = useState(normalized.section_subheadline || "");
  const [badge, setBadge] = useState(normalized.section_badge || "");
  const [viewAllText, setViewAllText] = useState(normalized.view_all_text || "Ver todos");
  const [viewAllUrl, setViewAllUrl] = useState(normalized.view_all_url || "/novidades");
  const [maxItems, setMaxItems] = useState(normalized.max_items || 8);

  const [internalTitle, setInternalTitle] = useState(initialSection.internal_title);
  const [isActive, setIsActive] = useState(initialSection.is_active);

  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const currentContent: ShowcaseContent = {
    section_headline: headline,
    section_subheadline: subheadline,
    section_badge: badge,
    view_all_text: viewAllText,
    view_all_url: viewAllUrl,
    max_items: maxItems,
  };

  async function handleSaveDraft() {
    setIsSavingDraft(true);
    setFeedback(null);

    try {
      const sectionKey = section.stable_key || section.id;
      const res = await fetch(`/api/admin/sections/${sectionKey}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          internal_title: internalTitle,
          draft_content: currentContent,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.errors ? json.errors.join(", ") : json.error || "Erro ao salvar rascunho.");
      }

      setSection((prev) => ({
        ...prev,
        internal_title: internalTitle,
        draft_content: currentContent,
        status: "draft",
      }));

      setFeedback({ type: "success", message: "Rascunho da vitrine salvo com sucesso!" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Falha ao salvar rascunho.";
      setFeedback({ type: "error", message: msg });
    } finally {
      setIsSavingDraft(false);
    }
  }

  async function handlePublish() {
    setIsPublishing(true);
    setFeedback(null);

    try {
      const sectionKey = section.stable_key || section.id;

      await fetch(`/api/admin/sections/${sectionKey}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          internal_title: internalTitle,
          draft_content: currentContent,
        }),
      });

      const res = await fetch(`/api/admin/sections/${sectionKey}/publish`, {
        method: "POST",
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Erro ao publicar vitrine.");
      }

      setSection((prev) => ({
        ...prev,
        published_content: currentContent,
        status: "published",
        published_at: new Date().toISOString(),
      }));

      setFeedback({ type: "success", message: "🎉 Vitrine publicada com sucesso na loja pública!" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Falha ao publicar vitrine.";
      setFeedback({ type: "error", message: msg });
    } finally {
      setIsPublishing(false);
    }
  }

  async function handleToggleVisibility() {
    const nextState = !isActive;
    setIsActive(nextState);

    try {
      const sectionKey = section.stable_key || section.id;
      await fetch(`/api/admin/sections/${sectionKey}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: nextState }),
      });
    } catch {
      setIsActive(!nextState);
    }
  }

  return (
    <div className="mx-auto max-w-[1000px] space-y-6">
      {/* Topo com ações */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#e6e7e4] pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-2xl font-bold tracking-tight text-[#202522]">
              Configurar Vitrine: {headline || "Vitrine de Produtos"}
            </h1>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${
                section.status === "published"
                  ? "bg-[#eaf3ee] text-[#1f6b4f]"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              {section.status === "published" ? "Publicada" : "Rascunho"}
            </span>
          </div>
          <p className="mt-1 text-xs text-[#5f6863]">
            Os produtos desta vitrine são gerenciados diretamente na aba{" "}
            <Link href="/admin/produtos" className="text-[#1f6b4f] font-bold hover:underline">
              Produtos do Catálogo
            </Link>
            . Aqui você edita o cabeçalho e links da seção na Home.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleToggleVisibility}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
              isActive
                ? "border-[#d2e5db] bg-[#eaf3ee] text-[#1f6b4f]"
                : "border-[#e6e7e4] bg-[#fafbf9] text-[#7f8d85]"
            }`}
            type="button"
          >
            <span className={`size-2 rounded-full ${isActive ? "bg-[#1f6b4f]" : "bg-[#7f8d85]"}`} />
            <span>{isActive ? "Vitrine Ativa" : "Vitrine Oculta"}</span>
          </button>

          <button
            onClick={handleSaveDraft}
            disabled={isSavingDraft || isPublishing}
            className="inline-flex items-center gap-2 rounded-xl border border-[#e6e7e4] bg-white px-4 py-2 text-xs font-semibold text-[#202522] shadow-sm transition hover:bg-[#fafbf9] disabled:opacity-60"
            type="button"
          >
            {isSavingDraft ? "Salvando..." : "Salvar Rascunho"}
          </button>

          <button
            onClick={handlePublish}
            disabled={isSavingDraft || isPublishing}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1f6b4f] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#18563f] disabled:opacity-60"
            type="button"
          >
            {isPublishing ? "Publicando..." : "Publicar na Loja"}
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`flex items-start gap-2.5 rounded-xl p-3.5 text-xs ${
            feedback.type === "success"
              ? "border border-[#d2e5db] bg-[#eaf3ee] text-[#1f6b4f]"
              : "border border-red-200 bg-red-50 text-red-800"
          }`}
        >
          <span className="font-bold">{feedback.type === "success" ? "✓" : "⚠"}</span>
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Formulário de Configuração */}
      <div className="rounded-2xl border border-[#e6e7e4] bg-white p-6 shadow-sm space-y-5">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#5f6863]">
            Título Interno no Painel
          </label>
          <input
            type="text"
            value={internalTitle}
            onChange={(e) => setInternalTitle(e.target.value)}
            className="w-full rounded-xl border border-[#e6e7e4] bg-[#fafbf9] px-3.5 py-2 text-xs text-[#202522] focus:border-[#1f6b4f] focus:outline-none"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#5f6863]">
              Selo Superior (Badge Opcional)
            </label>
            <input
              type="text"
              value={badge}
              onChange={(e) => setBadge(e.target.value)}
              className="w-full rounded-xl border border-[#e6e7e4] bg-[#fafbf9] px-3.5 py-2 text-xs text-[#202522] focus:border-[#1f6b4f] focus:outline-none"
              placeholder="Ex: Acabou de chegar"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#5f6863]">
              Título Principal da Vitrine *
            </label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full rounded-xl border border-[#e6e7e4] bg-[#fafbf9] px-3.5 py-2 text-xs text-[#202522] focus:border-[#1f6b4f] focus:outline-none"
              placeholder="Ex: Novidades"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#5f6863]">
            Subtítulo / Mensagem da Vitrine
          </label>
          <textarea
            rows={2}
            value={subheadline}
            onChange={(e) => setSubheadline(e.target.value)}
            className="w-full rounded-xl border border-[#e6e7e4] bg-[#fafbf9] px-3.5 py-2 text-xs text-[#202522] focus:border-[#1f6b4f] focus:outline-none"
            placeholder="Ex: Lançamentos selecionados para compor produções elegantes..."
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#5f6863]">
              Texto do Link
            </label>
            <input
              type="text"
              value={viewAllText}
              onChange={(e) => setViewAllText(e.target.value)}
              className="w-full rounded-xl border border-[#e6e7e4] bg-[#fafbf9] px-3.5 py-2 text-xs text-[#202522] focus:border-[#1f6b4f] focus:outline-none"
              placeholder="Ex: Ver todas as novidades"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#5f6863]">
              URL de Destino
            </label>
            <input
              type="text"
              value={viewAllUrl}
              onChange={(e) => setViewAllUrl(e.target.value)}
              className="w-full rounded-xl border border-[#e6e7e4] bg-[#fafbf9] px-3.5 py-2 text-xs text-[#202522] focus:border-[#1f6b4f] focus:outline-none"
              placeholder="Ex: /novidades ou /conjuntos"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#5f6863]">
              Máximo de Peças na Home
            </label>
            <input
              type="number"
              min={2}
              max={24}
              value={maxItems}
              onChange={(e) => setMaxItems(Number(e.target.value))}
              className="w-full rounded-xl border border-[#e6e7e4] bg-[#fafbf9] px-3.5 py-2 text-xs text-[#202522] focus:border-[#1f6b4f] focus:outline-none"
            />
          </div>
        </div>

        <div className="rounded-xl bg-[#eaf3ee] border border-[#d2e5db] p-4 text-xs text-[#1f6b4f] flex items-center justify-between">
          <div>
            <p className="font-bold">Gerenciar produtos desta vitrine</p>
            <p className="text-[11px] text-[#202522]">
              Para adicionar fotos, preços, tamanhos e marcar produtos como novidade, acesse a gestão de catálogo.
            </p>
          </div>
          <Link
            href="/admin/produtos"
            className="rounded-lg bg-[#1f6b4f] px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-[#18563f]"
          >
            Ir para Produtos →
          </Link>
        </div>
      </div>
    </div>
  );
}
