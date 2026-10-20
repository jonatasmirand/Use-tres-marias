import { supabase as publicSupabase } from "@/lib/supabase/client";
import { createClient } from "../../lib/supabase/server";
import {
  CmsSection,
  HeroContent,
  CardsGridContent,
  ReorderSectionItem,
  UpdateDraftPayload,
} from "@/types/cms";

export const DEFAULT_HERO_CONTENT: HeroContent = {
  desktop_image_url: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1920&q=80",
  mobile_image_url: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=768&q=80",
  alt_text: "Coleção exclusiva de semijoias finas Use Três Marias",
  title: "Elegância atemporal para realçar a sua essência",
  description: "Descubra semijoias exclusivas criadas com design contemporâneo e acabamento refinado de alta joalheria.",
  button_text: "Explorar Novidades",
  button_url: "/#novidades",
  content_alignment: "left",
  image_position: "background",
  overlay_opacity: 30,
};

export const DEFAULT_NOVIDADES_CONTENT: CardsGridContent = {
  section_badge: "Coleção Exclusiva",
  section_headline: "Novidades da Semana",
  section_subheadline: "Lançamentos selecionados para compor produções elegantes e contemporâneas.",
  view_all_text: "Ver Todas as Novidades",
  view_all_url: "/#novidades",
  cards: [
    {
      id: "novidades-card-1",
      image_url: "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=700&h=700&q=80",
      alt_text: "Argolas Banhadas a Ouro 18k",
      title: "Argolas Banhadas 18k",
      description: "Design minimalista e atemporal com banho nobre de alta durabilidade.",
      button_text: "Ver Detalhes",
      button_url: "/#novidades",
      badge: "Lançamento",
      is_visible: true,
      position: 1,
    },
    {
      id: "novidades-card-2",
      image_url: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=700&h=700&q=80",
      alt_text: "Colar Ponto de Luz Zircônia",
      title: "Colar Ponto de Luz",
      description: "Gargantilha delicada com zircônia cristal lapidada e fecho joalheiro.",
      button_text: "Ver Detalhes",
      button_url: "/#novidades",
      badge: "Mais Vendido",
      is_visible: true,
      position: 2,
    },
    {
      id: "novidades-card-3",
      image_url: "https://images.unsplash.com/photo-1611591475816-16e6f5c889a7?auto=format&fit=crop&w=700&h=700&q=80",
      alt_text: "Pulseira Riviera Cravejada",
      title: "Pulseira Riviera",
      description: "Cravejada com pedras premium de brilho intenso para ocasiões marcantes.",
      button_text: "Ver Detalhes",
      button_url: "/#novidades",
      badge: "Exclusivo",
      is_visible: true,
      position: 3,
    },
  ],
};

export const DEFAULT_VESTIDOS_CONTENT: CardsGridContent = {
  section_badge: "Alta Costura & Fluidez",
  section_headline: "Vestidos Elegantes",
  section_subheadline: "Modelagens sofisticadas com caimento impecável e tecidos nobres para ocasiões inesquecíveis.",
  view_all_text: "Explorar Vestidos",
  view_all_url: "/#vestidos",
  cards: [
    {
      id: "vestidos-card-1",
      image_url: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=700&h=700&q=80",
      alt_text: "Vestido Longo Seda Esmeralda",
      title: "Vestido Longo Esmeralda",
      description: "Fluidez incomparável com decote elegante e fenda sutil refinada.",
      button_text: "Ver Peça",
      button_url: "/#vestidos",
      badge: "Destaque",
      is_visible: true,
      position: 1,
    },
    {
      id: "vestidos-card-2",
      image_url: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=700&h=700&q=80",
      alt_text: "Vestido Midi Linho Cru",
      title: "Vestido Midi em Linho",
      description: "Frescor e elegância natural em fibra pura com abotoamento frontal.",
      button_text: "Ver Peça",
      button_url: "/#vestidos",
      badge: "Linha Natural",
      is_visible: true,
      position: 2,
    },
    {
      id: "vestidos-card-3",
      image_url: "https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?auto=format&fit=crop&w=700&h=700&q=80",
      alt_text: "Vestido Cetim Champagne",
      title: "Vestido Cetim Champagne",
      description: "Toque acetinado suave com alças delicadas para eventos noturnos.",
      button_text: "Ver Peça",
      button_url: "/#vestidos",
      badge: "Noite",
      is_visible: true,
      position: 3,
    },
  ],
};

