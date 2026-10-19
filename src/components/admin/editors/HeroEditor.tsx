"use client";

import { useState } from "react";
import { CmsSection, HeroContent } from "@/types/cms";

interface HeroEditorProps {
  initialSection: CmsSection<HeroContent>;
}

export default function HeroEditor({ initialSection }: HeroEditorProps) {
  const [section, setSection] = useState<CmsSection<HeroContent>>(initialSection);
  const [content, setContent] = useState<HeroContent>({
    desktop_image_url: initialSection.draft_content.desktop_image_url || "",
    mobile_image_url: initialSection.draft_content.mobile_image_url || "",
    alt_text: initialSection.draft_content.alt_text || "",
    title: initialSection.draft_content.title || "",
    description: initialSection.draft_content.description || "",
    button_text: initialSection.draft_content.button_text || "Explorar Novidades",
    button_url: initialSection.draft_content.button_url || "/#novidades",
    content_alignment: initialSection.draft_content.content_alignment || "left",
    image_position: initialSection.draft_content.image_position || "background",
    overlay_opacity: typeof initialSection.draft_content.overlay_opacity === "number" ? initialSection.draft_content.overlay_opacity : 30,
  });

  const [internalTitle, setInternalTitle] = useState(initialSection.internal_title);
  const [isActive, setIsActive] = useState(initialSection.is_active);

  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUploading, setIsUploading] = useState<"desktop" | "mobile" | null>(null);

  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Manipulador de upload de imagem para Supabase Storage
  async function handleFileUpload(file: File, target: "desktop" | "mobile") {
    setIsUploading(target);
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

      setContent((prev) => ({
        ...prev,
        [target === "desktop" ? "desktop_image_url" : "mobile_image_url"]: uploadedUrl,
      }));

      setFeedback({ type: "success", message: `Imagem de ${target} enviada com sucesso!` });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Falha ao enviar imagem.";
      setFeedback({ type: "error", message: msg });
    } finally {
      setIsUploading(null);
    }
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
        message: "🎉 Seção Hero publicada com sucesso! As alterações já estão visíveis na loja pública.",
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
      // Reverter se falhar
      setIsActive(!nextState);
    }
  }

  return (
    <div className="mx-auto max-w-[1240px] space-y-6">
      {/* Barra de Ações e Estado Superior */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#e6e7e4] pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-2xl font-bold tracking-tight text-[#202522]">
              Editor da Seção Hero
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
            Configure o banner principal de destaque com imagens, títulos, chamadas e links.
          </p>
        </div>

        {/* Botões de Ação */}
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

      {/* Navegação entre Editor e Pré-visualização */}
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
            Configurações & Conteúdo
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

      {/* Conteúdo da Aba Ativa */}
      {activeTab === "editor" ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Coluna 1: Textos, Chamadas e Botão */}
          <div className="space-y-5 rounded-2xl border border-[#e6e7e4] bg-white p-6 shadow-sm">
            <h2 className="font-serif text-base font-bold text-[#202522]">
              Conteúdo & Textos
            </h2>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#5f6863]">
                Título Interno (Identificação no Painel)
              </label>
              <input
                type="text"
                value={internalTitle}
                onChange={(e) => setInternalTitle(e.target.value)}
                className="w-full rounded-xl border border-[#e6e7e4] bg-[#fafbf9] px-3.5 py-2 text-xs text-[#202522] focus:border-[#1f6b4f] focus:outline-none"
                placeholder="Ex: Hero Principal - Lançamento Coleção"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#5f6863]">
                Título Principal da Hero *
              </label>
              <textarea
                rows={2}
                value={content.title}
                onChange={(e) => setContent({ ...content, title: e.target.value })}
                className="w-full rounded-xl border border-[#e6e7e4] bg-[#fafbf9] px-3.5 py-2 text-sm text-[#202522] focus:border-[#1f6b4f] focus:outline-none"
                placeholder="Ex: Elegância atemporal para realçar a sua essência"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#5f6863]">
                Descrição / Texto Complementar
              </label>
              <textarea
                rows={3}
                value={content.description}
                onChange={(e) => setContent({ ...content, description: e.target.value })}
                className="w-full rounded-xl border border-[#e6e7e4] bg-[#fafbf9] px-3.5 py-2 text-xs text-[#202522] focus:border-[#1f6b4f] focus:outline-none"
                placeholder="Ex: Descubra semijoias exclusivas criadas com design contemporâneo..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#5f6863]">
                  Texto do Botão (CTA)
                </label>
                <input
                  type="text"
                  value={content.button_text}
                  onChange={(e) => setContent({ ...content, button_text: e.target.value })}
                  className="w-full rounded-xl border border-[#e6e7e4] bg-[#fafbf9] px-3.5 py-2 text-xs text-[#202522] focus:border-[#1f6b4f] focus:outline-none"
                  placeholder="Ex: Explorar Novidades"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#5f6863]">
                  Link de Destino
                </label>
                <input
                  type="text"
                  value={content.button_url}
                  onChange={(e) => setContent({ ...content, button_url: e.target.value })}
                  className="w-full rounded-xl border border-[#e6e7e4] bg-[#fafbf9] px-3.5 py-2 text-xs text-[#202522] focus:border-[#1f6b4f] focus:outline-none"
                  placeholder="Ex: /#novidades"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#5f6863]">
                Texto Alternativo (Acessibilidade Alt)
              </label>
              <input
                type="text"
                value={content.alt_text}
                onChange={(e) => setContent({ ...content, alt_text: e.target.value })}
                className="w-full rounded-xl border border-[#e6e7e4] bg-[#fafbf9] px-3.5 py-2 text-xs text-[#202522] focus:border-[#1f6b4f] focus:outline-none"
                placeholder="Descrição acessível da imagem para leitores de tela"
              />
            </div>
          </div>

          {/* Coluna 2: Imagens, Alinhamento e Estilo */}
          <div className="space-y-5 rounded-2xl border border-[#e6e7e4] bg-white p-6 shadow-sm">
            <h2 className="font-serif text-base font-bold text-[#202522]">
              Imagens & Apresentação Visual
            </h2>

            {/* Imagem Desktop */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#5f6863]">
                  Imagem para Desktop (1920x800 recomendada)
                </label>
                <label className="cursor-pointer text-xs font-bold text-[#1f6b4f] hover:underline">
                  {isUploading === "desktop" ? "Enviando..." : "Fazer Upload ↑"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={isUploading !== null}
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleFileUpload(e.target.files[0], "desktop");
                    }}
                  />
                </label>
              </div>
              <input
                type="text"
                value={content.desktop_image_url}
                onChange={(e) => setContent({ ...content, desktop_image_url: e.target.value })}
                className="w-full rounded-xl border border-[#e6e7e4] bg-[#fafbf9] px-3.5 py-2 text-xs text-[#202522] focus:border-[#1f6b4f] focus:outline-none"
                placeholder="URL da imagem desktop ou use o botão de upload acima"
              />
            </div>

            {/* Imagem Mobile */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#5f6863]">
                  Imagem para Mobile (Opcional - 768x900 recomendada)
                </label>
                <label className="cursor-pointer text-xs font-bold text-[#1f6b4f] hover:underline">
                  {isUploading === "mobile" ? "Enviando..." : "Fazer Upload ↑"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={isUploading !== null}
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleFileUpload(e.target.files[0], "mobile");
                    }}
                  />
                </label>
              </div>
              <input
                type="text"
                value={content.mobile_image_url}
                onChange={(e) => setContent({ ...content, mobile_image_url: e.target.value })}
                className="w-full rounded-xl border border-[#e6e7e4] bg-[#fafbf9] px-3.5 py-2 text-xs text-[#202522] focus:border-[#1f6b4f] focus:outline-none"
                placeholder="URL da imagem mobile (ou manter vazio para usar desktop)"
              />
            </div>

            {/* Alinhamento do Conteúdo */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#5f6863]">
                  Alinhamento do Texto
                </label>
                <select
                  value={content.content_alignment}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      content_alignment: e.target.value as "left" | "center" | "right",
                    })
                  }
                  className="w-full rounded-xl border border-[#e6e7e4] bg-[#fafbf9] px-3.5 py-2 text-xs text-[#202522] focus:border-[#1f6b4f] focus:outline-none"
                >
                  <option value="left">Esquerda (Padrão)</option>
                  <option value="center">Centralizado</option>
                  <option value="right">Direita</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#5f6863]">
                  Layout da Imagem
                </label>
                <select
                  value={content.image_position}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      image_position: e.target.value as "background" | "split-right" | "split-left",
                    })
                  }
                  className="w-full rounded-xl border border-[#e6e7e4] bg-[#fafbf9] px-3.5 py-2 text-xs text-[#202522] focus:border-[#1f6b4f] focus:outline-none"
                >
                  <option value="background">Imagem no Fundo (Background)</option>
                  <option value="split-right">Dividido (Imagem à Direita)</option>
                  <option value="split-left">Dividido (Imagem à Esquerda)</option>
                </select>
              </div>
            </div>

            {/* Controle de Opacidade da Sobreposição */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#5f6863]">
                  Opacidade de Contraste (Legibilidade)
                </label>
                <span className="text-xs font-bold text-[#1f6b4f]">
                  {content.overlay_opacity}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="80"
                value={content.overlay_opacity}
                onChange={(e) => setContent({ ...content, overlay_opacity: Number(e.target.value) })}
                className="w-full accent-[#1f6b4f]"
              />
              <p className="mt-1 text-[11px] text-[#7f8d85]">
                Aplica um filtro escuro suave sobre a imagem para garantir que o texto fique sempre legível.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Aba de Pré-visualização ao Vivo */
        <div className="rounded-2xl border border-[#e6e7e4] bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs font-semibold text-[#5f6863]">
              Exibindo visualização aproximada de como a Hero ficará na loja pública:
            </span>
          </div>

          <div
            className={`mx-auto overflow-hidden rounded-2xl border border-[#e6e7e4] transition-all duration-300 ${
              previewDevice === "mobile" ? "max-w-[390px]" : "w-full"
            }`}
          >
            {/* Componente Hero Simulado com os dados do editor */}
            <div className="relative min-h-[460px] flex items-center bg-[#18221e] text-white overflow-hidden">
              {/* Imagem de Fundo */}
              <div
                className="absolute inset-0 bg-cover bg-center transition-all duration-500"
                style={{
                  backgroundImage: `url(${
                    previewDevice === "mobile" && content.mobile_image_url
                      ? content.mobile_image_url
                      : content.desktop_image_url || "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908"
                  })`,
                }}
              />

              {/* Filtro de Opacidade */}
              <div
                className="absolute inset-0 bg-black transition-opacity"
                style={{ opacity: content.overlay_opacity / 100 }}
              />

              {/* Conteúdo Sobreposto */}
              <div
                className={`relative z-10 w-full p-8 md:p-14 ${
                  content.content_alignment === "center"
                    ? "text-center"
                    : content.content_alignment === "right"
                    ? "text-right"
                    : "text-left"
                }`}
              >
                <div
                  className={`max-w-xl ${
                    content.content_alignment === "center"
                      ? "mx-auto"
                      : content.content_alignment === "right"
                      ? "ml-auto"
                      : ""
                  }`}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#a9cbbb] mb-2">
                    Use Três Marias
                  </p>
                  <h1 className="font-serif text-2xl font-bold leading-tight md:text-4xl text-white">
                    {content.title || "Título de Exemplo da Coleção"}
                  </h1>
                  {content.description && (
                    <p className="mt-3 text-xs leading-relaxed text-[#dce3df] md:text-sm">
                      {content.description}
                    </p>
                  )}
                  {content.button_text && (
                    <div className="mt-6">
                      <span className="inline-block rounded-xl bg-[#1f6b4f] px-6 py-3 text-xs font-semibold tracking-wider uppercase text-white shadow-md">
                        {content.button_text}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
