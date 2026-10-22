import { connection } from "next/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SectionRenderer from "@/components/sections/SectionRenderer";
import NewsletterSection from "@/components/sections/NewsletterSection";
import { getPublicPageSections } from "@/services/cms-service";
import { getProducts } from "@/services/product-service";

export const instant = false;

export default async function Home() {
  await connection();
  const [sections, novidadesProducts, conjuntosProducts] = await Promise.all([
    getPublicPageSections("home"),
    getProducts({ isNew: true, limit: 8 }),
    getProducts({ categorySlug: "conjuntos", limit: 8 }),
  ]);

  return (
    <>
      <Header />
      <main aria-label="Conteúdo principal da loja" className="flex-1">
        <SectionRenderer
          sections={sections}
          novidadesProducts={novidadesProducts}
          conjuntosProducts={conjuntosProducts}
        />
        <NewsletterSection />
      </main>
      <Footer />
    </>
  );
}
