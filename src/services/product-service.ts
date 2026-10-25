import { supabase as publicSupabase } from "@/lib/supabase/client";
import { createClient } from "@/lib/supabase/server";
import { Product, ProductInput, Category, CATALOG_CATEGORIES } from "@/types/catalog";
import { slugify } from "@/validations/product-schemas";

/* -------------------------------------------------------------------------- */
/*  Produtos de demonstração (fallback caso o banco esteja vazio)             */
/* -------------------------------------------------------------------------- */

export const FALLBACK_PRODUCTS: Product[] = [
  // Vestidos
  {
    id: "prod-vestido-1",
    name: "Vestido Midi Alfaiataria Marsala",
    slug: "vestido-midi-alfaiataria-marsala",
    description: "Vestido midi estruturado em alfaiataria com decote quadrado, fenda sutil e caimento impecável para ocasiões marcantes.",
    price: 389.9,
    images: [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=900&q=80",
    ],
    sizes: ["PP", "P", "M", "G"],
    is_new: true,
    is_active: true,
    position: 1,
    category_id: "cat-vestidos",
    category: { id: "cat-vestidos", name: "Vestidos", slug: "vestidos" },
  },
  {
    id: "prod-vestido-2",
    name: "Vestido Longo Linho Puro Cru",
    slug: "vestido-longo-linho-puro-cru",
    description: "Confeccionado em puro linho leve, alças reguláveis e detalhe de botões frontais forrados no mesmo tecido.",
    price: 449.0,
    images: [
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80",
    ],
    sizes: ["P", "M", "G"],
    is_new: false,
    is_active: true,
    position: 2,
    category_id: "cat-vestidos",
    category: { id: "cat-vestidos", name: "Vestidos", slug: "vestidos" },
  },
  {
    id: "prod-vestido-3",
    name: "Vestido Evasê Manga Bufante Verde Floresta",
    slug: "vestido-evase-manga-bufante-verde-floresta",
    description: "Modelagem romântica com mangas bufantes sutis, elástico confortável nos punhos e decote em V sofisticado.",
    price: 359.9,
    images: [
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=80",
    ],
    sizes: ["PP", "P", "M", "G", "GG"],
    is_new: true,
    is_active: true,
    position: 3,
    category_id: "cat-vestidos",
    category: { id: "cat-vestidos", name: "Vestidos", slug: "vestidos" },
  },

  // Blusas
  {
    id: "prod-blusa-1",
    name: "Camisa de Linho Alvo com Amarração",
    slug: "camisa-linho-alvo-com-amarracao",
    description: "Corte clássico estruturado com toque macio e acabamento premium. Possui faixa opcional para amarração frontal.",
    price: 249.9,
    images: [
      "https://images.unsplash.com/photo-1551163943-3f6a855d1153?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=900&q=80",
    ],
    sizes: ["P", "M", "G"],
    is_new: true,
    is_active: true,
    position: 1,
    category_id: "cat-blusas",
    category: { id: "cat-blusas", name: "Blusas", slug: "blusas" },
  },
  {
    id: "prod-blusa-2",
    name: "Regata de Seda Dourada",
    slug: "regata-seda-dourada",
    description: "Alças finas e caimento fluido que valorizam a silhueta, acessórios e semijoias finas.",
    price: 189.0,
    images: [
      "https://images.unsplash.com/photo-1589310243389-96a5483213a8?auto=format&fit=crop&w=900&q=80",
    ],
    sizes: ["PP", "P", "M", "G"],
    is_new: false,
    is_active: true,
    position: 2,
    category_id: "cat-blusas",
    category: { id: "cat-blusas", name: "Blusas", slug: "blusas" },
  },

  // Bermudas
  {
    id: "prod-bermuda-1",
    name: "Bermuda Alfaiataria Preta com Cinto Forrado",
    slug: "bermuda-alfaiataria-preta-com-cinto-forrado",
    description: "Comprimento elegante meia-coxa, pregas frontais bem marcadas e cinto encapado no mesmo tom.",
    price: 269.0,
    images: [
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=80",
    ],
    sizes: ["36", "38", "40", "42"],
    is_new: false,
    is_active: true,
    position: 1,
    category_id: "cat-bermudas",
    category: { id: "cat-bermudas", name: "Bermudas", slug: "bermudas" },
  },
  {
    id: "prod-bermuda-2",
    name: "Bermuda Linho Natural Terracota",
    slug: "bermuda-linho-natural-terracota",
    description: "Toque fresco de linho misto com cós elástico anatômico na parte posterior e bolsos faca funcionais.",
    price: 239.0,
    images: [
      "https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=900&q=80",
    ],
    sizes: ["P", "M", "G"],
    is_new: true,
    is_active: true,
    position: 2,
    category_id: "cat-bermudas",
    category: { id: "cat-bermudas", name: "Bermudas", slug: "bermudas" },
  },

  // Conjuntos
  {
    id: "prod-conjunto-1",
    name: "Conjunto Colete & Calça Risca de Giz Marinho",
    slug: "conjunto-colete-calca-risca-de-giz-marinho",
    description: "Inspirado no estilo Três Marias: colete estruturado com botões nobres e calça pantalona de corte reto impecável.",
    price: 529.0,
    images: [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
    ],
    sizes: ["PP", "P", "M", "G"],
    is_new: true,
    is_active: true,
    position: 1,
    category_id: "cat-conjuntos",
    category: { id: "cat-conjuntos", name: "Conjuntos", slug: "conjuntos" },
  },
  {
    id: "prod-conjunto-2",
    name: "Conjunto Alfaiataria Burgundy Blazer Sem Manga & Saia",
    slug: "conjunto-alfaiataria-burgundy-blazer-saia",
    description: "Sofisticação marcante em tom vinho profundo. Blazer alongado sem mangas com gola smoking e saia midi acetinada.",
    price: 499.0,
    images: [
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=80",
    ],
    sizes: ["P", "M", "G"],
    is_new: true,
    is_active: true,
    position: 2,
    category_id: "cat-conjuntos",
    category: { id: "cat-conjuntos", name: "Conjuntos", slug: "conjuntos" },
  },
  {
    id: "prod-conjunto-3",
    name: "Conjunto Linho Off-White Cropped & Pantalona",
    slug: "conjunto-linho-off-white-cropped-pantalona",
    description: "Elegância minimalista em linho cru. Perfeito para eventos especiais, almoços de domingo ou um dia comum com beleza.",
    price: 469.0,
    images: [
      "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80",
    ],
    sizes: ["PP", "P", "M", "G"],
    is_new: false,
    is_active: true,
    position: 3,
    category_id: "cat-conjuntos",
    category: { id: "cat-conjuntos", name: "Conjuntos", slug: "conjuntos" },
  },
];

