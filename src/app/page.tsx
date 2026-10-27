
import { Suspense } from "react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SectionRenderer from "@/components/sections/SectionRenderer";
import NewsletterSection from "@/components/sections/NewsletterSection";

import { getPublicPageSections } from "@/services/cms-service";
import { getProducts } from "@/services/product-service";

async function HomeContent() {
  const [sections, novidadesProducts, conjuntosProducts] = await Promise.all([
    getPublicPageSections("home"),
    getProducts({ isNew: true, limit: 8 }),
    getProducts({ categorySlug: "conjuntos", limit: 8 }),
  ]);

  return (
    <SectionRenderer
      sections={sections}
      novidadesProducts={novidadesProducts}
      conjuntosProducts={conjuntosProducts}
    />
  );
}

function HomeFallback() {
  return (
    <div className="w-full space-y-16 py-0" role="status" aria-label="Carregando novidades e coleções">
      {/* Skeleton do Hero Principal */}
      <div className="relative aspect-[4/5] sm:aspect-[16/9] lg:aspect-[21/9] w-full bg-[#f4f5f2] animate-pulse flex items-center justify-center">
        <div className="max-w-[560px] w-full px-6 text-center space-y-4">
          <div className="h-3 w-32 bg-[#e6e7e4] mx-auto rounded-full" />
          <div className="h-8 sm:h-12 w-3/4 bg-[#e6e7e4] mx-auto rounded" />
          <div className="h-4 w-5/6 bg-[#e6e7e4] mx-auto rounded" />
          <div className="h-10 w-40 bg-[#1f6b4f]/20 mx-auto rounded-md mt-6" />
        </div>
      </div>

      {/* Skeleton da Vitrine de Produtos */}
      <div className="mx-auto max-w-[1240px] px-6">
        <div className="mb-8 text-center space-y-2">
          <div className="h-3 w-28 bg-[#e6e7e4] mx-auto rounded-full" />
          <div className="h-7 w-48 bg-[#e6e7e4] mx-auto rounded" />
          <div className="h-4 w-72 bg-[#e6e7e4] mx-auto rounded" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-[3/4] w-full rounded-2xl bg-[#f4f5f2] animate-pulse" />
              <div className="h-4 w-3/4 bg-[#f4f5f2] rounded" />
              <div className="h-3 w-1/2 bg-[#f4f5f2] rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <>
      <Header />

      <main aria-label="Conteúdo principal da loja" className="flex-1">
        <Suspense fallback={<HomeFallback />}>
          <HomeContent />
        </Suspense>
      </main>

      <NewsletterSection />
      <Footer />
    </>
  );
}

