import { CmsSection, HeroContent, CardsGridContent } from "@/types/cms";
import HeroSection from "./HeroSection";
import BenefitsBar from "./BenefitsBar";
import CardsGridSection from "./CardsGridSection";

interface SectionRendererProps {
  sections: CmsSection[];
}

export default function SectionRenderer({ sections }: SectionRendererProps) {
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
          case "hero":
            return (
              <div key={section.id}>
                <HeroSection
                  content={section.published_content as HeroContent}
                />
              </div>
            );
          case "novidades":
          case "vestidos":
          case "blusas":
          case "bermudas":
          case "conjuntos":
          case "cards_grid":
            return (
              <CardsGridSection
                key={section.id}
                stableKey={section.stable_key}
                content={section.published_content as CardsGridContent}
              />
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