/* -------------------------------------------------------------------------- */
/*  Leitura pública                                                           */
/* -------------------------------------------------------------------------- */

export interface GetProductsFilter {
  categorySlug?: string;
  isNew?: boolean;
  limit?: number;
  includeInactive?: boolean;
}

export async function getProducts(filter: GetProductsFilter = {}): Promise<Product[]> {
  try {
    const supabase = publicSupabase;

    let query = supabase
      .from("products")
      .select(`
        id,
        name,
        slug,
        description,
        price,
        images,
        sizes,
        is_new,
        is_active,
        position,
        category_id,
        categories (
          id,
          name,
          slug
        )
      `)
      .order("position", { ascending: true })
      .order("created_at", { ascending: false });

    if (!filter.includeInactive) {
      query = query.eq("is_active", true);
    }

    if (filter.isNew) {
      query = query.eq("is_new", true);
    }

    if (filter.limit) {
      query = query.limit(filter.limit);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      return filterFallbackProducts(filter);
    }

    // Normalização de dados recebidos do Supabase
    const list: Product[] = (data as any[]).map((row) => {
      const cat = Array.isArray(row.categories)
        ? row.categories[0]
        : row.categories || null;

      const imgs = Array.isArray(row.images) && row.images.length > 0
        ? row.images
        : [];

      return {
        id: row.id,
        name: row.name,
        slug: row.slug || slugify(row.name),
        description: row.description || "",
        price: Number(row.price) || 0,
        images: imgs,
        sizes: Array.isArray(row.sizes) ? row.sizes : [],
        is_new: Boolean(row.is_new),
        is_active: Boolean(row.is_active),
        position: Number(row.position) || 0,
        category_id: row.category_id || (cat ? cat.id : null),
        category: cat ? { id: cat.id, name: cat.name, slug: cat.slug } : null,
      };
    });

    if (filter.categorySlug) {
      const target = filter.categorySlug.toLowerCase();
      const filtered = list.filter((p) => p.category?.slug.toLowerCase() === target);
      return filtered.length > 0 ? filtered : filterFallbackProducts(filter);
    }

    return list;
  } catch {
    return filterFallbackProducts(filter);
  }
}

