
import { connection } from "next/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SectionRenderer from "@/components/sections/SectionRenderer";
import NewsletterSection from "@/components/sections/NewsletterSection";
import { getPublicPageSections } from "@/services/cms-service";

export const instant = false;

export default async function Home() {
  await connection();
  const sections = await getPublicPageSections("home");

  return (
    <>
      <Header />
      <main aria-label="Conteúdo principal da loja" className="flex-1">
        <SectionRenderer sections={sections} />
        <NewsletterSection />
      </main>
      <Footer />
    </>
  );
}