export const DEFAULT_BLUSAS_CONTENT: CardsGridContent = {
  section_badge: "Delicadeza & Versatilidade",
  section_headline: "Blusas & Camisas",
  section_subheadline: "Peças versáteis em tecidos leves que transitam com facilidade do dia de trabalho ao jantar especial.",
  view_all_text: "Explorar Blusas",
  view_all_url: "/#blusas",
  cards: [
    {
      id: "blusas-card-1",
      image_url: "https://images.unsplash.com/photo-1551163943-3f6a855d1153?auto=format&fit=crop&w=700&h=700&q=80",
      alt_text: "Camisa de Linho Alvo",
      title: "Camisa Linho Alvo",
      description: "Corte clássico estruturado com toque macio e acabamento premium.",
      button_text: "Ver Peça",
      button_url: "/#blusas",
      badge: "Essencial",
      is_visible: true,
      position: 1,
    },
    {
      id: "blusas-card-2",
      image_url: "https://images.unsplash.com/photo-1589310243389-96a5483213a8?auto=format&fit=crop&w=700&h=700&q=80",
      alt_text: "Regata de Seda Dourada",
      title: "Regata Seda Dourada",
      description: "Alças finas e caimento leve que valorizam acessórios e semijoias.",
      button_text: "Ver Peça",
      button_url: "/#blusas",
      badge: "Festa",
      is_visible: true,
      position: 2,
    },
    {
      id: "blusas-card-3",
      image_url: "https://images.unsplash.com/photo-1518049362265-d5b2a6467637?auto=format&fit=crop&w=700&h=700&q=80",
      alt_text: "Blusa Alfaiataria Manga Bufante",
      title: "Blusa Alfaiataria Bufante",
      description: "Detalhe volumétrico sutil nas mangas para um visual marcante.",
      button_text: "Ver Peça",
      button_url: "/#blusas",
      badge: "Tendência",
      is_visible: true,
      position: 3,
    },
  ],
};

export const DEFAULT_BERMUDAS_CONTENT: CardsGridContent = {
  section_badge: "Conforto Chic",
  section_headline: "Bermudas & Shorts",
  section_subheadline: "Cortes modernos e estruturados que proporcionam liberdade de movimento sem abrir mão da elegância.",
  view_all_text: "Explorar Bermudas",
  view_all_url: "/#bermudas",
  cards: [
    {
      id: "bermudas-card-1",
      image_url: "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&w=700&h=700&q=80",
      alt_text: "Bermuda Alfaiataria Cós Alto",
      title: "Bermuda Cós Alto Alfaiataria",
      description: "Modelagem impecável com pregas discretas e passantes elegantes.",
      button_text: "Ver Peça",
      button_url: "/#bermudas",
      badge: "Clássico",
      is_visible: true,
      position: 1,
    },
    {
      id: "bermudas-card-2",
      image_url: "https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=700&h=700&q=80",
      alt_text: "Bermuda Linho Cru com Faixa",
      title: "Bermuda Linho Natural",
      description: "Acompanha faixa de amarração no mesmo tom para cintura marcada.",
      button_text: "Ver Peça",
      button_url: "/#bermudas",
      badge: "Casual Chic",
      is_visible: true,
      position: 2,
    },
    {
      id: "bermudas-card-3",
      image_url: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=700&h=700&q=80",
      alt_text: "Shorts Social Verde Oliva",
      title: "Shorts Social Oliva",
      description: "Bolsos funcionais com acabamento embutido e barra italiana dobrada.",
      button_text: "Ver Peça",
      button_url: "/#bermudas",
      badge: "Novo",
      is_visible: true,
      position: 3,
    },
  ],
};

export const DEFAULT_CONJUNTOS_CONTENT: CardsGridContent = {
  section_badge: "Harmonia Total",
  section_headline: "Conjuntos Coordenados",
  section_subheadline: "Combinações prontas e harmoniosas pensadas para você estar impecável com o mínimo de esforço.",
  view_all_text: "Explorar Conjuntos",
  view_all_url: "/#conjuntos",
  cards: [
    {
      id: "conjuntos-card-1",
      image_url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&h=700&q=80",
      alt_text: "Conjunto Alfaiataria Off-White",
      title: "Conjunto Blazer & Bermuda Off",
      description: "A sofisticação do monocromático com corte moderno e botões forrados.",
      button_text: "Ver Conjunto",
      button_url: "/#conjuntos",
      badge: "Destaque",
      is_visible: true,
      position: 1,
    },
    {
      id: "conjuntos-card-2",
      image_url: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=700&h=700&q=80",
      alt_text: "Conjunto Cropped e Saia Terracota",
      title: "Conjunto Terracota Elegance",
      description: "Cor vibrante e terrosa perfeita para o clima brasileiro em tecido estruturado.",
      button_text: "Ver Conjunto",
      button_url: "/#conjuntos",
      badge: "Coleção Outono",
      is_visible: true,
      position: 2,
    },
    {
      id: "conjuntos-card-3",
      image_url: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=700&h=700&q=80",
      alt_text: "Conjunto Verde Sálvia Fresh",
      title: "Conjunto Sálvia em Linho",
      description: "Tons suaves com frescor absoluto para os dias ensolarados.",
      button_text: "Ver Conjunto",
      button_url: "/#conjuntos",
      badge: "Mais Vendido",
      is_visible: true,
      position: 3,
    },
  ],
};

