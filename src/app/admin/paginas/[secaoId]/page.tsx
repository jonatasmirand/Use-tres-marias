import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSectionById } from "@/services/cms-service";
import HeroEditor from "@/components/admin/editors/HeroEditor";
import CardsGridEditor from "@/components/admin/editors/CardsGridEditor";
import { HeroContent, CardsGridContent, CmsSection } from "@/types/cms";

export const instant = false;

type RouteContext = {
  params: Promise<{ secaoId: string }>;
};

export async function generateMetadata({ params }: RouteContext): Promise<Metadata> {
  const { secaoId } = await params;
  const section = await getSectionById(secaoId);

  return {
    title: section ? `Editar: ${section.internal_title} | Use Três Marias CMS` : "Editar Seção | Use Três Marias CMS",
  };
}

export default async function AdminSectionEditPage({ params }: RouteContext) {
  const { secaoId } = await params;
  const section = await getSectionById(secaoId);

  if (!section) {
    notFound();
  }

  if (section.section_type === "hero") {
    return <HeroEditor initialSection={section as CmsSection<HeroContent>} />;
  }

  return <CardsGridEditor initialSection={section as CmsSection<CardsGridContent>} />;
}
