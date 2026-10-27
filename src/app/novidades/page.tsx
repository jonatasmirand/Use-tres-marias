
import type { Metadata } from "next";
import { Suspense } from "react";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/catalog/ProductCard";
import { getProducts } from "@/services/product-service";

export const metadata: Metadata = {
  title: "Novidades | Use Três Marias",
  description:
    "Conheça os mais recentes lançamentos da coleção Use Três Marias.",
};

async function NovidadesProductGrid() {
  const products = await getProducts({ isNew: true });

  if (products.length === 0) {
    return (
      <div className="py-20 text-center text-[#777d78]">
        <p className="font-serif text-lg text-[#202522]">
          Nenhuma novidade encontrada no momento.
        </p>
        <p className="mt-1 text-xs">
          Fique atenta, em breve novos modelos serão lançados!
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 -mt-4 text-xs font-semibold text-[#5f6863]">
        {products.length} {products.length === 1 ? "peça disponível" : "peças disponíveis"}
      </div>

      <div className="grid grid-cols-2 justify-items-center gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="space-y-6">
      <div className="h-4 w-32 bg-[#f4f5f2] rounded animate-pulse" />
      <div className="grid grid-cols-2 justify-items-center gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: count }).map((_, idx) => (
          <div key={idx} className="w-full space-y-3">
            <div className="aspect-[3/4] w-full rounded-2xl bg-[#f4f5f2] animate-pulse" />
            <div className="h-4 w-3/4 bg-[#f4f5f2] rounded" />
            <div className="h-3 w-1/3 bg-[#f4f5f2] rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function NovidadesPage() {
  return (
    <>
      <Header />

      <main className="flex-1 bg-white px-6 py-10 md:py-14">
        <div className="mx-auto max-w-[1240px]">
          {/* Cabeçalho estático da página (renderizado instantaneamente) */}
          <div className="mb-8 border-b border-[#e6e7e4] pb-6 md:mb-10">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1f6b4f]">
              Lançamentos Exclusivos
            </span>

            <h1 className="mt-1 font-serif text-3xl font-normal text-[#202522] md:text-5xl">
              Novidades
            </h1>

            <p className="mt-2 max-w-[500px] text-xs text-[#777d78] md:text-sm">
              Peças recém-chegadas com modelagens contemporâneas e tecidos
              nobres para você se vestir com elegância e conforto.
            </p>
          </div>

          {/* Grid de produtos dinâmico envolvido por Suspense */}
          <Suspense fallback={<ProductGridSkeleton count={8} />}>
            <NovidadesProductGrid />
          </Suspense>
        </div>
      </main>

      <Footer />
    </>
  );
}