function filterFallbackProducts(filter: GetProductsFilter): Product[] {
  let list = [...FALLBACK_PRODUCTS];

  if (!filter.includeInactive) {
    list = list.filter((p) => p.is_active);
  }
  if (filter.categorySlug) {
    const slug = filter.categorySlug.toLowerCase();
    list = list.filter((p) => p.category?.slug.toLowerCase() === slug);
  }
  if (filter.isNew) {
    list = list.filter((p) => p.is_new);
  }
  if (filter.limit) {
    list = list.slice(0, filter.limit);
  }

  return list;
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const normSlug = slug.toLowerCase().trim();
  try {
    const supabase = publicSupabase;

    const { data, error } = await supabase
      .from("products")
      .select(`
        id,
        name,
        slug,
        description,
        price,
        images,
        sizes,
        is_new,
        is_active,
        position,
        category_id,
        categories (
          id,
          name,
          slug
        )
      `)
      .eq("slug", normSlug)
      .eq("is_active", true)
      .maybeSingle();

    if (error || !data) {
      const fallback = FALLBACK_PRODUCTS.find((p) => p.slug === normSlug && p.is_active);
      return fallback || null;
    }

    const cat = Array.isArray(data.categories) ? data.categories[0] : data.categories || null;
    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
      description: data.description || "",
      price: Number(data.price) || 0,
      images: Array.isArray(data.images) ? data.images : [],
      sizes: Array.isArray(data.sizes) ? data.sizes : [],
      is_new: Boolean(data.is_new),
      is_active: Boolean(data.is_active),
      position: Number(data.position) || 0,
      category_id: data.category_id,
      category: cat ? { id: cat.id, name: cat.name, slug: cat.slug } : null,
    };
  } catch {
    const fallback = FALLBACK_PRODUCTS.find((p) => p.slug === normSlug && p.is_active);
    return fallback || null;
  }
}

function isUuid(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

export async function getProductById(id: string): Promise<Product | null> {
  if (!isUuid(id)) {
    const fallback = FALLBACK_PRODUCTS.find((p) => p.id === id);
    return fallback || null;
  }

  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("products")
      .select(`
        id,
        name,
        slug,
        description,
        price,
        images,
        sizes,
        is_new,
        is_active,
        position,
        category_id,
        categories (
          id,
          name,
          slug
        )
      `)
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      const fallback = FALLBACK_PRODUCTS.find((p) => p.id === id);
      return fallback || null;
    }

    const cat = Array.isArray(data.categories) ? data.categories[0] : data.categories || null;
    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
      description: data.description || "",
      price: Number(data.price) || 0,
      images: Array.isArray(data.images) ? data.images : [],
      sizes: Array.isArray(data.sizes) ? data.sizes : [],
      is_new: Boolean(data.is_new),
      is_active: Boolean(data.is_active),
      position: Number(data.position) || 0,
      category_id: data.category_id,
      category: cat ? { id: cat.id, name: cat.name, slug: cat.slug } : null,
    };
  } catch {
    const fallback = FALLBACK_PRODUCTS.find((p) => p.id === id);
    return fallback || null;
  }
}

/* -------------------------------------------------------------------------- */
/*  Categorias                                                                */
/* -------------------------------------------------------------------------- */

export async function getCategories(): Promise<Category[]> {
  try {
    const supabase = publicSupabase;
    const { data, error } = await supabase
      .from("categories")
      .select("id, name, slug")
      .order("name", { ascending: true });

    if (error || !data || data.length === 0) {
      return CATALOG_CATEGORIES.map((c) => ({
        id: `cat-${c.slug}`,
        name: c.label,
        slug: c.slug,
      }));
    }

    return data as Category[];
  } catch {
    return CATALOG_CATEGORIES.map((c) => ({
      id: `cat-${c.slug}`,
      name: c.label,
      slug: c.slug,
    }));
  }
}

/* -------------------------------------------------------------------------- */
/*  Operações Administrativas (Create, Update, Delete)                         */
/* -------------------------------------------------------------------------- */

