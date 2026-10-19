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

  const opacityDecimal = (content.overlay_opacity ?? 30) / 100;

  return (
    <section
      aria-label={content.title || "Destaque da Coleção"}
      className="relative flex min-h-[520px] items-center justify-center overflow-hidden bg-[#18221e] text-white md:min-h-[640px]"
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
          src={content.desktop_image_url}
          alt={content.alt_text || content.title}
          className="size-full object-cover object-center"
          loading="eager"
        />
      </picture>

      {/* Camada de Sobreposição de Contraste */}
      <div
        className="absolute inset-0 bg-[#18221e] transition-opacity"
        style={{ opacity: opacityDecimal }}
        aria-hidden="true"
      />

      {/* Gradiente sutil para acabamento elegante */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-[#18221e]/80 via-transparent to-transparent"
        aria-hidden="true"
      />

      {/* Conteúdo Tipográfico */}
      <div className="relative z-10 mx-auto w-full max-w-[1240px] px-5 py-16 md:px-6 md:py-24">
        <div className={`flex flex-col ${alignmentClass}`}>
          <div className={`max-w-2xl ${containerAlignClass}`}>
            <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-[0.2em] text-[#a9cbbb]">
              Use Três Marias
            </span>

            <h1 className="font-serif text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
              {content.title}
            </h1>

            {content.description && (
              <p className="mt-4 text-sm leading-relaxed text-[#dce3df] sm:text-base md:text-lg">
                {content.description}
              </p>
            )}

            {content.button_text && (
              <div className="mt-8">
                <Link
                  href={content.button_url || "/#novidades"}
                  className="inline-flex items-center justify-center rounded-xl bg-[#1f6b4f] px-7 py-3.5 text-xs font-semibold uppercase tracking-[0.1em] text-white shadow-lg transition-all hover:bg-[#18563f] hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#a9cbbb] active:scale-[0.99]"
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
