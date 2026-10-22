import type { Metadata } from "next";
import { connection } from "next/server";
import { getCategories } from "@/services/product-service";
import ProductForm from "@/components/admin/ProductForm";

export const instant = false;

export const metadata: Metadata = {
  title: "Novo Produto | Use Três Marias Admin",
  description: "Cadastrar nova peça no catálogo da loja.",
};

type RouteContext = {
  searchParams: Promise<{ categoria?: string }>;
};

export default async function AdminNovoProdutoPage({ searchParams }: RouteContext) {
  await connection();
  const { categoria } = await searchParams;
  const categories = await getCategories();

  return (
    <ProductForm
      categories={categories}
      defaultCategorySlug={categoria}
    />
  );
}
