import type { Metadata } from "next";
import { connection } from "next/server";
import { getProducts, getCategories } from "@/services/product-service";
import ProductListView from "@/components/admin/ProductListView";

export const instant = false;

export const metadata: Metadata = {
  title: "Produtos do Catálogo | Use Três Marias Admin",
  description: "Gerencie o catálogo de roupas por abas de categorias.",
};

type RouteContext = {
  searchParams: Promise<{ categoria?: string }>;
};

export default async function AdminProdutosPage({ searchParams }: RouteContext) {
  await connection();
  const { categoria } = await searchParams;

  const [products, categories] = await Promise.all([
    getProducts({ includeInactive: true }),
    getCategories(),
  ]);

  return (
    <ProductListView
      initialProducts={products}
      categories={categories}
      initialCategorySlug={categoria || "todos"}
    />
  );
}
