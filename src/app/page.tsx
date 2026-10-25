
import { Suspense } from "react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SectionRenderer from "@/components/sections/SectionRenderer";
import NewsletterSection from "@/components/sections/NewsletterSection";

import { getPublicPageSections } from "@/services/cms-service";
import { getProducts } from "@/services/product-service";

async function HomeContent() {
  const [sections, novidadesProducts, conjuntosProducts] =
    await Promise.all([
      getPublicPageSections("home"),
      getProducts({ isNew: true, limit: 8 }),
      getProducts({ categorySlug: "conjuntos", limit: 8 }),
    ]);

  return (
    <>
      <SectionRenderer
        sections={sections}
        novidadesProducts={novidadesProducts}
        conjuntosProducts={conjuntosProducts}
      />
      <NewsletterSection />
    </>
  );
}

function HomeContentFallback() {
  return (
    <div
      className="flex min-h-[40vh] items-center justify-center"
      role="status"
      aria-live="polite"
    >
      <p className="text-sm text-gray-500">
        Carregando a loja...
      </p>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <Header />

      <main
        aria-label="Conteúdo principal da loja"
        className="flex-1"
      >
        <Suspense fallback={<HomeContentFallback />}>
          <HomeContent />
        </Suspense>
      </main>

      <Footer />
    </>
  );
}
