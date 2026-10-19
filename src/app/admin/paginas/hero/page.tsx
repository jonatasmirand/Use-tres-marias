import type { Metadata } from "next";
import { getSectionById, FALLBACK_HERO_SECTION } from "@/services/cms-service";
import HeroEditor from "@/components/admin/editors/HeroEditor";
import { HeroContent, CmsSection } from "@/types/cms";

export const instant = false;

export const metadata: Metadata = {
  title: "Editor Hero | Use Três Marias CMS",
  description: "Configuração do banner principal de destaque da página inicial.",
};

export default async function AdminHeroPage() {
  const section = await getSectionById("home-hero");
  const heroSection = (section || FALLBACK_HERO_SECTION) as CmsSection<HeroContent>;

  return <HeroEditor initialSection={heroSection} />;
}
