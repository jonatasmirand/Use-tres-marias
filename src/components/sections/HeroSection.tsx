import Link from "next/link";
import { HeroContent } from "@/types/cms";

interface HeroSectionProps {
  content: HeroContent;
}

export default function HeroSection({ content }: HeroSectionProps) {
  const alignmentClass =
    content.content_alignment === "center"
      ? "text-center items-center"
      : content.content_alignment === "right"
      ? "text-right items-end"
      : "text-left items-start";

  const containerAlignClass =
    content.content_alignment === "center"
      ? "mx-auto"
      : content.content_alignment === "right"
      ? "ml-auto"
      : "";

  return (
    <section
      aria-label={content.title || "Destaque da Coleção"}
      className="relative flex min-h-[540px] md:min-h-[620px] items-center overflow-hidden bg-[#10231b] text-white"
    >
      {/* Imagem de Fundo Responsiva */}
      <picture className="absolute inset-0 size-full">
        {content.mobile_image_url && (
          <source
            media="(max-width: 768px)"
            srcSet={content.mobile_image_url}
          />
        )}
        <img
          src={content.desktop_image_url || "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1800&q=85"}
          alt={content.alt_text || content.title}
          className="size-full object-cover object-center"
          loading="eager"
        />
      </picture>

      {/* Gradiente Duplo do Modelo (72% a 12%) */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-[#10231b]/85 via-[#10231b]/55 to-[#10231b]/20"
        aria-hidden="true"
      />

      {/* Conteúdo Tipográfico Conforme o Modelo CSS */}
      <div className="relative z-10 mx-auto w-full max-w-[1240px] px-6 py-[70px] text-white">
        <div className={`flex flex-col ${alignmentClass}`}>
          <div className={`max-w-[580px] ${containerAlignClass}`}>
            <div className="mb-[18px] text-[12px] uppercase tracking-[0.18em] text-[#dce7df]">
              Coleção Primavera • 2026
            </div>

            <h1 className="font-serif text-[42px] leading-[1.08] font-normal tracking-normal text-white sm:text-[52px] md:text-[64px] md:leading-[1.03] mb-5">
              {content.title}
            </h1>

            {content.description && (
              <p className="text-[15px] sm:text-[16px] leading-[1.7] text-[#f2f4f1] max-w-[470px] mb-[30px]">
                {content.description}
              </p>
            )}

            {content.button_text && (
              <div>
                <Link
                  href={content.button_url || "/#novidades"}
                  className="btn btn-light"
                >
                  {content.button_text}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
