export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  images: string[];
  sizes: string[];
  is_new: boolean;
  is_active: boolean;
  position: number;
  category_id: string | null;
  category?: Category | null;
}

export interface ProductInput {
  name: string;
  price: number;
  description: string;
  images: string[];
  sizes: string[];
  category_id: string;
  is_new: boolean;
  is_active: boolean;
}

/** Tipos de roupa exibidos no menu e nas abas do painel (ordem de exibição). */
export const CATALOG_CATEGORIES = [
  { slug: "vestidos", label: "Vestidos" },
  { slug: "blusas", label: "Blusas" },
  { slug: "bermudas", label: "Bermudas" },
  { slug: "conjuntos", label: "Conjuntos" },
] as const;

export type CatalogCategorySlug = (typeof CATALOG_CATEGORIES)[number]["slug"];

export const DEFAULT_SIZES = ["PP", "P", "M", "G", "GG"] as const;

export const MAX_PRODUCT_IMAGES = 8;

export interface CartItem {
  id: string; // unique identifier: `${productId}-${size}`
  productId: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  size: string;
  quantity: number;
}
