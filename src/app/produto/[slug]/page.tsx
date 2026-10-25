
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
      className="flex min-h-[40vh] items-center justify-center"
      role="status"
      aria-live="polite"
    >
      <p className="text-sm text-gray-500">
        Carregando produto...
      </p>
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
