import { CardsGridContent } from "@/types/cms";
import ShowcaseSection from "./ShowcaseSection";
import { FALLBACK_PRODUCTS } from "@/services/product-service";

interface CardsGridSectionProps {
  stableKey: string;
  content: CardsGridContent;
}

export default function CardsGridSection({ stableKey, content }: CardsGridSectionProps) {
  // Para compatibilidade, seleciona os produtos relevantes
  const isNovidades = stableKey.includes("novidades");
  const filteredProducts = isNovidades
    ? FALLBACK_PRODUCTS.filter((p) => p.is_new)
    : FALLBACK_PRODUCTS.filter((p) => p.category?.slug === "conjuntos");

  return (
    <ShowcaseSection
      stableKey={stableKey}
      content={content}
      products={filteredProducts}
    />
  );
}
