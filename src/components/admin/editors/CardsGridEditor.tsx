/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { CmsSection, CardsGridContent, CardItem } from "@/types/cms";
import CardsGridSection from "@/components/sections/CardsGridSection";

interface CardsGridEditorProps {
  initialSection: CmsSection<CardsGridContent>;
}

export default function CardsGridEditor({ initialSection }: CardsGridEditorProps) {
  const [section, setSection] = useState<CmsSection<CardsGridContent>>(initialSection);
  const [content, setContent] = useState<CardsGridContent>({
    section_badge: initialSection.draft_content.section_badge || "",
    section_headline: initialSection.draft_content.section_headline || "",
    section_subheadline: initialSection.draft_content.section_subheadline || "",
    view_all_text: initialSection.draft_content.view_all_text || "Ver Toda a Coleção",
    view_all_url: initialSection.draft_content.view_all_url || "",
    cards: (initialSection.draft_content.cards && initialSection.draft_content.cards.length === 3
      ? initialSection.draft_content.cards
      : [
          {
            id: "card-1",
            image_url: "",
            alt_text: "",
            title: "Peça 1",
            description: "",
            button_text: "Ver Detalhes",
            button_url: "",
            badge: "",
            is_visible: true,
            position: 1,
          },
          {
            id: "card-2",
            image_url: "",
            alt_text: "",
            title: "Peça 2",
            description: "",
            button_text: "Ver Detalhes",
            button_url: "",
            badge: "",
            is_visible: true,
            position: 2,
          },
          {
            id: "card-3",
            image_url: "",
            alt_text: "",
            title: "Peça 3",
            description: "",
            button_text: "Ver Detalhes",
            button_url: "",
            badge: "",
            is_visible: true,
            position: 3,
          },
        ]) as [CardItem, CardItem, CardItem],
  });

  const [internalTitle, setInternalTitle] = useState(initialSection.internal_title);
  const [isActive, setIsActive] = useState(initialSection.is_active);

  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor");
  const [activeCardIndex, setActiveCardIndex] = useState<0 | 1 | 2>(0);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUploadingIndex, setIsUploadingIndex] = useState<number | null>(null);

  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Upload de Imagem para um Card específico
  async function handleCardUpload(file: File, index: 0 | 1 | 2) {
    setIsUploadingIndex(index);
    setFeedback(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Erro no upload do arquivo.");
      }

      const uploadedUrl = json.data.url;

      setContent((prev) => {
        const updatedCards = [...prev.cards] as [CardItem, CardItem, CardItem];
        updatedCards[index] = {
          ...updatedCards[index],
          image_url: uploadedUrl,
        };
        return { ...prev, cards: updatedCards };
      });

      setFeedback({ type: "success", message: `Imagem do Card ${index + 1} enviada com sucesso!` });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Falha ao enviar imagem.";
      setFeedback({ type: "error", message: msg });
    } finally {
      setIsUploadingIndex(null);
    }
  }

  // Atualizar campo de um card específico
  function updateCardField<K extends keyof CardItem>(index: 0 | 1 | 2, field: K, value: CardItem[K]) {
    setContent((prev) => {
      const updatedCards = [...prev.cards] as [CardItem, CardItem, CardItem];
      updatedCards[index] = {
        ...updatedCards[index],
        [field]: value,
      };
      return { ...prev, cards: updatedCards };
    });
  }

  // Salvar Rascunho
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
          draft_content: content,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        const errorMsg = json.errors ? json.errors.join(", ") : json.error || "Erro ao salvar rascunho.";
        throw new Error(errorMsg);
      }

      setSection((prev) => ({
        ...prev,
        ...(json.data || {}),
        internal_title: internalTitle,
        draft_content: content,
        status: "draft",
      }));

      setFeedback({ type: "success", message: "Rascunho salvo com sucesso! (Não publicado na loja pública)" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Falha ao salvar rascunho.";
      setFeedback({ type: "error", message: msg });
    } finally {
      setIsSavingDraft(false);
    }
  }

  // Publicar na Loja Pública
  async function handlePublish() {
    setIsPublishing(true);
    setFeedback(null);

    try {
      const sectionKey = section.stable_key || section.id;

      // Primeiro garante que o rascunho atual está salvo
      await fetch(`/api/admin/sections/${sectionKey}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          internal_title: internalTitle,
          draft_content: content,
        }),
      });

      const res = await fetch(`/api/admin/sections/${sectionKey}/publish`, {
        method: "POST",
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Erro ao publicar seção.");
      }

      setSection((prev) => ({
        ...prev,
        ...(json.data || {}),
        published_content: content,
        status: "published",
        published_at: new Date().toISOString(),
      }));

      setFeedback({
        type: "success",
        message: "🎉 Seção publicada com sucesso! As 3 peças já estão visíveis na loja pública.",
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Falha ao publicar na loja.";
      setFeedback({ type: "error", message: msg });
    } finally {
      setIsPublishing(false);
    }
  }

  // Alternar Visibilidade
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

  const currentCard = content.cards[activeCardIndex];

  return (
    <div className="mx-auto max-w-[1240px] space-y-6">
      {/* Barra de Ações Superior */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#e6e7e4] pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-2xl font-bold tracking-tight text-[#202522]">
              Editor: {section.internal_title}
            </h1>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${
                section.status === "published"
                  ? "bg-[#eaf3ee] text-[#1f6b4f]"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              {section.status === "published" ? "Publicada" : "Rascunho Pendente"}
            </span>
          </div>
          <p className="mt-1 text-xs text-[#5f6863]">
            Configure o título, subtítulo e as 3 peças/cards de destaque com imagens, descrições e botões.
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
            <span>{isActive ? "Seção Visível" : "Seção Oculta"}</span>
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

      {/* Alerta de Feedback */}
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

      {/* Abas: Editor vs Pré-visualização */}
      <div className="flex items-center justify-between border-b border-[#e6e7e4]">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("editor")}
            className={`border-b-2 px-4 py-2.5 text-xs font-bold transition ${
              activeTab === "editor"
                ? "border-[#1f6b4f] text-[#1f6b4f]"
                : "border-transparent text-[#7f8d85] hover:text-[#202522]"
            }`}
            type="button"
          >
            Configurações & Cards
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={`border-b-2 px-4 py-2.5 text-xs font-bold transition ${
              activeTab === "preview"
                ? "border-[#1f6b4f] text-[#1f6b4f]"
                : "border-transparent text-[#7f8d85] hover:text-[#202522]"
            }`}
            type="button"
          >
            Pré-visualização ao Vivo
          </button>
        </div>

        {activeTab === "preview" && (
          <div className="flex items-center gap-1.5 pb-2">
            <button
              onClick={() => setPreviewDevice("desktop")}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                previewDevice === "desktop"
                  ? "bg-[#1f6b4f] text-white"
                  : "bg-[#eaf3ee] text-[#1f6b4f]"
              }`}
              type="button"
            >
              Desktop
            </button>
            <button
              onClick={() => setPreviewDevice("mobile")}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
                previewDevice === "mobile"
                  ? "bg-[#1f6b4f] text-white"
                  : "bg-[#eaf3ee] text-[#1f6b4f]"
              }`}
              type="button"
            >
              Mobile
            </button>
          </div>
        )}
      </div>

      {/* Conteúdo da Aba */}
      {activeTab === "editor" ? (
        <div className="space-y-6">
          {/* 1. Cabeçalho Geral da Seção */}
          <div className="rounded-2xl border border-[#e6e7e4] bg-white p-6 shadow-sm">
            <h2 className="mb-4 font-serif text-base font-bold text-[#202522]">
              Configurações do Bloco
            </h2>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#5f6863]">
                  Título Interno (Painel)
                </label>
                <input
                  type="text"
                  value={internalTitle}
                  onChange={(e) => setInternalTitle(e.target.value)}
                  className="w-full rounded-xl border border-[#e6e7e4] bg-[#fafbf9] px-3.5 py-2 text-xs text-[#202522] focus:border-[#1f6b4f] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#5f6863]">
                  Tag Superior (Badge)
                </label>
                <input
                  type="text"
                  value={content.section_badge || ""}
                  onChange={(e) => setContent({ ...content, section_badge: e.target.value })}
                  placeholder="Ex: Coleção Exclusiva"
                  className="w-full rounded-xl border border-[#e6e7e4] bg-[#fafbf9] px-3.5 py-2 text-xs text-[#202522] focus:border-[#1f6b4f] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#5f6863]">
                  Título Principal da Seção *
                </label>
                <input
                  type="text"
                  value={content.section_headline}
                  onChange={(e) => setContent({ ...content, section_headline: e.target.value })}
                  placeholder="Ex: Vestidos Elegantes"
                  className="w-full rounded-xl border border-[#e6e7e4] bg-[#fafbf9] px-3.5 py-2 text-xs text-[#202522] focus:border-[#1f6b4f] focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#5f6863]">
                  Subtítulo / Descrição da Seção
                </label>
                <input
                  type="text"
                  value={content.section_subheadline || ""}
                  onChange={(e) => setContent({ ...content, section_subheadline: e.target.value })}
                  placeholder="Ex: Peças que unem sofisticação e caimento impecável..."
                  className="w-full rounded-xl border border-[#e6e7e4] bg-[#fafbf9] px-3.5 py-2 text-xs text-[#202522] focus:border-[#1f6b4f] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#5f6863]">
                  Texto do Botão &quot;Ver Todos&quot;
                </label>
                <input
                  type="text"
                  value={content.view_all_text || ""}
                  onChange={(e) => setContent({ ...content, view_all_text: e.target.value })}
                  placeholder="Ex: Ver Toda a Coleção"
                  className="w-full rounded-xl border border-[#e6e7e4] bg-[#fafbf9] px-3.5 py-2 text-xs text-[#202522] focus:border-[#1f6b4f] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 2. Seleção de Card (Card 1, Card 2, Card 3) */}
          <div className="rounded-2xl border border-[#e6e7e4] bg-white p-6 shadow-sm">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-serif text-base font-bold text-[#202522]">
                  Gerenciamento dos 3 Cards
                </h2>
                <p className="text-xs text-[#5f6863]">
                  Selecione o card desejado para configurar a foto e informações da peça.
                </p>
              </div>

              {/* Botões de Alternância de Card */}
              <div className="inline-flex rounded-xl border border-[#e6e7e4] bg-[#fafbf9] p-1">
                {([0, 1, 2] as const).map((idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveCardIndex(idx)}
                    className={`rounded-lg px-4 py-1.5 text-xs font-bold transition ${
                      activeCardIndex === idx
                        ? "bg-white text-[#1f6b4f] shadow-xs"
                        : "text-[#7f8d85] hover:text-[#202522]"
                    }`}
                    type="button"
                  >
                    Card {idx + 1}: {content.cards[idx]?.title || `Peça ${idx + 1}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Formulário do Card Selecionado */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Coluna da Imagem e Pré-visualização do Card */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#5f6863]">
                    Imagem do Card {activeCardIndex + 1}
                  </label>
                  <label className="cursor-pointer text-xs font-bold text-[#1f6b4f] hover:underline">
                    {isUploadingIndex === activeCardIndex ? "Enviando imagem..." : "Fazer Upload ↑"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={isUploadingIndex !== null}
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          handleCardUpload(e.target.files[0], activeCardIndex);
                        }
                      }}
                    />
                  </label>
                </div>

                <input
                  type="text"
                  value={currentCard?.image_url || ""}
                  onChange={(e) => updateCardField(activeCardIndex, "image_url", e.target.value)}
                  placeholder="URL da foto ou faça upload pelo botão acima"
                  className="w-full rounded-xl border border-[#e6e7e4] bg-[#fafbf9] px-3.5 py-2 text-xs text-[#202522] focus:border-[#1f6b4f] focus:outline-none"
                />

                {/* Miniatura com Proporção de Moda */}
                <div className="relative aspect-[3/4] max-h-[320px] w-full overflow-hidden rounded-xl border border-[#e6e7e4] bg-[#f0f2f0]">
                  {currentCard?.image_url ? (
                    <img
                      src={currentCard.image_url}
                      alt={currentCard.alt_text || currentCard.title}
                      className="size-full object-cover"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center text-xs text-[#9ea7a2]">
                      Nenhuma imagem selecionada
                    </div>
                  )}

                  {currentCard?.badge && (
                    <span className="absolute top-2.5 left-2.5 rounded-md bg-white/95 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#1f6b4f] shadow-xs">
                      {currentCard.badge}
                    </span>
                  )}
                </div>
              </div>

              {/* Coluna de Textos e Detalhes da Peça */}
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#5f6863]">
                    Título da Peça *
                  </label>
                  <input
                    type="text"
                    value={currentCard?.title || ""}
                    onChange={(e) => updateCardField(activeCardIndex, "title", e.target.value)}
                    placeholder="Ex: Vestido Midi Linho Cru"
                    className="w-full rounded-xl border border-[#e6e7e4] bg-[#fafbf9] px-3.5 py-2 text-xs text-[#202522] focus:border-[#1f6b4f] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#5f6863]">
                    Selo / Badge (Opcional)
                  </label>
                  <input
                    type="text"
                    value={currentCard?.badge || ""}
                    onChange={(e) => updateCardField(activeCardIndex, "badge", e.target.value)}
                    placeholder="Ex: Lançamento, Destaque, Mais Vendido"
                    className="w-full rounded-xl border border-[#e6e7e4] bg-[#fafbf9] px-3.5 py-2 text-xs text-[#202522] focus:border-[#1f6b4f] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#5f6863]">
                    Descrição Curta da Peça
                  </label>
                  <textarea
                    rows={2}
                    value={currentCard?.description || ""}
                    onChange={(e) => updateCardField(activeCardIndex, "description", e.target.value)}
                    placeholder="Ex: Fluidez e caimento impecável com tecido de alta qualidade."
                    className="w-full rounded-xl border border-[#e6e7e4] bg-[#fafbf9] px-3.5 py-2 text-xs text-[#202522] focus:border-[#1f6b4f] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#5f6863]">
                      Texto do Botão
                    </label>
                    <input
                      type="text"
                      value={currentCard?.button_text || ""}
                      onChange={(e) => updateCardField(activeCardIndex, "button_text", e.target.value)}
                      placeholder="Ex: Ver Detalhes"
                      className="w-full rounded-xl border border-[#e6e7e4] bg-[#fafbf9] px-3.5 py-2 text-xs text-[#202522] focus:border-[#1f6b4f] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#5f6863]">
                      Link do Botão
                    </label>
                    <input
                      type="text"
                      value={currentCard?.button_url || ""}
                      onChange={(e) => updateCardField(activeCardIndex, "button_url", e.target.value)}
                      placeholder="Ex: /#novidades"
                      className="w-full rounded-xl border border-[#e6e7e4] bg-[#fafbf9] px-3.5 py-2 text-xs text-[#202522] focus:border-[#1f6b4f] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#5f6863]">
                    Texto Alternativo (Alt de Acessibilidade)
                  </label>
                  <input
                    type="text"
                    value={currentCard?.alt_text || ""}
                    onChange={(e) => updateCardField(activeCardIndex, "alt_text", e.target.value)}
                    placeholder="Descrição da peça para pessoas com deficiência visual"
                    className="w-full rounded-xl border border-[#e6e7e4] bg-[#fafbf9] px-3.5 py-2 text-xs text-[#202522] focus:border-[#1f6b4f] focus:outline-none"
                  />
                </div>

                <div className="pt-2">
                  <label className="inline-flex items-center gap-2 text-xs font-semibold text-[#202522] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={currentCard?.is_visible !== false}
                      onChange={(e) => updateCardField(activeCardIndex, "is_visible", e.target.checked)}
                      className="size-4 rounded accent-[#1f6b4f]"
                    />
                    <span>Card visível na grade da seção</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Aba de Pré-visualização ao Vivo */
        <div className="rounded-2xl border border-[#e6e7e4] bg-white p-6 shadow-sm">
          <div className="mb-4">
            <span className="text-xs font-semibold text-[#5f6863]">
              Pré-visualização de como esta seção aparecerá na loja pública:
            </span>
          </div>

          <div
            className={`mx-auto overflow-hidden rounded-2xl border border-[#e6e7e4] transition-all duration-300 ${
              previewDevice === "mobile" ? "max-w-[420px]" : "w-full"
            }`}
          >
            <CardsGridSection stableKey={section.stable_key} content={content} />
          </div>
        </div>
      )}
    </div>
  );
}
