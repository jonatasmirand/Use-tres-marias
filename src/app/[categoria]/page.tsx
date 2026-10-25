
import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/catalog/ProductCard";
import { getProducts } from "@/services/product-service";

type RouteContext = {
  params: Promise<{ categoria: string }>;
};

const CATEGORY_MAP: Record<
  string,
  { label: string; description: string }
> = {
  vestidos: {
    label: "Vestidos",
    description:
      "Modelagens fluídas, alfaiataria impecável e tecidos nobres para compor produções elegantes.",
  },
  blusas: {
    label: "Blusas",
    description:
      "Camisas clássicas, regatas de seda e peças versáteis que combinam do dia a dia a ocasiões especiais.",
  },
  bermudas: {
    label: "Bermudas",
    description:
      "Cortes refinados em linho e alfaiataria com comprimento elegante e conforto absoluto.",
  },
  conjuntos: {
    label: "Conjuntos",
    description:
      "Combinações harmônicas e sofisticadas criadas para vestir com perfeição e praticidade.",
  },
};

export async function generateMetadata({
  params,
}: RouteContext): Promise<Metadata> {
  const { categoria } = await params;
  const info = CATEGORY_MAP[categoria.toLowerCase()];

  if (!info) {
    return {
      title: "Página não encontrada | Use Três Marias",
    };
  }

  return {
    title: `${info.label} | Use Três Marias`,
    description: info.description,
  };
}

async function CategoryContent({
  categoria,
}: {
  categoria: string;
}) {
  const slug = categoria.toLowerCase();
  const info = CATEGORY_MAP[slug];

  if (!info) {
    notFound();
  }

  const products = await getProducts({ categorySlug: slug });

  return (
    <main className="flex-1 bg-white px-6 py-10 md:py-14">
      <div className="mx-auto max-w-[1240px]">
        <div className="mb-8 border-b border-[#e6e7e4] pb-6 md:mb-10">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1f6b4f]">
            Coleção Três Marias
          </span>

          <h1 className="mt-1 font-serif text-3xl font-normal text-[#202522] md:text-5xl">
            {info.label}
          </h1>

          <p className="mt-2 max-w-[500px] text-xs text-[#777d78] md:text-sm">
            {info.description}
          </p>

          <div className="mt-4 text-xs font-semibold text-[#5f6863]">
            {products.length}{" "}
            {products.length === 1
              ? "peça encontrada"
              : "peças encontradas"}
          </div>
        </div>

        {products.length === 0 ? (
          <div className="py-20 text-center text-[#777d78]">
            <p className="font-serif text-lg text-[#202522]">
              Nenhum produto cadastrado nesta categoria ainda.
            </p>
            <p className="mt-1 text-xs">
              Novas peças serão adicionadas em breve!
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

function CategoryFallback() {
  return (
    <main
      className="flex min-h-[40vh] flex-1 items-center justify-center bg-white px-6"
      role="status"
      aria-live="polite"
    >
      <p className="text-sm text-[#777d78]">
        Carregando produtos da coleção...
      </p>
    </main>
  );
}


export default function CategoryPage({ params }: RouteContext) {
  return (
    <>
      <Header />

      <Suspense fallback={<CategoryFallback />}>
        <CategoryPageContent params={params} />
      </Suspense>

      <Footer />
    </>
  );
}

async function CategoryPageContent({
  params,
}: RouteContext) {
  const { categoria } = await params;

  return <CategoryContent categoria={categoria} />;
}