export async function createProduct(input: ProductInput): Promise<Product> {
  const supabase = await createClient();
  let baseSlug = slugify(input.name);
  if (!baseSlug) baseSlug = "produto";

  // Evita colisão de slug
  const { data: existing } = await supabase
    .from("products")
    .select("slug")
    .eq("slug", baseSlug)
    .maybeSingle();

  const finalSlug = existing ? `${baseSlug}-${Date.now().toString().slice(-4)}` : baseSlug;

  const insertData = {
    name: input.name,
    slug: finalSlug,
    description: input.description,
    price: input.price,
    images: input.images,
    sizes: input.sizes,
    category_id: input.category_id,
    is_new: input.is_new,
    is_active: input.is_active,
  };

  const { data, error } = await supabase
    .from("products")
    .insert(insertData)
    .select(`
      id,
      name,
      slug,
      description,
      price,
      images,
      sizes,
      is_new,
      is_active,
      position,
      category_id,
      categories (
        id,
        name,
        slug
      )
    `)
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Erro ao cadastrar produto no Supabase.");
  }

  const cat = Array.isArray(data.categories) ? data.categories[0] : data.categories || null;
  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    description: data.description || "",
    price: Number(data.price) || 0,
    images: Array.isArray(data.images) ? data.images : [],
    sizes: Array.isArray(data.sizes) ? data.sizes : [],
    is_new: Boolean(data.is_new),
    is_active: Boolean(data.is_active),
    position: Number(data.position) || 0,
    category_id: data.category_id,
    category: cat ? { id: cat.id, name: cat.name, slug: cat.slug } : null,
  };
}

export async function updateProduct(id: string, input: Partial<ProductInput>): Promise<Product> {
  if (!isUuid(id)) {
    throw new Error("Este item é demonstrativo e não está salvo no banco. Execute o script de seed no Supabase para gerenciar peças reais.");
  }

  const supabase = await createClient();

  const updateData: Record<string, any> = {};
  if (input.name !== undefined) updateData.name = input.name;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.price !== undefined) updateData.price = input.price;
  if (input.images !== undefined) updateData.images = input.images;
  if (input.sizes !== undefined) updateData.sizes = input.sizes;
  if (input.category_id !== undefined) updateData.category_id = input.category_id;
  if (input.is_new !== undefined) updateData.is_new = input.is_new;
  if (input.is_active !== undefined) updateData.is_active = input.is_active;

  const { data, error } = await supabase
    .from("products")
    .update(updateData)
    .eq("id", id)
    .select(`
      id,
      name,
      slug,
      description,
      price,
      images,
      sizes,
      is_new,
      is_active,
      position,
      category_id,
      categories (
        id,
        name,
        slug
      )
    `)
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Erro ao atualizar produto no Supabase.");
  }

  const cat = Array.isArray(data.categories) ? data.categories[0] : data.categories || null;
  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    description: data.description || "",
    price: Number(data.price) || 0,
    images: Array.isArray(data.images) ? data.images : [],
    sizes: Array.isArray(data.sizes) ? data.sizes : [],
    is_new: Boolean(data.is_new),
    is_active: Boolean(data.is_active),
    position: Number(data.position) || 0,
    category_id: data.category_id,
    category: cat ? { id: cat.id, name: cat.name, slug: cat.slug } : null,
  };
}

export async function deleteProduct(id: string): Promise<void> {
  if (!isUuid(id)) {
    throw new Error("Este item é demonstrativo e não está salvo no banco. Execute o script de seed no Supabase para gerenciar peças reais.");
  }

  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) {
    throw new Error(error.message || "Erro ao excluir produto.");
  }
}

/* -------------------------------------------------------------------------- */
/*  Busca Inteligente por Palavras-Chave e Sinônimos Equivalentes             */
/* -------------------------------------------------------------------------- */

