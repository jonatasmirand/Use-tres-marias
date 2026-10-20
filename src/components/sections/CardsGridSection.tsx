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
      className="scroll-mt-24 border-b border-[#e6e7e4] bg-white py-[75px] px-6"
    >
      <div className="mx-auto max-w-[1240px]">
        {/* Cabeçalho da Seção Conforme Modelo CSS */}
        <div className="mx-auto mb-[35px] flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-[500px]">
            {content.section_badge && (
              <span className="mb-2 inline-block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1f6b4f]">
                {content.section_badge}
              </span>
            )}
            <h2 className="font-serif text-[31px] md:text-[38px] font-normal tracking-normal text-[#202522]">
              {content.section_headline}
            </h2>
            {content.section_subheadline && (
              <p className="mt-2 text-[13px] leading-[1.6] text-[#777d78] max-w-[400px]">
                {content.section_subheadline}
              </p>
            )}
          </div>

          {content.view_all_text && (
            <Link
              href={content.view_all_url || `/#${anchorId}`}
              className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#1f6b4f] hover:text-[#164d3a] whitespace-nowrap transition"
            >
              {content.view_all_text} →
            </Link>
          )}
        </div>

        {/* Grade com os 3 Cards de 350x350 px Conforme o Modelo */}
        <div className="grid gap-[18px] sm:grid-cols-2 lg:grid-cols-3 justify-items-center">
          {visibleCards.map((card, index) => (
            <article
              key={card.id || `card-${index}`}
              style={{ width: "100%", maxWidth: "350px", height: "350px" }}
              className="group relative overflow-hidden bg-[#18221e] text-white transition-all duration-300 w-full max-w-[350px] h-[350px]"
            >
              {/* Imagem de Fundo com Zoom Suave ao Passar o Mouse */}
              <img
                src={card.image_url}
                alt={card.alt_text || card.title}
                width={350}
                height={350}
                className="size-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                loading="lazy"
              />

              {/* Gradiente do Modelo (.category:after) */}
              <div
                className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent transition-opacity"
                aria-hidden="true"
              />

              {/* Badge Superior */}
              {card.badge && (
                <span className="absolute top-[18px] left-[18px] z-10 bg-white/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#1f6b4f]">
                  {card.badge}
                </span>
              )}

              {/* Conteúdo do Card (.category-content) */}
              <div className="absolute bottom-[24px] left-[24px] right-[24px] z-10 text-white">
                <h3 className="font-serif text-[24px] md:text-[26px] font-normal leading-tight text-white mb-2">
                  {card.title}
                </h3>

                {card.description && (
                  <p className="text-[12px] leading-relaxed text-[#f2f4f1]/85 line-clamp-2 mb-3">
                    {card.description}
                  </p>
                )}

                <Link
                  href={card.button_url || `/#${anchorId}`}
                  className="inline-flex items-center gap-1.5 text-[12px] uppercase tracking-[0.08em] font-semibold text-white hover:underline"
                >
                  <span>{card.button_text || "Descobrir coleção"}</span>
                  <span className="transition-transform group-hover:translate-x-1">→</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