const STATIC_TIMESTAMP = "2026-10-19T00:00:00.000Z";

export const ALL_FALLBACK_SECTIONS: CmsSection[] = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    page_id: "00000000-0000-0000-0000-000000000000",
    stable_key: "home-hero",
    section_type: "hero",
    internal_title: "Hero Principal - Vitrine de Destaque",
    position: 1,
    is_active: true,
    status: "published",
    draft_content: DEFAULT_HERO_CONTENT,
    published_content: DEFAULT_HERO_CONTENT,
    published_at: STATIC_TIMESTAMP,
    updated_at: STATIC_TIMESTAMP,
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    page_id: "00000000-0000-0000-0000-000000000000",
    stable_key: "home-novidades",
    section_type: "novidades",
    internal_title: "Seção Novidades - Três Peças",
    position: 2,
    is_active: true,
    status: "published",
    draft_content: DEFAULT_NOVIDADES_CONTENT,
    published_content: DEFAULT_NOVIDADES_CONTENT,
    published_at: STATIC_TIMESTAMP,
    updated_at: STATIC_TIMESTAMP,
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    page_id: "00000000-0000-0000-0000-000000000000",
    stable_key: "home-vestidos",
    section_type: "vestidos",
    internal_title: "Seção Vestidos - Três Peças",
    position: 3,
    is_active: true,
    status: "published",
    draft_content: DEFAULT_VESTIDOS_CONTENT,
    published_content: DEFAULT_VESTIDOS_CONTENT,
    published_at: STATIC_TIMESTAMP,
    updated_at: STATIC_TIMESTAMP,
  },
  {
    id: "00000000-0000-0000-0000-000000000004",
    page_id: "00000000-0000-0000-0000-000000000000",
    stable_key: "home-blusas",
    section_type: "blusas",
    internal_title: "Seção Blusas - Três Peças",
    position: 4,
    is_active: true,
    status: "published",
    draft_content: DEFAULT_BLUSAS_CONTENT,
    published_content: DEFAULT_BLUSAS_CONTENT,
    published_at: STATIC_TIMESTAMP,
    updated_at: STATIC_TIMESTAMP,
  },
  {
    id: "00000000-0000-0000-0000-000000000005",
    page_id: "00000000-0000-0000-0000-000000000000",
    stable_key: "home-bermudas",
    section_type: "bermudas",
    internal_title: "Seção Bermudas - Três Peças",
    position: 5,
    is_active: true,
    status: "published",
    draft_content: DEFAULT_BERMUDAS_CONTENT,
    published_content: DEFAULT_BERMUDAS_CONTENT,
    published_at: STATIC_TIMESTAMP,
    updated_at: STATIC_TIMESTAMP,
  },
  {
    id: "00000000-0000-0000-0000-000000000006",
    page_id: "00000000-0000-0000-0000-000000000000",
    stable_key: "home-conjuntos",
    section_type: "conjuntos",
    internal_title: "Seção Conjuntos - Três Peças",
    position: 6,
    is_active: true,
    status: "published",
    draft_content: DEFAULT_CONJUNTOS_CONTENT,
    published_content: DEFAULT_CONJUNTOS_CONTENT,
    published_at: STATIC_TIMESTAMP,
    updated_at: STATIC_TIMESTAMP,
  },
];

export const FALLBACK_HERO_SECTION = ALL_FALLBACK_SECTIONS[0];

