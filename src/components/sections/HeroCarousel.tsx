"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { HeroContent, HeroSlide } from "@/types/cms";
import { normalizeHeroContent } from "@/validations/cms-schemas";

interface HeroCarouselProps {
  content: HeroContent;
}

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1800&q=85";

function renderTitle(title: string) {
  const parts = title.split(/<br\s*\/?>|\n/gi);
  if (parts.length <= 1) return title;
  return parts.map((part, i) => (
    <span key={i}>
      {part}
      {i < parts.length - 1 && <br />}
    </span>
  ));
}

export default function HeroCarousel({ content }: HeroCarouselProps) {
  const normalized = normalizeHeroContent(content);
  const slides: HeroSlide[] = normalized.slides.length > 0 ? normalized.slides : [];
  const intervalSeconds = Math.max(3, Math.min(15, normalized.interval_seconds || 5));

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const total = slides.length;

  const nextSlide = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    if (total <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const goToSlide = (idx: number) => {
    setCurrentIndex(idx);
  };

  // Autoplay com intervalo configurável pelo admin
  useEffect(() => {
    if (total <= 1 || isPaused) return;

    const timer = setInterval(() => {
      nextSlide();
    }, intervalSeconds * 1000);

    return () => clearInterval(timer);
  }, [total, isPaused, intervalSeconds, nextSlide]);

  // Suporte a swipe no mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 50) nextSlide();
    else if (diff < -50) prevSlide();
    touchStartX.current = null;
  };

  if (total === 0) return null;

  return (
    <section
      aria-label="Destaques e coleção useTrêsMarias"
      className="relative w-full overflow-hidden bg-[#16302a] text-white min-h-[540px] sm:min-h-[560px] md:min-h-[620px] flex items-center select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {slides.map((slide, idx) => {
        const isActive = idx === currentIndex;
        const imageUrl = slide.image_url || FALLBACK_IMAGE;
        const eyebrow = slide.eyebrow || "Coleção Primavera • 2026";
        const title = slide.title || "Seu estilo.<br>Do seu jeito.";
        const description =
          slide.description ||
          "Peças femininas pensadas para acompanhar todos os momentos — com leveza, personalidade e aquele toque especial das Três Marias.";
        const buttonText = slide.button_text || "Conheça a coleção";
        const buttonUrl = slide.button_url || "/novidades";

        return (
          <div
            key={slide.id || idx}
            aria-hidden={!isActive}
            className={`absolute inset-0 flex items-center transition-opacity duration-700 ease-in-out ${
              isActive ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            {/* Foto de fundo */}
            <picture className="absolute inset-0 size-full pointer-events-none">
              {slide.mobile_image_url && (
                <source media="(max-width: 768px)" srcSet={slide.mobile_image_url} />
              )}
              <img
                src={imageUrl}
                alt={slide.alt_text || "Coleção useTrêsMarias"}
                className={`size-full ${
                  slide.image_fit === "contain"
                    ? "object-contain object-center"
                    : "object-cover object-center"
                }`}
                loading={idx === 0 ? "eager" : "lazy"}
              />
            </picture>

            {/* Degradê translúcido idêntico ao modelo (90deg, rgba(16,35,27,.72), rgba(16,35,27,.12)) */}
            <div
              className="absolute inset-0 pointer-events-none bg-gradient-to-r from-[rgba(16,35,27,0.85)] via-[rgba(16,35,27,0.55)] to-[rgba(16,35,27,0.2)] md:from-[rgba(16,35,27,0.72)] md:to-[rgba(16,35,27,0.12)]"
              aria-hidden="true"
            />

            {/* Conteúdo Institucional Alinhado à Esquerda */}
            <div className="relative z-10 mx-auto w-full max-w-[1240px] px-6 py-[70px] text-white">
              {eyebrow && (
                <div className="text-[12px] uppercase tracking-[0.18em] mb-[18px] text-[#f2f4f1] font-normal">
                  {eyebrow}
                </div>
              )}

              <h1 className="font-serif font-normal text-[42px] sm:text-[49px] md:text-[64px] leading-[1.03] max-w-[580px] mb-[20px] text-white">
                {renderTitle(title)}
              </h1>

              {description && (
                <p className="text-[16px] leading-[1.7] max-w-[470px] mb-[30px] text-[#f2f4f1]">
                  {description}
                </p>
              )}

              {buttonText && (
                <div>
                  <Link
                    href={buttonUrl}
                    className="btn btn-light"
                  >
                    {buttonText}
                  </Link>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Setas de navegação (apenas se houver mais de 1 slide) */}
      {total > 1 && (
        <>
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Slide anterior"
            className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-20 flex size-10 md:size-12 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition hover:bg-black/60 hover:scale-105 focus:outline-none"
          >
            <svg className="size-5 md:size-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            type="button"
            onClick={nextSlide}
            aria-label="Próximo slide"
            className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-20 flex size-10 md:size-12 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition hover:bg-black/60 hover:scale-105 focus:outline-none"
          >
            <svg className="size-5 md:size-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Indicadores de bolinhas na parte inferior (apenas se houver mais de 1 slide) */}
      {total > 1 && (
        <div className="absolute bottom-5 sm:bottom-7 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 rounded-full bg-black/30 px-3.5 py-1.5 backdrop-blur-sm">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => goToSlide(idx)}
              aria-label={`Ir para o slide ${idx + 1}`}
              className={`transition-all duration-300 rounded-full ${
                idx === currentIndex
                  ? "w-7 h-2 bg-white"
                  : "w-2 h-2 bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
