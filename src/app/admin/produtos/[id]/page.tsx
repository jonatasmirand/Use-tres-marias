import type { Metadata } from "next";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { getProductById, getCategories } from "@/services/product-service";
import ProductForm from "@/components/admin/ProductForm";

export const instant = false;

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: RouteContext): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);
  return {
    title: product ? `Editar: ${product.name} | Use Três Marias Admin` : "Editar Produto",
  };
}

export default async function AdminEditarProdutoPage({ params }: RouteContext) {
  await connection();
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getProductById(id),
    getCategories(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <ProductForm
      initialProduct={product}
      categories={categories}
    />
  );
}
