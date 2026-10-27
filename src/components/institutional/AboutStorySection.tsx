"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

/* -------------------------------------------------------------------------- */
/*  Ícone do Emblema Floral Três Marias (3 pétalas estilizadas)               */
/* -------------------------------------------------------------------------- */
export function FlowerEmblem({
  className = "w-8 h-8",
  strokeWidth = 1.75,
}: {
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Pétala Central */}
      <path d="M24 9 C20 18, 20 29, 24 39 C28 29, 28 18, 24 9 Z" />
      {/* Pétala Esquerda */}
      <path d="M24 39 C14 39, 8 28, 12 18 C15 12, 21 17, 24 24" />
      {/* Pétala Direita */}
      <path d="M24 39 C34 39, 40 28, 36 18 C33 12, 27 17, 24 24" />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*  Divisor com o emblema central                                             */
/* -------------------------------------------------------------------------- */
function FloralDivider({ light = false }: { light?: boolean }) {
  return (
    <div className="flex items-center justify-center gap-3 w-full my-6">
      <span
        className={`h-[1px] flex-1 max-w-[90px] ${
          light ? "bg-[#c5a880]/60" : "bg-[#c5a880]"
        }`}
      />
      <FlowerEmblem
        className={`w-4 h-4 ${light ? "text-[#c5a880]" : "text-[#b38e68]"}`}
        strokeWidth={1.5}
      />
      <span
        className={`h-[1px] flex-1 max-w-[90px] ${
          light ? "bg-[#c5a880]/60" : "bg-[#c5a880]"
        }`}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Dados dos 4 Cards / Slides (fiéis às imagens da marca)                    */
/* -------------------------------------------------------------------------- */
export type StorySlide = {
  id: string;
  category: string;
  title: string;
  theme: "dark" | "light";
};

export const STORY_SLIDES: StorySlide[] = [
  { id: "quem-somos", category: "Manifesto", title: "Quem Somos", theme: "dark" },
  { id: "nossa-historia", category: "Origem & Fé", title: "O Encontro", theme: "light" },
  { id: "nosso-proposito", category: "Propósito", title: "Nosso Propósito", theme: "dark" },
  { id: "nosso-estilo", category: "Estilo & Vida", title: "Nosso Estilo", theme: "light" },
];

interface AboutStorySectionProps {
  /** Se deve exibir o cabeçalho introdutório da seção */
  showHeader?: boolean;
  /** Modo inicial de exibição: "carousel" (estilo stories) ou "grid" (editorial) */
  defaultMode?: "carousel" | "grid";
}

export default function AboutStorySection({
  showHeader = true,
  defaultMode = "carousel",
}: AboutStorySectionProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [viewMode, setViewMode] = useState<"carousel" | "grid">(defaultMode);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const totalSlides = STORY_SLIDES.length;

  const nextSlide = useCallback(() => {
    setActiveSlide((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setActiveSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  // Teclado acessível (seta esquerda / seta direita)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (viewMode !== "carousel") return;
      if (e.key === "ArrowRight") nextSlide();
      if (e.key === "ArrowLeft") prevSlide();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide, viewMode]);

  // Autoplay opcional
  useEffect(() => {
    if (!isAutoPlay || viewMode !== "carousel") return;
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [isAutoPlay, nextSlide, viewMode]);

  // Touch / Swipe para mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (diff > 45) {
      nextSlide();
    } else if (diff < -45) {
      prevSlide();
    }
    touchStartX.current = null;
  };

  return (
    <section
      id="sobre-nos"
      aria-label="Sobre a Três Marias"
      className="w-full bg-[#fcfbf9] py-16 sm:py-24 border-t border-[#e8e9e6]"
    >
      <div className="mx-auto max-w-[1240px] px-6">
        {/* Cabeçalho da Seção */}
        {showHeader && (
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
            <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#1f6b4f] bg-[#eaf3ee] px-3.5 py-1.5 rounded-full">
              <FlowerEmblem className="w-3.5 h-3.5" strokeWidth={2} />
              Nossa Identidade & Essência
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#192620] tracking-tight">
              Conheça a Três Marias
            </h2>
            <p className="text-[14px] sm:text-[15px] leading-relaxed text-[#5f6863]">
              Mais do que vender roupas, celebramos a união de três amigas, o amor pela moda
              e o desejo de vestir mulheres reais com confiança, fé e sofisticação.
            </p>

            {/* Alternador de visualização (Carrossel / Grade) */}
            <div className="pt-2 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setViewMode("carousel")}
                className={`text-[12px] font-medium px-4 py-1.5 rounded-full transition ${
                  viewMode === "carousel"
                    ? "bg-[#183428] text-white shadow-sm"
                    : "bg-white text-[#5f6863] border border-[#e6e7e4] hover:text-[#183428]"
                }`}
                aria-pressed={viewMode === "carousel"}
              >
                Visualizar em Stories / Slides
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`text-[12px] font-medium px-4 py-1.5 rounded-full transition ${
                  viewMode === "grid"
                    ? "bg-[#183428] text-white shadow-sm"
                    : "bg-white text-[#5f6863] border border-[#e6e7e4] hover:text-[#183428]"
                }`}
                aria-pressed={viewMode === "grid"}
              >
                Ver História Completa (Grade)
              </button>
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* MODO CARROSSEL / STORIES                                           */}
        {/* ================================================================== */}
        {viewMode === "carousel" && (
          <div className="relative mx-auto max-w-[480px] sm:max-w-[520px]">
            {/* Controles de Slide Laterais (Desktop / Tablet) */}
            <button
              type="button"
              onClick={prevSlide}
              aria-label="Slide anterior"
              className="hidden sm:flex absolute -left-14 top-1/2 -translate-y-1/2 w-11 h-11 items-center justify-center rounded-full bg-white border border-[#e6e7e4] text-[#202522] shadow-sm hover:bg-[#183428] hover:text-white transition z-10"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={nextSlide}
              aria-label="Próximo slide"
              className="hidden sm:flex absolute -right-14 top-1/2 -translate-y-1/2 w-11 h-11 items-center justify-center rounded-full bg-white border border-[#e6e7e4] text-[#202522] shadow-sm hover:bg-[#183428] hover:text-white transition z-10"
            >
              ›
            </button>

            {/* Container do Card Ativo */}
            <div
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              className="relative overflow-hidden rounded-[28px] shadow-2xl transition-all duration-300 min-h-[580px] sm:min-h-[620px] flex flex-col justify-between border border-[#e8dfd3]"
            >
              {/* Botão de navegação rápida em mobile nas laterais */}
              <button
                type="button"
                onClick={prevSlide}
                aria-label="Voltar slide"
                className="sm:hidden absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-sm z-20 text-lg"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={nextSlide}
                aria-label="Avançar slide"
                className="sm:hidden absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-sm z-20 text-lg"
              >
                ›
              </button>

              {/* SLIDE 0: QUEM SOMOS */}
              {activeSlide === 0 && (
                <div className="flex-1 bg-[#132c21] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
                  {/* Padrão orgânico de fundo sutil */}
                  <div
                    className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full border border-white/5 pointer-events-none"
                    aria-hidden="true"
                  />
                  <div
                    className="absolute -left-20 -top-20 w-72 h-72 rounded-full border border-white/5 pointer-events-none"
                    aria-hidden="true"
                  />

                  {/* Topo: Emblema e Marca */}
                  <div className="flex items-center gap-3">
                    <FlowerEmblem className="w-8 h-8 text-[#d4b996]" strokeWidth={1.8} />
                    <span className="font-serif text-xl tracking-wide text-[#f5efe6]">
                      Três Marías
                    </span>
                  </div>

                  {/* Centro: Título e Mensagem */}
                  <div className="my-auto py-8 text-center relative z-10">
                    <h3 className="font-serif text-4xl sm:text-5xl font-light italic tracking-tight text-[#f5efe6] mb-2 leading-tight">
                      QUEM
                      <span className="block not-italic font-normal tracking-wide text-[#d4b996] text-3xl sm:text-4xl mt-1">
                        SOMOS
                      </span>
                    </h3>

                    <FloralDivider light />

                    <p className="text-[17px] sm:text-[19px] italic font-light text-[#ede6dc] leading-relaxed max-w-sm mx-auto">
                      &ldquo;Toda marca tem uma história. A nossa começou com uma amizade,
                      um propósito e o amor por se vestir bem.&rdquo;
                    </p>

                    <p className="mt-6 text-[13px] font-medium tracking-[0.18em] uppercase text-[#d4b996]">
                      Venha conhecer a Três Marias
                    </p>
                  </div>

                  {/* Rodapé do Slide */}
                  <div className="flex items-center justify-between text-xs text-[#a3b8ad] border-t border-white/10 pt-4">
                    <span>01 / 04</span>
                    <span className="tracking-widest uppercase text-[10px]">Origem & História</span>
                  </div>
                </div>
              )}

              {/* SLIDE 1: A HISTÓRIA & VALORES */}
              {activeSlide === 1 && (
                <div className="flex-1 bg-[#faf7f2] text-[#202522] p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
                  {/* Decoração de arcos orgânicos */}
                  <div
                    className="absolute -right-16 -top-16 w-64 h-64 rounded-full border-2 border-[#e6dbc9]/60 pointer-events-none"
                    aria-hidden="true"
                  />

                  {/* Topo: Emblema e Linha */}
                  <div>
                    <FlowerEmblem className="w-9 h-9 text-[#183428]" strokeWidth={1.8} />
                    <div className="h-[2px] w-24 bg-[#c5a880] mt-3" />
                  </div>

                  {/* Centro: Narrativa e Tópicos */}
                  <div className="my-auto py-6">
                    <p className="text-[18px] sm:text-[20px] italic text-[#22362b] leading-relaxed font-serif">
                      A Três Marias nasceu do encontro de três amigas que compartilham muito mais
                      do que uma amizade.
                    </p>

                    <FloralDivider />

                    <ul className="space-y-4 max-w-sm mx-auto text-left">
                      <li className="flex items-center gap-3 text-[16px] sm:text-[17px] text-[#2c3d33] italic">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#183428] shrink-0" />
                        <span>Compartilhamos a fé</span>
                      </li>
                      <li className="flex items-center gap-3 text-[16px] sm:text-[17px] text-[#2c3d33] italic">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#183428] shrink-0" />
                        <span>O amor pela moda</span>
                      </li>
                      <li className="flex items-center gap-3 text-[16px] sm:text-[17px] text-[#2c3d33] italic">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#183428] shrink-0" />
                        <span>A certeza de que uma roupa vai além da aparência</span>
                      </li>
                    </ul>
                  </div>

                  {/* Rodapé: Assinatura */}
                  <div className="flex items-center justify-between border-t border-[#e8dfd3] pt-4">
                    <div className="flex items-center gap-2">
                      <FlowerEmblem className="w-5 h-5 text-[#183428]" strokeWidth={1.6} />
                      <span className="font-serif text-sm text-[#183428]">Três Marías</span>
                    </div>
                    <span className="text-xs text-[#8c948e]">02 / 04</span>
                  </div>
                </div>
              )}

              {/* SLIDE 2: NOSSO PROPÓSITO */}
              {activeSlide === 2 && (
                <div className="flex-1 bg-[#132c21] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
                  {/* Curvas ornamentais de fundo */}
                  <div
                    className="absolute -left-20 bottom-0 w-80 h-80 rounded-full border border-white/5 pointer-events-none"
                    aria-hidden="true"
                  />

                  {/* Topo: Título do Slide */}
                  <div>
                    <h3 className="font-serif text-3xl sm:text-4xl text-[#f5efe6] font-normal leading-tight">
                      Nosso
                      <span className="block italic text-[#d4b996] text-4xl sm:text-5xl font-light">
                        Propósito
                      </span>
                    </h3>
                    <div className="flex items-center gap-3 mt-4">
                      <FlowerEmblem className="w-6 h-6 text-[#f5efe6]" strokeWidth={1.8} />
                      <div className="h-[1px] w-28 bg-[#c5a880]" />
                    </div>
                  </div>

                  {/* Centro: Mensagem Principal */}
                  <div className="my-auto py-6 space-y-5">
                    <p className="text-[17px] sm:text-[19px] italic font-light text-[#ede6dc] leading-relaxed">
                      &ldquo;Mais do que vender roupas...&rdquo;
                    </p>
                    <p className="text-[18px] sm:text-[20px] italic text-[#f7f2ea] leading-relaxed font-serif">
                      Queremos que cada mulher encontre peças que expressem sua essência, sua
                      delicadeza e sua confiança.
                    </p>
                    <p className="text-[16px] sm:text-[17px] font-medium text-[#d4b996] italic">
                      Seja bem-vinda à Três Marias
                    </p>
                  </div>

                  {/* Rodapé: Logo e Indicador */}
                  <div className="flex items-center justify-between border-t border-white/10 pt-4">
                    <span className="font-serif text-lg text-[#f5efe6]">Três Marías</span>
                    <span className="text-xs text-[#a3b8ad]">03 / 04</span>
                  </div>
                </div>
              )}

              {/* SLIDE 3: NOSSO ESTILO */}
              {activeSlide === 3 && (
                <div className="flex-1 bg-[#faf7f2] text-[#202522] p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden">
                  {/* Topo: Barra da Paleta de Cores da Marca */}
                  <div>
                    <div className="flex h-2 w-full rounded-full overflow-hidden mb-4 shadow-xs">
                      <div className="flex-1 bg-[#132c21]" title="Verde Floresta" />
                      <div className="flex-1 bg-[#b89068]" title="Terracota Dourado" />
                      <div className="flex-1 bg-[#f0ebd9]" title="Creme Suave" />
                      <div className="flex-1 bg-[#1f4a38]" title="Verde Profundo" />
                    </div>

                    <div className="text-center pt-2">
                      <FlowerEmblem
                        className="w-7 h-7 text-[#183428] mx-auto mb-1"
                        strokeWidth={1.8}
                      />
                      <div className="h-[1px] w-20 bg-[#c5a880] mx-auto mb-3" />
                      <h3 className="font-serif text-3xl sm:text-4xl text-[#183428] font-normal leading-tight">
                        Nosso Estilo
                      </h3>
                      <p className="text-[14px] sm:text-[15px] italic text-[#4a544e] mt-1 max-w-sm mx-auto">
                        Acreditamos que você não precisa escolher entre estar elegante ou
                        confortável.
                      </p>
                    </div>
                  </div>

                  {/* Ocasiões */}
                  <div className="my-3 py-2 px-3 bg-white/70 backdrop-blur-xs rounded-xl border border-[#ede5d8] text-center text-[12px] sm:text-[13px] text-[#424e46] italic space-y-1">
                    <p>• Um evento especial &nbsp;• Um culto</p>
                    <p>• Um almoço em família &nbsp;• Um café com as amigas</p>
                    <p className="font-medium text-[#183428]">
                      • Um dia comum que merece ser vivido com beleza.
                    </p>
                  </div>

                  {/* Foto das 3 amigas */}
                  <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full rounded-xl overflow-hidden shadow-md border border-[#e8dfd3]">
                    <Image
                      src="/images/sobre-nos-estilo.jpg"
                      alt="Três amigas e fundadoras elegantes com roupas clássicas e atemporais da marca Três Marias"
                      fill
                      sizes="(max-width: 640px) 100vw, 480px"
                      className="object-cover object-top"
                    />
                  </div>

                  {/* Rodapé */}
                  <div className="flex items-center justify-between border-t border-[#e8dfd3] pt-3 mt-3 text-xs text-[#8c948e]">
                    <span className="font-serif text-xs text-[#183428]">Três Marías</span>
                    <span>04 / 04</span>
                  </div>
                </div>
              )}
            </div>

            {/* Barra de Indicadores (Dots) + Controles inferiores */}
            <div className="flex items-center justify-between mt-5 px-2">
              <button
                type="button"
                onClick={() => setIsAutoPlay(!isAutoPlay)}
                className="text-[11px] font-semibold text-[#5f6863] hover:text-[#183428] uppercase tracking-wider transition"
              >
                {isAutoPlay ? "⏸ Pausar" : "▶ Reproduzir"}
              </button>

              {/* Dots clicáveis */}
              <div
                className="flex items-center gap-2"
                role="tablist"
                aria-label="Selecionar slide da história"
              >
                {STORY_SLIDES.map((slide, index) => (
                  <button
                    key={slide.id}
                    type="button"
                    role="tab"
                    aria-selected={activeSlide === index}
                    aria-label={`Ir para slide ${index + 1}: ${slide.title}`}
                    onClick={() => setActiveSlide(index)}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      activeSlide === index
                        ? "w-8 bg-[#183428]"
                        : "w-2.5 bg-[#d4ded8] hover:bg-[#a6b8ae]"
                    }`}
                  />
                ))}
              </div>

              <span className="text-[12px] text-[#5f6863] font-mono">
                {activeSlide + 1} / {totalSlides}
              </span>
            </div>
          </div>
        )}

        {/* ================================================================== */}
        {/* MODO GRADE EDITORIAL (HISTÓRIA COMPLETA)                            */}
        {/* ================================================================== */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            {/* Card 1: Quem Somos */}
            <div className="bg-[#132c21] text-white p-8 sm:p-10 rounded-[24px] shadow-lg flex flex-col justify-between min-h-[460px] border border-white/5 relative overflow-hidden">
              <div className="flex items-center gap-3">
                <FlowerEmblem className="w-8 h-8 text-[#d4b996]" strokeWidth={1.8} />
                <span className="font-serif text-xl tracking-wide text-[#f5efe6]">Três Marías</span>
              </div>
              <div className="my-auto py-8 text-center">
                <h3 className="font-serif text-4xl font-light italic text-[#f5efe6]">
                  QUEM
                  <span className="block not-italic font-normal text-[#d4b996] text-3xl mt-1">
                    SOMOS
                  </span>
                </h3>
                <FloralDivider light />
                <p className="text-[17px] italic font-light text-[#ede6dc] leading-relaxed max-w-sm mx-auto">
                  &ldquo;Toda marca tem uma história. A nossa começou com uma amizade, um propósito
                  e o amor por se vestir bem.&rdquo;
                </p>
                <p className="mt-6 text-[12px] font-medium tracking-[0.18em] uppercase text-[#d4b996]">
                  Venha conhecer a Três Marias
                </p>
              </div>
              <div className="border-t border-white/10 pt-3 text-xs text-[#a3b8ad]">
                Manifesto de Origem
              </div>
            </div>

            {/* Card 2: A Nossa História & Valores */}
            <div className="bg-[#faf7f2] text-[#202522] p-8 sm:p-10 rounded-[24px] shadow-lg flex flex-col justify-between min-h-[460px] border border-[#e8dfd3]">
              <div>
                <FlowerEmblem className="w-8 h-8 text-[#183428]" strokeWidth={1.8} />
                <div className="h-[2px] w-20 bg-[#c5a880] mt-3" />
              </div>
              <div className="my-auto py-6">
                <p className="text-[18px] sm:text-[19px] italic text-[#22362b] leading-relaxed font-serif">
                  A Três Marias nasceu do encontro de três amigas que compartilham muito mais do que
                  uma amizade.
                </p>
                <FloralDivider />
                <ul className="space-y-3 text-left">
                  <li className="flex items-center gap-3 text-[16px] text-[#2c3d33] italic">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#183428] shrink-0" />
                    <span>Compartilhamos a fé</span>
                  </li>
                  <li className="flex items-center gap-3 text-[16px] text-[#2c3d33] italic">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#183428] shrink-0" />
                    <span>O amor pela moda</span>
                  </li>
                  <li className="flex items-center gap-3 text-[16px] text-[#2c3d33] italic">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#183428] shrink-0" />
                    <span>A certeza de que uma roupa vai além da aparência</span>
                  </li>
                </ul>
              </div>
              <div className="flex items-center gap-2 border-t border-[#e8dfd3] pt-3">
                <FlowerEmblem className="w-4 h-4 text-[#183428]" strokeWidth={1.5} />
                <span className="font-serif text-xs text-[#183428]">Três Marías</span>
              </div>
            </div>

            {/* Card 3: Nosso Propósito */}
            <div className="bg-[#132c21] text-white p-8 sm:p-10 rounded-[24px] shadow-lg flex flex-col justify-between min-h-[460px] border border-white/5">
              <div>
                <h3 className="font-serif text-3xl text-[#f5efe6] font-normal leading-tight">
                  Nosso
                  <span className="block italic text-[#d4b996] text-4xl font-light">
                    Propósito
                  </span>
                </h3>
                <div className="flex items-center gap-3 mt-3">
                  <FlowerEmblem className="w-5 h-5 text-[#f5efe6]" strokeWidth={1.8} />
                  <div className="h-[1px] w-24 bg-[#c5a880]" />
                </div>
              </div>
              <div className="my-auto py-6 space-y-4">
                <p className="text-[17px] italic font-light text-[#ede6dc]">
                  &ldquo;Mais do que vender roupas...&rdquo;
                </p>
                <p className="text-[18px] italic text-[#f7f2ea] leading-relaxed font-serif">
                  Queremos que cada mulher encontre peças que expressem sua essência, sua delicadeza
                  e sua confiança.
                </p>
                <p className="text-[15px] font-medium text-[#d4b996] italic">
                  Seja bem-vinda à Três Marias
                </p>
              </div>
              <div className="border-t border-white/10 pt-3 text-xs text-[#a3b8ad]">
                Propósito de Marca
              </div>
            </div>

            {/* Card 4: Nosso Estilo */}
            <div className="bg-[#faf7f2] text-[#202522] p-8 rounded-[24px] shadow-lg flex flex-col justify-between min-h-[460px] border border-[#e8dfd3]">
              <div>
                <div className="flex h-2 w-full rounded-full overflow-hidden mb-3">
                  <div className="flex-1 bg-[#132c21]" />
                  <div className="flex-1 bg-[#b89068]" />
                  <div className="flex-1 bg-[#f0ebd9]" />
                  <div className="flex-1 bg-[#1f4a38]" />
                </div>
                <div className="text-center">
                  <h3 className="font-serif text-3xl text-[#183428] font-normal">Nosso Estilo</h3>
                  <p className="text-[14px] italic text-[#4a544e] mt-1">
                    Acreditamos que você não precisa escolher entre estar elegante ou confortável.
                  </p>
                </div>
              </div>

              <div className="my-4 py-2 px-3 bg-white/70 rounded-xl border border-[#ede5d8] text-center text-[12px] text-[#424e46] italic space-y-1">
                <p>• Um evento especial • Um culto</p>
                <p>• Um almoço em família • Um café com as amigas</p>
                <p className="font-medium text-[#183428]">
                  • Um dia comum que merece ser vivido com beleza.
                </p>
              </div>

              <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden shadow-sm border border-[#e8dfd3]">
                <Image
                  src="/images/sobre-nos-estilo.jpg"
                  alt="Três amigas e fundadoras elegantes com roupas clássicas e atemporais da marca Três Marias"
                  fill
                  sizes="(max-width: 768px) 100vw, 500px"
                  className="object-cover object-top"
                />
              </div>
            </div>
          </div>
        )}

        {/* CTA para o Catálogo */}
        <div className="mt-14 text-center">
          <Link
            href="/novidades"
            className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#183428] text-white text-[13px] font-semibold tracking-[0.1em] uppercase rounded-full hover:bg-[#10241b] transition shadow-md hover:shadow-lg"
          >
            <span>Conhecer Nossas Peças</span>
            <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
