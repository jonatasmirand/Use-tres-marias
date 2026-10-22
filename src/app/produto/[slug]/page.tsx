import type { Metadata } from "next";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ProductDetailView from "@/components/catalog/ProductDetailView";
import { getProductBySlug } from "@/services/product-service";

export const instant = false;

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: RouteContext): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Produto não encontrado | Use Três Marias" };
  }

  return {
    title: `${product.name} | Use Três Marias`,
    description: product.description || `Compre ${product.name} na Use Três Marias.`,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.images?.[0] ? [{ url: product.images[0] }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: RouteContext) {
  await connection();
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <>
      <Header />
      <main className="flex-1 bg-white">
        <ProductDetailView product={product} />
      </main>
      <Footer />
    </>
  );
}