export function normalizeSearchTerm(str: string): string {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

/**
 * Termos equivalentes e sinônimos frequentes no vocabulário de moda feminina
 */
export const SEARCH_SYNONYMS: Record<string, string[]> = {
  vestido: ["vestidos", "vestido", "midi", "longo", "evase"],
  vestidos: ["vestidos", "vestido", "midi", "longo", "evase"],
  blusa: ["blusas", "blusa", "camisa", "camisas", "regata", "cropped"],
  blusas: ["blusas", "blusa", "camisa", "camisas", "regata", "cropped"],
  camisa: ["camisa", "camisas", "blusa", "blusas", "linho"],
  camisas: ["camisa", "camisas", "blusa", "blusas", "linho"],
  regata: ["regata", "blusa", "blusas", "seda"],
  bermuda: ["bermudas", "bermuda", "short", "shorts", "alfaiataria"],
  bermudas: ["bermudas", "bermuda", "short", "shorts", "alfaiataria"],
  short: ["bermuda", "bermudas", "short", "shorts"],
  shorts: ["bermuda", "bermudas", "short", "shorts"],
  conjunto: ["conjuntos", "conjunto", "colete", "calca", "pantalona", "saia"],
  conjuntos: ["conjuntos", "conjunto", "colete", "calca", "pantalona", "saia"],
  colete: ["colete", "conjunto", "conjuntos"],
  calca: ["calca", "calça", "pantalona", "conjunto", "alfaiataria"],
  pantalona: ["pantalona", "calca", "conjunto"],
  saia: ["saia", "conjunto", "burgundy"],
  linho: ["linho", "puro linho", "cru", "natural"],
  alfaiataria: ["alfaiataria", "estruturado", "corte reto"],
  seda: ["seda", "regata"],
  midi: ["midi", "vestido", "saia"],
  longo: ["longo", "vestido"],
  preto: ["preto", "preta"],
  preta: ["preto", "preta"],
  branco: ["branco", "branca", "off-white", "alvo", "cru"],
  branca: ["branco", "branca", "off-white", "alvo", "cru"],
  offwhite: ["off-white", "cru", "alvo", "branco"],
  "off-white": ["off-white", "cru", "alvo", "branco"],
  cru: ["cru", "off-white", "linho", "natural"],
  verde: ["verde", "verde floresta"],
  marsala: ["marsala", "burgundy", "vinho"],
  burgundy: ["burgundy", "marsala", "vinho"],
  novidades: ["novidade", "novo", "is_new"],
  novidade: ["novidade", "novo", "is_new"],
};

/**
 * Busca produtos ativos no catálogo por nome, descrição, categoria ou sinônimos
 */
export async function searchProducts(query: string, limit = 20): Promise<Product[]> {
  const rawQuery = query.trim();
  if (!rawQuery) {
    return [];
  }

  // 1. Obtém todos os produtos ativos (do Supabase ou Fallback)
  const allProducts = await getProducts({ includeInactive: false });

  // 2. Normaliza os tokens digitados pela cliente
  const queryTokens = normalizeSearchTerm(rawQuery)
    .split(/\s+/)
    .filter(Boolean);

  if (queryTokens.length === 0) {
    return [];
  }

  // 3. Avalia e pontua a relevância de cada produto
  const scoredProducts: { product: Product; score: number }[] = [];

  for (const product of allProducts) {
    const normName = normalizeSearchTerm(product.name);
    const normDesc = normalizeSearchTerm(product.description || "");
    const normCat = normalizeSearchTerm(product.category?.name || "");
    const normSlug = normalizeSearchTerm(product.slug || "");
    const sizes = (product.sizes || []).map((s) => s.toUpperCase());

    let totalScore = 0;
    let matchesAllTokens = true;

    for (const token of queryTokens) {
      // Expande sinônimos do token
      const synonyms = SEARCH_SYNONYMS[token] || [token];
      const tokenVariants = Array.from(new Set([token, ...synonyms]));

      let tokenMatched = false;

      // Correspondência com cada variante
      for (const variant of tokenVariants) {
        const normVariant = normalizeSearchTerm(variant);

        // Pontuação por nome do produto
        if (normName === normVariant) {
          totalScore += 100;
          tokenMatched = true;
        } else if (normName.includes(normVariant)) {
          totalScore += 40;
          tokenMatched = true;
        }

        // Pontuação por categoria
        if (normCat === normVariant || normSlug === normVariant) {
          totalScore += 30;
          tokenMatched = true;
        } else if (normCat.includes(normVariant)) {
          totalScore += 20;
          tokenMatched = true;
        }

        // Pontuação por descrição
        if (normDesc.includes(normVariant)) {
          totalScore += 15;
          tokenMatched = true;
        }

        // Pontuação por novidade
        if ((token === "novidade" || token === "novidades") && product.is_new) {
          totalScore += 35;
          tokenMatched = true;
        }

        // Pontuação por tamanho
        if (sizes.includes(token.toUpperCase())) {
          totalScore += 15;
          tokenMatched = true;
        }
      }

      if (!tokenMatched) {
        matchesAllTokens = false;
        break;
      }
    }

    if (matchesAllTokens && totalScore > 0) {
      scoredProducts.push({ product, score: totalScore });
    }
  }

  // 4. Ordena por relevância (maior score primeiro)
  scoredProducts.sort((a, b) => b.score - a.score);

  return scoredProducts.slice(0, limit).map((sp) => sp.product);
}
