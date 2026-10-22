import Link from "next/link";
import { ShowcaseContent } from "@/types/cms";
import { Product } from "@/types/catalog";
import ProductCard from "@/components/catalog/ProductCard";

interface ShowcaseSectionProps {
  stableKey: string;
  content: ShowcaseContent;
  products: Product[];
}

export default function ShowcaseSection({ stableKey, content, products }: ShowcaseSectionProps) {
  const anchorId = stableKey.replace("home-", "");

  if (!products || products.length === 0) {
    return null;
  }

  const maxItems = content.max_items || 8;
  const visibleProducts = products.slice(0, maxItems);

  return (
    <section
      id={anchorId}
      aria-label={content.section_headline}
      className="scroll-mt-24 border-b border-[#e6e7e4] bg-white py-12 md:py-16 px-6"
    >
      <div className="mx-auto max-w-[1240px]">
        {/* Cabeçalho da Seção */}
        <div className="mb-8 md:mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-[560px]">
            {content.section_badge && (
              <span className="mb-2 inline-block text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1f6b4f]">
                {content.section_badge}
              </span>
            )}
            <h2 className="font-serif text-3xl md:text-4xl font-normal tracking-normal text-[#202522]">
              {content.section_headline}
            </h2>
            {content.section_subheadline && (
              <p className="mt-2 text-xs md:text-sm leading-relaxed text-[#777d78]">
                {content.section_subheadline}
              </p>
            )}
          </div>

          {content.view_all_text && content.view_all_url && (
            <Link
              href={content.view_all_url}
              className="text-xs font-semibold uppercase tracking-[0.08em] text-[#1f6b4f] hover:text-[#164d3a] whitespace-nowrap transition inline-flex items-center gap-1 group"
            >
              <span>{content.view_all_text}</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          )}
        </div>

        {/* Grade de Produtos */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 justify-items-center">
          {visibleProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
