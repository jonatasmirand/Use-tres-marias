
import type { Metadata } from "next";
import { cache, Suspense } from "react";
import { notFound } from "next/navigation";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/catalog/ProductCard";
import { getProducts, getCategoryBySlug } from "@/services/product-service";
import type { Category } from "@/types/catalog";

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

// Memoização por requisição para evitar consultas duplicadas entre generateMetadata e a página
const getCachedCategoryBySlug = cache((slug: string) =>
  getCategoryBySlug(slug)
);

function getCategoryDisplayInfo(category: Category): { label: string; description: string } {
  const custom = CATEGORY_MAP[category.slug.toLowerCase()];
  if (custom) {
    return custom;
  }

  const description =
    category.description?.trim() ||
    `Peças selecionadas com elegância, qualidade e design contemporâneo para enriquecer seu guarda-roupa.`;

  return {
    label: category.name,
    description,
  };
}

export function generateStaticParams() {
  return Object.keys(CATEGORY_MAP).map((categoria) => ({
    categoria,
  }));
}

export async function generateMetadata({
  params,
}: RouteContext): Promise<Metadata> {
  const { categoria } = await params;
  const slug = categoria.toLowerCase();
  const category = await getCachedCategoryBySlug(slug);

  if (!category) {
    return {
      title: "Página não encontrada | Use Três Marias",
    };
  }

  const info = getCategoryDisplayInfo(category);

  return {
    title: `${info.label} | Use Três Marias`,
    description: info.description,
  };
}

async function CategoryProducts({ slug }: { slug: string }) {
  const products = await getProducts({ categorySlug: slug });

  if (products.length === 0) {
    return (
      <div className="py-20 text-center text-[#777d78]">
        <p className="font-serif text-lg text-[#202522]">
          Nenhum produto cadastrado nesta categoria ainda.
        </p>
        <p className="mt-1 text-xs">
          Novas peças serão adicionadas em breve!
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 -mt-4 text-xs font-semibold text-[#5f6863]">
        {products.length} {products.length === 1 ? "peça encontrada" : "peças encontradas"}
      </div>

      <div className="grid grid-cols-2 justify-items-center gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

function CategoryProductSkeleton({ count = 8 }: { count?: number }) {
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

async function CategoryPageContent({ params }: RouteContext) {
  const { categoria } = await params;
  const slug = categoria.toLowerCase();
  const category = await getCachedCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const info = getCategoryDisplayInfo(category);

  return (
    <main className="flex-1 bg-white px-6 py-10 md:py-14">
      <div className="mx-auto max-w-[1240px]">
        {/* Cabeçalho da Categoria (estático para a categoria selecionada) */}
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
        </div>

        {/* Grade de Produtos dinâmica com Suspense */}
        <Suspense fallback={<CategoryProductSkeleton count={8} />}>
          <CategoryProducts slug={slug} />
        </Suspense>
      </div>
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

