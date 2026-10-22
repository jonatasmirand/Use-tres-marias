import type { Metadata } from "next";
import { connection } from "next/server";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/catalog/ProductCard";
import { getProducts } from "@/services/product-service";

export const instant = false;

export const metadata: Metadata = {
  title: "Novidades | Use Três Marias",
  description: "Conheça os mais recentes lançamentos da coleção Use Três Marias.",
};

export default async function NovidadesPage() {
  await connection();
  const products = await getProducts({ isNew: true });

  return (
    <>
      <Header />
      <main className="flex-1 bg-white py-10 md:py-14 px-6">
        <div className="mx-auto max-w-[1240px]">
          {/* Cabeçalho da Página */}
          <div className="border-b border-[#e6e7e4] pb-6 mb-8 md:mb-10">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1f6b4f]">
              Lançamentos Exclusivos
            </span>
            <h1 className="font-serif text-3xl md:text-5xl font-normal text-[#202522] mt-1">
              Novidades
            </h1>
            <p className="mt-2 text-xs md:text-sm text-[#777d78] max-w-[500px]">
              Peças recém-chegadas com modelagens contemporâneas e tecidos nobres para você se vestir com elegância e conforto.
            </p>
            <div className="mt-4 text-xs font-semibold text-[#5f6863]">
              {products.length} {products.length === 1 ? "peça disponível" : "peças disponíveis"}
            </div>
          </div>

          {/* Grade de Produtos */}
          {products.length === 0 ? (
            <div className="py-20 text-center text-[#777d78]">
              <p className="font-serif text-lg text-[#202522]">Nenhuma novidade encontrada no momento.</p>
              <p className="text-xs mt-1">Fique atenta, em breve novos modelos serão lançados!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 justify-items-center">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
