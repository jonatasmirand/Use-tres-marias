import { CmsSection } from "@/types/cms";
import { Product } from "@/types/catalog";
import HeroCarousel from "./HeroCarousel";
import ShowcaseSection from "./ShowcaseSection";
import { normalizeHeroContent, normalizeShowcaseContent } from "@/validations/cms-schemas";

interface SectionRendererProps {
  sections: CmsSection[];
  novidadesProducts?: Product[];
  conjuntosProducts?: Product[];
}

export default function SectionRenderer({
  sections,
  novidadesProducts = [],
  conjuntosProducts = [],
}: SectionRendererProps) {
  // Filtra apenas seções ativas, publicadas e com conteúdo disponível
  const activeSections = sections
    .filter((s) => s.is_active && s.status === "published" && s.published_content)
    .sort((a, b) => a.position - b.position);

  if (activeSections.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col">
      {activeSections.map((section) => {
        switch (section.section_type) {
          case "hero": {
            const heroContent = normalizeHeroContent(section.published_content);
            return <HeroCarousel key={section.id} content={heroContent} />;
          }

          case "novidades": {
            const content = normalizeShowcaseContent(section.published_content, "/novidades");
            return (
              <ShowcaseSection
                key={section.id}
                stableKey={section.stable_key}
                content={content}
                products={novidadesProducts}
              />
            );
          }

          case "conjuntos": {
            const content = normalizeShowcaseContent(section.published_content, "/conjuntos");
            return (
              <ShowcaseSection
                key={section.id}
                stableKey={section.stable_key}
                content={content}
                products={conjuntosProducts}
              />
            );
          }

          default:
            return null;
        }
      })}
    </div>
  );
}
