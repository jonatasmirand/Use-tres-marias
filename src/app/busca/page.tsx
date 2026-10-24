import type { Metadata } from "next";
import { connection } from "next/server";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/catalog/ProductCard";
import { searchProducts } from "@/services/product-service";

export const instant = false;

type RouteContext = {
  searchParams: Promise<{ q?: string }>;
};

export async function generateMetadata({ searchParams }: RouteContext): Promise<Metadata> {
  const { q } = await searchParams;
  const term = q?.trim() || "";
  return {
    title: term ? `Resultados para "${term}" | useTrêsMarias` : "Buscar Peças | useTrêsMarias",
    description: `Confira os produtos encontrados para "${term}" na loja Use Três Marias. Moda feminina elegante e atemporal.`,
  };
}

export default async function BuscaPage({ searchParams }: RouteContext) {
  await connection();
  const { q } = await searchParams;
  const query = q?.trim() || "";

  const products = query ? await searchProducts(query, 40) : [];

  return (
    <>
      <Header />
      <main className="flex-1 bg-white">
        {/* Cabeçalho da Página de Busca */}
        <section className="border-b border-[#e6e7e4] bg-[#faf8f3] px-6 py-10">
          <div className="mx-auto max-w-[1240px]">
            {/* Breadcrumb */}
            <nav aria-label="Navegação estrutural" className="mb-3 text-[11px] text-[#777d78]">
              <Link href="/" className="hover:text-[#1f6b4f] transition">
                Início
              </Link>
              <span className="mx-2">/</span>
              <span className="text-[#202522]">Busca</span>
            </nav>

            <h1 className="font-serif text-3xl font-bold tracking-tight text-[#202522] md:text-4xl">
              {query ? (
                <>
                  Resultados para <span className="text-[#1f6b4f]">&quot;{query}&quot;</span>
                </>
              ) : (
                "Buscar Peças"
              )}
            </h1>

            <p className="mt-2 text-xs text-[#5f6863]">
              {products.length === 1
                ? "1 peça encontrada"
                : `${products.length} peças encontradas`}
            </p>
          </div>
        </section>

        {/* Vitrine de Produtos Encontrados */}
        <section className="mx-auto max-w-[1240px] px-6 py-12">
          {products.length === 0 ? (
            <div className="py-16 text-center">
              <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-[#f4f5f2] text-2xl text-[#777d78]">
                🔍
              </div>
              <h2 className="font-serif text-xl font-bold text-[#202522] mb-2">
                Nenhum resultado encontrado
              </h2>
              <p className="text-xs text-[#777d78] max-w-md mx-auto mb-8 leading-relaxed">
                Não encontramos peças equivalentes para a busca &quot;{query}&quot;. Tente buscar por categorias como vestidos, linho, bermudas ou alfaiataria.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/busca?q=vestidos"
                  className="rounded-full border border-[#e6e7e4] bg-white px-4 py-2 text-xs font-semibold text-[#1f6b4f] hover:bg-[#eaf3ee] transition shadow-xs"
                >
                  Vestidos
                </Link>
                <Link
                  href="/busca?q=linho"
                  className="rounded-full border border-[#e6e7e4] bg-white px-4 py-2 text-xs font-semibold text-[#1f6b4f] hover:bg-[#eaf3ee] transition shadow-xs"
                >
                  Peças de Linho
                </Link>
                <Link
                  href="/busca?q=alfaiataria"
                  className="rounded-full border border-[#e6e7e4] bg-white px-4 py-2 text-xs font-semibold text-[#1f6b4f] hover:bg-[#eaf3ee] transition shadow-xs"
                >
                  Alfaiataria
                </Link>
                <Link
                  href="/busca?q=conjunto"
                  className="rounded-full border border-[#e6e7e4] bg-white px-4 py-2 text-xs font-semibold text-[#1f6b4f] hover:bg-[#eaf3ee] transition shadow-xs"
                >
                  Conjuntos
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:gap-x-6 sm:gap-y-10">
              {products.map((product) => (
                <div key={product.id} className="flex justify-center">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
