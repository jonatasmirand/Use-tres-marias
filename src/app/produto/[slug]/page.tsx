
import type { Metadata } from "next";
import { cache, Suspense } from "react";
import { notFound } from "next/navigation";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductDetailView from "@/components/catalog/ProductDetailView";
import { getProductBySlug } from "@/services/product-service";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

// Compartilha o resultado da consulta durante a renderização.
const getCachedProductBySlug = cache((slug: string) =>
  getProductBySlug(slug)
);

export async function generateMetadata({
  params,
}: RouteContext): Promise<Metadata> {
  const { slug } = await params;
  const product = await getCachedProductBySlug(slug);

  if (!product) {
    return {
      title: "Produto não encontrado | Use Três Marias",
    };
  }

  return {
    title: `${product.name} | Use Três Marias`,
    description:
      product.description ||
      `Compre ${product.name} na Use Três Marias.`,
    openGraph: {
      title: product.name,
      description: product.description || undefined,
      images: product.images?.[0]
        ? [{ url: product.images[0] }]
        : undefined,
    },
  };
}

async function ProductContent({ slug }: { slug: string }) {
  const product = await getCachedProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images,
    description: product.description,
    brand: {
      "@type": "Brand",
      name: "Use Três Marias",
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "BRL",
      price: product.price,
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "Use Três Marias",
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <ProductDetailView product={product} />
    </>
  );
}

function ProductFallback() {
  return (
    <div
      className="mx-auto max-w-[1240px] px-6 py-10 md:py-14"
      role="status"
      aria-label="Carregando detalhes do produto"
    >
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-14 lg:gap-20">
        {/* Galeria Skeleton */}
        <div className="space-y-4">
          <div className="aspect-[3/4] w-full rounded-2xl bg-[#f4f5f2] animate-pulse" />
          <div className="flex gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="size-20 rounded-xl bg-[#f4f5f2] animate-pulse" />
            ))}
          </div>
        </div>

        {/* Informações da Peça Skeleton */}
        <div className="space-y-6">
          <div className="h-3 w-36 bg-[#f4f5f2] rounded" />
          <div className="h-8 sm:h-10 w-3/4 bg-[#f4f5f2] rounded" />
          <div className="h-6 w-32 bg-[#f4f5f2] rounded" />
          <div className="h-16 w-full bg-[#f4f5f2] rounded" />
          <div className="space-y-2">
            <div className="h-3 w-28 bg-[#f4f5f2] rounded" />
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 w-12 rounded-lg bg-[#f4f5f2]" />
              ))}
            </div>
          </div>
          <div className="h-12 w-full rounded-xl bg-[#1f6b4f]/20 animate-pulse mt-6" />
        </div>
      </div>
    </div>
  );
}


export default function ProductPage({ params }: RouteContext) {
  return (
    <>
      <Header />

      <main className="flex-1 bg-white">
        <Suspense fallback={<ProductFallback />}>
          <ProductPageContent params={params} />
        </Suspense>
      </main>

      <Footer />
    </>
  );
}

async function ProductPageContent({
  params,
}: RouteContext) {
  const { slug } = await params;

  return <ProductContent slug={slug} />;
}
