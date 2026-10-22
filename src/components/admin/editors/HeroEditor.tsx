"use client";

import { useState } from "react";
import { CmsSection, HeroContent, HeroSlide, HERO_INTERVAL_MIN, HERO_INTERVAL_MAX, HERO_MAX_SLIDES } from "@/types/cms";
import { normalizeHeroContent } from "@/validations/cms-schemas";
import HeroCarousel from "@/components/sections/HeroCarousel";

interface HeroEditorProps {
  initialSection: CmsSection<HeroContent>;
}

export default function HeroEditor({ initialSection }: HeroEditorProps) {
  const [section, setSection] = useState<CmsSection<HeroContent>>(initialSection);
  const normalizedInitial = normalizeHeroContent(initialSection.draft_content);

  const [intervalSeconds, setIntervalSeconds] = useState(normalizedInitial.interval_seconds || 5);
  const [slides, setSlides] = useState<HeroSlide[]>(normalizedInitial.slides);
  const [internalTitle, setInternalTitle] = useState(initialSection.internal_title);
  const [isActive, setIsActive] = useState(initialSection.is_active);

  const [activeTab, setActiveTab] = useState<"editor" | "preview">("editor");
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUploading, setIsUploading] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const currentContent: HeroContent = {
    interval_seconds: intervalSeconds,
    slides,
  };

  // Upload de imagem para um slide específico
  async function handleFileUpload(file: File, slideIdx: number) {
    setIsUploading(slideIdx);
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

      setSlides((prev) =>
        prev.map((s, idx) => (idx === slideIdx ? { ...s, image_url: uploadedUrl } : s))
      );

      setFeedback({ type: "success", message: `Imagem do slide ${slideIdx + 1} enviada com sucesso!` });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Falha ao enviar imagem.";
      setFeedback({ type: "error", message: msg });
    } finally {
      setIsUploading(null);
    }
  }

  // Adicionar novo slide
  function handleAddSlide() {
    if (slides.length >= HERO_MAX_SLIDES) {
      setFeedback({ type: "error", message: `Limite máximo de ${HERO_MAX_SLIDES} slides atingido.` });
      return;
    }

    const newSlide: HeroSlide = {
      id: `slide-${Date.now()}`,
      image_url: "",
      mobile_image_url: "",
      alt_text: `Novo slide ${slides.length + 1}`,
      image_fit: "cover",
      eyebrow: "Coleção Primavera • 2026",
      title: "",
      description: "",
      button_text: "Conheça a coleção",
      button_url: "/novidades",
    };

    setSlides([...slides, newSlide]);
    setActiveSlideIndex(slides.length);
  }

  // Remover slide
  function handleRemoveSlide(idxToRemove: number) {
    if (slides.length <= 1) {
      setFeedback({ type: "error", message: "O carrossel precisa ter pelo menos um slide." });
      return;
    }

    const next = slides.filter((_, idx) => idx !== idxToRemove);
    setSlides(next);
    if (activeSlideIndex >= next.length) {
      setActiveSlideIndex(Math.max(0, next.length - 1));
    }
  }

  // Mover slide na ordem
  function handleMoveSlide(fromIdx: number, direction: "up" | "down") {
    const toIdx = direction === "up" ? fromIdx - 1 : fromIdx + 1;
    if (toIdx < 0 || toIdx >= slides.length) return;

    const copy = [...slides];
    const [moved] = copy.splice(fromIdx, 1);
    copy.splice(toIdx, 0, moved);
    setSlides(copy);
    setActiveSlideIndex(toIdx);
  }

  // Atualizar campo de um slide
  function updateSlide(idx: number, patch: Partial<HeroSlide>) {
    setSlides((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
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
          draft_content: currentContent,
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
        draft_content: currentContent,
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

      // Salva rascunho antes de publicar
      const saveRes = await fetch(`/api/admin/sections/${sectionKey}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          internal_title: internalTitle,
          draft_content: currentContent,
        }),
      });

      const saveJson = await saveRes.json();
      if (!saveRes.ok || !saveJson.success) {
        const errorMsg = saveJson.errors ? saveJson.errors.join(", ") : saveJson.error || "Erro ao salvar rascunho antes da publicação.";
        throw new Error(errorMsg);
      }

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
        published_content: currentContent,
        status: "published",
        published_at: new Date().toISOString(),
      }));

      setFeedback({
        type: "success",
        message: "🎉 Carrossel publicado com sucesso! As alterações já estão visíveis na loja pública.",
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

  const activeSlide = slides[activeSlideIndex] || slides[0];

  return (
    <div className="mx-auto max-w-[1240px] space-y-6">
      {/* Barra de Ações Superior */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#e6e7e4] pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-2xl font-bold tracking-tight text-[#202522]">
              Editor do Carrossel Hero
            </h1>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${
                section.status === "published"
                  ? "bg-[#eaf3ee] text-[#1f6b4f]"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              {section.status === "published" ? "Publicado" : "Rascunho Pendente"}
            </span>
          </div>
          <p className="mt-1 text-xs text-[#5f6863]">
            Adicione slides com fotos institucionais (Quem Somos, Propósito, etc.), controle o tempo de rotação e personalize frases e botões.
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
            <span>{isActive ? "Carrossel Visível" : "Carrossel Oculto"}</span>
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

      {/* Abas: Editor vs Preview */}
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
            Gerenciar Slides & Tempo
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
            Pré-visualização do Carrossel ({slides.length} {slides.length === 1 ? "slide" : "slides"})
          </button>
        </div>
      </div>

      {activeTab === "editor" ? (
        <div className="space-y-6">
          {/* Card de Configuração Geral: Tempo de Rolagem */}
          <div className="rounded-2xl border border-[#e6e7e4] bg-white p-6 shadow-sm">
            <h2 className="font-serif text-base font-bold text-[#202522] mb-1">
              Configurações Gerais do Carrossel
            </h2>
            <p className="text-xs text-[#777d78] mb-5">
              Defina o tempo de exibição automática de cada foto e a identificação interna.
            </p>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#5f6863]">
                  Identificação Interna
                </label>
                <input
                  type="text"
                  value={internalTitle}
                  onChange={(e) => setInternalTitle(e.target.value)}
                  className="w-full rounded-xl border border-[#e6e7e4] bg-[#fafbf9] px-3.5 py-2 text-xs text-[#202522] focus:border-[#1f6b4f] focus:outline-none"
                  placeholder="Ex: Hero – Carrossel Institucional"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#5f6863]">
                    Tempo de Rolagem Automática
                  </label>
                  <span className="text-xs font-bold text-[#1f6b4f] rounded-md bg-[#eaf3ee] px-2 py-0.5">
                    {intervalSeconds} segundos por slide
                  </span>
                </div>
                <input
                  type="range"
                  min={HERO_INTERVAL_MIN}
                  max={HERO_INTERVAL_MAX}
                  value={intervalSeconds}
                  onChange={(e) => setIntervalSeconds(Number(e.target.value))}
                  className="w-full accent-[#1f6b4f] mt-1"
                />
                <div className="flex justify-between text-[10px] text-[#777d78] mt-1">
                  <span>Rápido ({HERO_INTERVAL_MIN}s)</span>
                  <span>Padrão (5s–6s)</span>
                  <span>Lento ({HERO_INTERVAL_MAX}s)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Gerenciamento de Slides: Lista à Esquerda + Editor à Direita */}
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Lista e Reordenação de Slides */}
            <div className="lg:col-span-4 rounded-2xl border border-[#e6e7e4] bg-white p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-sm font-bold text-[#202522]">
                    Slides ({slides.length}/{HERO_MAX_SLIDES})
                  </h3>
                  <p className="text-[11px] text-[#777d78]">Selecione um slide para editar</p>
                </div>

                <button
                  type="button"
                  onClick={handleAddSlide}
                  disabled={slides.length >= HERO_MAX_SLIDES}
                  className="rounded-lg bg-[#1f6b4f] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#18563f] disabled:opacity-50"
                >
                  + Adicionar
                </button>
              </div>

              <div className="space-y-2">
                {slides.map((s, idx) => (
                  <div
                    key={s.id || idx}
                    onClick={() => setActiveSlideIndex(idx)}
                    className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition ${
                      activeSlideIndex === idx
                        ? "border-[#1f6b4f] bg-[#eaf3ee]/60 shadow-xs"
                        : "border-[#e6e7e4] bg-[#fafbf9] hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-white border border-[#e6e7e4] text-[11px] font-bold text-[#202522]">
                        {idx + 1}
                      </span>
                      {s.image_url ? (
                        <img
                          src={s.image_url}
                          alt="thumb"
                          className="size-9 rounded-md object-cover border border-[#e6e7e4] shrink-0"
                        />
                      ) : (
                        <div className="size-9 rounded-md bg-[#e6e7e4] flex items-center justify-center text-[10px] text-[#777d78] shrink-0">
                          Sem foto
                        </div>
                      )}
                      <div className="overflow-hidden">
                        <p className="text-xs font-semibold text-[#202522] truncate">
                          {s.title || s.alt_text || `Slide ${idx + 1}`}
                        </p>
                        <p className="text-[10px] text-[#777d78] capitalize">
                          {s.image_fit === "contain" ? "Arte pronta (contain)" : "Tela cheia (cover)"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => handleMoveSlide(idx, "up")}
                        title="Mover para cima"
                        className="p-1 text-[#777d78] hover:text-[#1f6b4f] disabled:opacity-30"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        disabled={idx === slides.length - 1}
                        onClick={() => handleMoveSlide(idx, "down")}
                        title="Mover para baixo"
                        className="p-1 text-[#777d78] hover:text-[#1f6b4f] disabled:opacity-30"
                      >
                        ▼
                      </button>
                      <button
                        type="button"
                        disabled={slides.length <= 1}
                        onClick={() => handleRemoveSlide(idx)}
                        title="Remover slide"
                        className="p-1 text-[#777d78] hover:text-red-700 disabled:opacity-30"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Formulário de Edição do Slide Ativo */}
            {activeSlide && (
              <div className="lg:col-span-8 rounded-2xl border border-[#e6e7e4] bg-white p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-[#f0f2f0] pb-3">
                  <h3 className="font-serif text-base font-bold text-[#202522]">
                    Editando Slide {activeSlideIndex + 1} de {slides.length}
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleRemoveSlide(activeSlideIndex)}
                    disabled={slides.length <= 1}
                    className="text-xs font-semibold text-red-600 hover:text-red-800 disabled:opacity-40"
                  >
                    Excluir este slide
                  </button>
                </div>

                {/* Upload e URL da Foto */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold uppercase tracking-wider text-[#5f6863]">
                      Imagem do Slide *
                    </label>
                    <label className="cursor-pointer text-xs font-bold text-[#1f6b4f] hover:underline">
                      {isUploading === activeSlideIndex ? "Enviando imagem..." : "Fazer Upload de Foto ↑"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={isUploading !== null}
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            handleFileUpload(e.target.files[0], activeSlideIndex);
                          }
                        }}
                      />
                    </label>
                  </div>
                  <input
                    type="text"
                    value={activeSlide.image_url}
                    onChange={(e) => updateSlide(activeSlideIndex, { image_url: e.target.value })}
                    className="w-full rounded-xl border border-[#e6e7e4] bg-[#fafbf9] px-3.5 py-2 text-xs text-[#202522] focus:border-[#1f6b4f] focus:outline-none"
                    placeholder="URL da imagem ou envie uma foto acima"
                  />
                </div>

                {/* Prévia da Foto do Slide */}
                {activeSlide.image_url && (
                  <div className="flex items-center gap-4 p-3 rounded-xl bg-[#fafbf9] border border-[#e6e7e4]">
                    <img
                      src={activeSlide.image_url}
                      alt="Prévia"
                      className="size-20 rounded-lg object-contain bg-[#16302a] border border-[#e6e7e4]"
                    />
                    <div className="text-xs space-y-1">
                      <p className="font-semibold text-[#202522]">Prévia da imagem carregada</p>
                      <p className="text-[11px] text-[#777d78]">
                        Dica: para as artes verticais (como as que você enviou), use o modo <strong>Arte Pronta (contain)</strong> abaixo para não cortar nenhum texto.
                      </p>
                    </div>
                  </div>
                )}

                {/* Enquadramento da Imagem */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#5f6863]">
                      Formato de Exibição da Imagem
                    </label>
                    <select
                      value={activeSlide.image_fit}
                      onChange={(e) =>
                        updateSlide(activeSlideIndex, {
                          image_fit: e.target.value as "contain" | "cover",
                        })
                      }
                      className="w-full rounded-xl border border-[#e6e7e4] bg-[#fafbf9] px-3.5 py-2 text-xs text-[#202522] focus:border-[#1f6b4f] focus:outline-none"
                    >
                      <option value="contain">Arte Pronta / Proporcional (Recomendado para artes 4:5)</option>
                      <option value="cover">Preencher tela inteira (Cover)</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#5f6863]">
                      Texto Alternativo (Acessibilidade)
                    </label>
                    <input
                      type="text"
                      value={activeSlide.alt_text}
                      onChange={(e) => updateSlide(activeSlideIndex, { alt_text: e.target.value })}
                      className="w-full rounded-xl border border-[#e6e7e4] bg-[#fafbf9] px-3.5 py-2 text-xs text-[#202522] focus:border-[#1f6b4f] focus:outline-none"
                      placeholder="Ex: Arte Quem Somos – Use Três Marias"
                    />
                  </div>
                </div>

                {/* Textos Opcionais por cima do Slide */}
                <div className="border-t border-[#f0f2f0] pt-4 space-y-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#202522]">
                      Frases & Textos Sobrepostos (Opcional)
                    </h4>
                    <p className="text-[11px] text-[#777d78]">
                      Se a imagem já tiver o texto desenhado na própria arte, deixe estes campos em branco.
                    </p>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#5f6863]">
                      Sobretítulo / Coleção (Eyebrow)
                    </label>
                    <input
                      type="text"
                      value={activeSlide.eyebrow || ""}
                      onChange={(e) => updateSlide(activeSlideIndex, { eyebrow: e.target.value })}
                      className="w-full rounded-xl border border-[#e6e7e4] bg-[#fafbf9] px-3.5 py-2 text-xs text-[#202522] focus:border-[#1f6b4f] focus:outline-none"
                      placeholder="Ex: Coleção Primavera • 2026"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#5f6863]">
                      Título do Slide
                    </label>
                    <input
                      type="text"
                      value={activeSlide.title || ""}
                      onChange={(e) => updateSlide(activeSlideIndex, { title: e.target.value })}
                      className="w-full rounded-xl border border-[#e6e7e4] bg-[#fafbf9] px-3.5 py-2 text-xs text-[#202522] focus:border-[#1f6b4f] focus:outline-none"
                      placeholder="Ex: Seu estilo.<br>Do seu jeito."
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#5f6863]">
                      Frase / Mensagem
                    </label>
                    <textarea
                      rows={2}
                      value={activeSlide.description || ""}
                      onChange={(e) => updateSlide(activeSlideIndex, { description: e.target.value })}
                      className="w-full rounded-xl border border-[#e6e7e4] bg-[#fafbf9] px-3.5 py-2 text-xs text-[#202522] focus:border-[#1f6b4f] focus:outline-none"
                      placeholder="Ex: Queremos que cada mulher encontre peças que expressem sua essência..."
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#5f6863]">
                        Texto do Botão
                      </label>
                      <input
                        type="text"
                        value={activeSlide.button_text || ""}
                        onChange={(e) => updateSlide(activeSlideIndex, { button_text: e.target.value })}
                        className="w-full rounded-xl border border-[#e6e7e4] bg-[#fafbf9] px-3.5 py-2 text-xs text-[#202522] focus:border-[#1f6b4f] focus:outline-none"
                        placeholder="Ex: Conhecer Peças"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#5f6863]">
                        Link do Botão
                      </label>
                      <input
                        type="text"
                        value={activeSlide.button_url || ""}
                        onChange={(e) => updateSlide(activeSlideIndex, { button_url: e.target.value })}
                        className="w-full rounded-xl border border-[#e6e7e4] bg-[#fafbf9] px-3.5 py-2 text-xs text-[#202522] focus:border-[#1f6b4f] focus:outline-none"
                        placeholder="Ex: /novidades ou /vestidos"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Aba de Prévia do Carrossel */
        <div className="rounded-2xl border border-[#e6e7e4] bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-base font-bold text-[#202522]">
                Visualização do Carrossel ao Vivo
              </h3>
              <p className="text-xs text-[#777d78]">
                Rotação a cada {intervalSeconds} segundos. Você também pode clicar nas setas ou bolinhas para navegar.
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#e6e7e4]">
            <HeroCarousel content={currentContent} />
          </div>
        </div>
      )}
    </div>
  );
}
