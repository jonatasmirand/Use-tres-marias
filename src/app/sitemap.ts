import type { MetadataRoute } from "next";
import { getProducts } from "@/services/product-service";
import { CATALOG_CATEGORIES } from "@/types/catalog";


export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://usetresmarias.com.br";

  // 1. Páginas Institucionais e Home
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/novidades`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  // 2. Páginas de Categorias (/vestidos, /blusas, /bermudas, /conjuntos)
  const categoryPages: MetadataRoute.Sitemap = CATALOG_CATEGORIES.map((cat) => ({
    url: `${baseUrl}/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.8,
  }));

  // 3. Todos os Produtos Ativos da Loja
  const products = await getProducts({ includeInactive: false });
  const productPages: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${baseUrl}/produto/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticPages, ...categoryPages, ...productPages];
}
