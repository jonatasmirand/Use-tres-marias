
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

async function NovidadesContent() {
  const products = await getProducts({ isNew: true });

  return (
    <main className="flex-1 bg-white px-6 py-10 md:py-14">
      <div className="mx-auto max-w-[1240px]">
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

          <div className="mt-4 text-xs font-semibold text-[#5f6863]">
            {products.length}{" "}
            {products.length === 1
              ? "peça disponível"
              : "peças disponíveis"}
          </div>
        </div>

        {products.length === 0 ? (
          <div className="py-20 text-center text-[#777d78]">
            <p className="font-serif text-lg text-[#202522]">
              Nenhuma novidade encontrada no momento.
            </p>
            <p className="mt-1 text-xs">
              Fique atenta, em breve novos modelos serão lançados!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 justify-items-center gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function NovidadesFallback() {
  return (
    <main
      className="flex min-h-[40vh] flex-1 items-center justify-center bg-white px-6"
      role="status"
      aria-live="polite"
    >
      <p className="text-sm text-[#777d78]">
        Carregando novidades...
      </p>
    </main>
  );
}

export default function NovidadesPage() {
  return (
    <>
      <Header />

      <Suspense fallback={<NovidadesFallback />}>
        <NovidadesContent />
      </Suspense>

      <Footer />
    </>
  );
}