function isUuid(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

function resolveStableKey(idOrKey: string): string {
  const map: Record<string, string> = {
    "default-hero-id": "home-hero",
    "00000000-0000-0000-0000-000000000001": "home-hero",
    "00000000-0000-0000-0000-000000000002": "home-novidades",
    "00000000-0000-0000-0000-000000000003": "home-vestidos",
    "00000000-0000-0000-0000-000000000004": "home-blusas",
    "00000000-0000-0000-0000-000000000005": "home-bermudas",
    "00000000-0000-0000-0000-000000000006": "home-conjuntos",
    "hero": "home-hero",
    "novidades": "home-novidades",
    "vestidos": "home-vestidos",
    "blusas": "home-blusas",
    "bermudas": "home-bermudas",
    "conjuntos": "home-conjuntos",
  };
  return map[idOrKey] || idOrKey;
}

/**
 * Consulta as seções públicas de uma página (status = 'published' e is_active = true)
 */
export async function getPublicPageSections(slug: string = "home"): Promise<CmsSection[]> {
  try {
    const supabase = publicSupabase;

    const { data: page, error: pageError } = await supabase
      .from("cms_pages")
      .select("id")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();

    if (pageError || !page) {
      return ALL_FALLBACK_SECTIONS;
    }

    const { data: sections, error: sectionsError } = await supabase
      .from("cms_sections")
      .select("*")
      .eq("page_id", page.id)
      .eq("is_active", true)
      .eq("status", "published")
      .not("published_content", "is", null)
      .order("position", { ascending: true });

    if (sectionsError || !sections || sections.length === 0) {
      return ALL_FALLBACK_SECTIONS;
    }

    // Mesclar com fallbacks se faltar alguma seção
    const keysInDb = new Set(sections.map((s) => s.stable_key));
    const merged = [...sections];

    for (const fallback of ALL_FALLBACK_SECTIONS) {
      if (!keysInDb.has(fallback.stable_key)) {
        merged.push(fallback);
      }
    }

    return merged.sort((a, b) => a.position - b.position) as CmsSection[];
  } catch {
    return ALL_FALLBACK_SECTIONS;
  }
}

/**
 * Consulta todas as seções para o painel administrativo (inclui rascunhos)
 */
export async function getAdminPageSections(slug: string = "home"): Promise<{ pageId: string; sections: CmsSection[] }> {
  try {
    const supabase = await createClient();

    let pageId = "";
    const { data: page } = await supabase
      .from("cms_pages")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();

    if (page) {
      pageId = page.id;
    }

    const query = supabase
      .from("cms_sections")
      .select("*")
      .order("position", { ascending: true });

    if (pageId) {
      query.eq("page_id", pageId);
    }

    const { data: sections, error } = await query;

    if (error || !sections || sections.length === 0) {
      return { pageId, sections: ALL_FALLBACK_SECTIONS };
    }

    const keysInDb = new Set(sections.map((s) => s.stable_key));
    const merged = [...sections];

    for (const fallback of ALL_FALLBACK_SECTIONS) {
      if (!keysInDb.has(fallback.stable_key)) {
        merged.push(fallback);
      }
    }

    return { pageId, sections: merged.sort((a, b) => a.position - b.position) as CmsSection[] };
  } catch {
    return { pageId: "", sections: ALL_FALLBACK_SECTIONS };
  }
}

/**
 * Busca uma seção específica pelo ID (ou stable_key)
 */
export async function getSectionById(idOrKey: string): Promise<CmsSection | null> {
  const targetKey = resolveStableKey(idOrKey);
  const fallback = ALL_FALLBACK_SECTIONS.find(
    (s) => s.id === idOrKey || s.stable_key === targetKey || s.stable_key === idOrKey
  );

  try {
    const supabase = await createClient();

    let query = supabase.from("cms_sections").select("*");

    if (isUuid(idOrKey) && !idOrKey.startsWith("00000000-0000-0000-0000-00000000000")) {
      query = query.eq("id", idOrKey);
    } else {
      query = query.eq("stable_key", targetKey);
    }

    const { data, error } = await query.maybeSingle();

    if (error || !data) {
      return fallback || null;
    }

    return data as CmsSection;
  } catch {
    return fallback || null;
  }
}

/**
 * Atualiza o rascunho (draft_content) da seção sem alterar a versão publicada
 */
export async function updateSectionDraft(idOrKey: string, payload: UpdateDraftPayload): Promise<CmsSection> {
  const supabase = await createClient();
  const targetKey = resolveStableKey(idOrKey);

  const updates: Record<string, unknown> = {
    draft_content: payload.draft_content,
    status: "draft",
    updated_at: new Date().toISOString(),
  };

  if (payload.internal_title) {
    updates.internal_title = payload.internal_title;
  }

  // Tenta atualizar se existir
  let query = supabase.from("cms_sections").update(updates);

  if (isUuid(idOrKey) && !idOrKey.startsWith("00000000-0000-0000-0000-00000000000")) {
    query = query.eq("id", idOrKey);
  } else {
    query = query.eq("stable_key", targetKey);
  }

  const { data, error } = await query.select().maybeSingle();

  // Se a linha ainda não existir na tabela cms_sections, criamos via upsert
  if (!data) {
    const fallback = ALL_FALLBACK_SECTIONS.find((s) => s.stable_key === targetKey);
    const { data: page } = await supabase.from("cms_pages").select("id").eq("slug", "home").maybeSingle();

    if (page && fallback) {
      const { data: inserted, error: insertError } = await supabase
        .from("cms_sections")
        .insert({
          page_id: page.id,
          stable_key: targetKey,
          section_type: fallback.section_type,
          internal_title: payload.internal_title || fallback.internal_title,
          position: fallback.position,
          is_active: fallback.is_active,
          status: "draft",
          draft_content: payload.draft_content,
          published_content: fallback.published_content,
        })
        .select()
        .single();

      if (inserted) {
        return inserted as CmsSection;
      }
      if (insertError) {
        throw new Error(insertError.message);
      }
    }
  }

  if (error || !data) {
    if (
      error?.message?.includes("schema cache") ||
      error?.message?.includes("cms_sections") ||
      error?.code === "PGRST205"
    ) {
      throw new Error("A tabela 'cms_sections' ainda não foi criada no Supabase. Execute o script de migração na aba SQL Editor do Supabase.");
    }
    throw new Error(error?.message || "Erro ao atualizar rascunho da seção.");
  }

  return data as CmsSection;
}

/**
 * Publica a seção: copia draft_content para published_content e atualiza status para 'published'
 */
export async function publishSection(idOrKey: string): Promise<CmsSection> {
  const supabase = await createClient();
  const targetKey = resolveStableKey(idOrKey);

  const current = await getSectionById(idOrKey);
  if (!current) {
    throw new Error("Seção não encontrada para publicação.");
  }

  const now = new Date().toISOString();
  let query = supabase
    .from("cms_sections")
    .update({
      published_content: current.draft_content,
      status: "published",
      published_at: now,
      updated_at: now,
    });

  if (isUuid(idOrKey) && !idOrKey.startsWith("00000000-0000-0000-0000-00000000000")) {
    query = query.eq("id", idOrKey);
  } else {
    query = query.eq("stable_key", targetKey);
  }

  const { data, error } = await query.select().maybeSingle();

  // Se não existia ainda, insere publicado
  if (!data) {
    const { data: page } = await supabase.from("cms_pages").select("id").eq("slug", "home").maybeSingle();
    if (page) {
      const { data: inserted } = await supabase
        .from("cms_sections")
        .insert({
          page_id: page.id,
          stable_key: targetKey,
          section_type: current.section_type,
          internal_title: current.internal_title,
          position: current.position,
          is_active: current.is_active,
          status: "published",
          draft_content: current.draft_content,
          published_content: current.draft_content,
          published_at: now,
        })
        .select()
        .single();

      if (inserted) {
        return inserted as CmsSection;
      }
    }
  }

  if (error || !data) {
    if (
      error?.message?.includes("schema cache") ||
      error?.message?.includes("cms_sections") ||
      error?.code === "PGRST205"
    ) {
      throw new Error("A tabela 'cms_sections' ainda não foi criada no Supabase. Execute o script de migração na aba SQL Editor do Supabase.");
    }
    throw new Error(error?.message || "Não foi possível publicar a seção.");
  }

  return data as CmsSection;
}

/**
 * Alterna a visibilidade (is_active) de uma seção
 */
export async function toggleSectionVisibility(idOrKey: string, isActive: boolean): Promise<CmsSection> {
  const supabase = await createClient();
  const targetKey = resolveStableKey(idOrKey);

  let query = supabase
    .from("cms_sections")
    .update({
      is_active: isActive,
      updated_at: new Date().toISOString(),
    });

  if (isUuid(idOrKey) && !idOrKey.startsWith("00000000-0000-0000-0000-00000000000")) {
    query = query.eq("id", idOrKey);
  } else {
    query = query.eq("stable_key", targetKey);
  }

  const { data, error } = await query.select().maybeSingle();

  if (error || !data) {
    throw new Error(error?.message || "Não foi possível alterar a visibilidade da seção.");
  }

  return data as CmsSection;
}

/**
 * Reordena as seções atualizando o campo position
 */
export async function reorderSections(items: ReorderSectionItem[]): Promise<void> {
  const supabase = await createClient();

  for (const item of items) {
    await supabase
      .from("cms_sections")
      .update({ position: item.position })
      .eq("id", item.id);
  }
}
