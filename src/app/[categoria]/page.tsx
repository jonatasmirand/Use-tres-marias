import type { Metadata } from "next";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/catalog/ProductCard";
import { getProducts } from "@/services/product-service";
import { CATALOG_CATEGORIES } from "@/types/catalog";

export const instant = false;

type RouteContext = {
  params: Promise<{ categoria: string }>;
};

const CATEGORY_MAP: Record<string, { label: string; description: string }> = {
  vestidos: {
    label: "Vestidos",
    description: "Modelagens fluídas, alfaiataria impecável e tecidos nobres para compor produções elegantes.",
  },
  blusas: {
    label: "Blusas",
    description: "Camisas clássicas, regatas de seda e peças versáteis que combinam do dia a dia a ocasiões especiais.",
  },
  bermudas: {
    label: "Bermudas",
    description: "Cortes refinados em linho e alfaiataria com comprimento elegante e conforto absoluto.",
  },
  conjuntos: {
    label: "Conjuntos",
    description: "Combinações harmônicas e sofisticadas criadas para vestir com perfeição e praticidade.",
  },
};

export async function generateMetadata({ params }: RouteContext): Promise<Metadata> {
  const { categoria } = await params;
  const info = CATEGORY_MAP[categoria.toLowerCase()];

  if (!info) {
    return { title: "Página não encontrada | Use Três Marias" };
  }

  return {
    title: `${info.label} | Use Três Marias`,
    description: info.description,
  };
}

export default async function CategoryPage({ params }: RouteContext) {
  await connection();
  const { categoria } = await params;
  const slug = categoria.toLowerCase();
  const info = CATEGORY_MAP[slug];

  if (!info) {
    notFound();
  }

  const products = await getProducts({ categorySlug: slug });

  return (
    <>
      <Header />
      <main className="flex-1 bg-white py-10 md:py-14 px-6">
        <div className="mx-auto max-w-[1240px]">
          {/* Cabeçalho da Categoria */}
          <div className="border-b border-[#e6e7e4] pb-6 mb-8 md:mb-10">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1f6b4f]">
              Coleção Três Marias
            </span>
            <h1 className="font-serif text-3xl md:text-5xl font-normal text-[#202522] mt-1">
              {info.label}
            </h1>
            <p className="mt-2 text-xs md:text-sm text-[#777d78] max-w-[500px]">
              {info.description}
            </p>
            <div className="mt-4 text-xs font-semibold text-[#5f6863]">
              {products.length} {products.length === 1 ? "peça encontrada" : "peças encontradas"}
            </div>
          </div>

          {/* Grade de Produtos */}
          {products.length === 0 ? (
            <div className="py-20 text-center text-[#777d78]">
              <p className="font-serif text-lg text-[#202522]">Nenhum produto cadastrado nesta categoria ainda.</p>
              <p className="text-xs mt-1">Novas peças serão adicionadas em breve!</p>
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
