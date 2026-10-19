/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { CardsGridContent } from "@/types/cms";

interface CardsGridSectionProps {
  stableKey: string;
  content: CardsGridContent;
}

export default function CardsGridSection({ stableKey, content }: CardsGridSectionProps) {
  // Extrai âncora a partir da stableKey (ex: "home-vestidos" -> "vestidos")
  const anchorId = stableKey.replace("home-", "");

  const visibleCards = (content.cards || []).filter((card) => card.is_visible !== false);

  if (visibleCards.length === 0) {
    return null;
  }

  return (
    <section
      id={anchorId}
      aria-label={content.section_headline}
      className="scroll-mt-24 border-b border-[#e6e7e4] bg-white py-16 md:py-24"
    >
      <div className="mx-auto max-w-[1240px] px-5 md:px-6">
        {/* Cabeçalho da Seção */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-12">
          <div className="max-w-2xl">
            {content.section_badge && (
              <span className="mb-2.5 inline-block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1f6b4f]">
                {content.section_badge}
              </span>
            )}
            <h2 className="font-serif text-2xl font-bold tracking-tight text-[#202522] sm:text-3xl md:text-4xl">
              {content.section_headline}
            </h2>
            {content.section_subheadline && (
              <p className="mt-2.5 text-xs leading-relaxed text-[#5f6863] sm:text-sm">
                {content.section_subheadline}
              </p>
            )}
          </div>

          {content.view_all_text && (
            <Link
              href={content.view_all_url || `/#${anchorId}`}
              className="group inline-flex items-center gap-1.5 whitespace-nowrap text-xs font-semibold uppercase tracking-[0.08em] text-[#1f6b4f] transition hover:text-[#18563f]"
            >
              <span>{content.view_all_text}</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          )}
        </div>

        {/* Grade com os 3 Cards de Imagens e Conteúdo */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {visibleCards.map((card, index) => (
            <article
              key={card.id || `card-${index}`}
              className="group flex flex-col overflow-hidden rounded-2xl border border-[#e6e7e4] bg-[#fafbf9] shadow-sm transition-all duration-300 hover:border-[#d2e5db] hover:bg-white hover:shadow-md"
            >
              {/* Contêiner da Imagem com Efeito de Zoom Suave */}
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#f0f2f0]">
                <img
                  src={card.image_url}
                  alt={card.alt_text || card.title}
                  className="size-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                  loading="lazy"
                />

                {/* Badge Opcional sobre a imagem */}
                {card.badge && (
                  <span className="absolute top-3 left-3 rounded-md bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#1f6b4f] shadow-sm backdrop-blur-xs">
                    {card.badge}
                  </span>
                )}
              </div>

              {/* Informações da Peça */}
              <div className="flex flex-1 flex-col justify-between p-5">
                <div>
                  <h3 className="font-serif text-base font-bold text-[#202522] transition group-hover:text-[#1f6b4f]">
                    {card.title}
                  </h3>
                  {card.description && (
                    <p className="mt-1.5 text-xs leading-relaxed text-[#5f6863]">
                      {card.description}
                    </p>
                  )}
                </div>

                {/* Botão de Ação */}
                {card.button_text && (
                  <div className="mt-5 pt-4 border-t border-[#f0f2f0]">
                    <Link
                      href={card.button_url || `/#${anchorId}`}
                      className="inline-flex w-full items-center justify-center rounded-xl bg-[#eaf3ee] py-2.5 text-xs font-semibold text-[#1f6b4f] transition-all hover:bg-[#1f6b4f] hover:text-white"
                    >
                      {card.button_text}
                    </Link>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
