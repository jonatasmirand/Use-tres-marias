import { supabase as publicSupabase } from "@/lib/supabase/client";
import { createClient } from "@/lib/supabase/server";
import {
  CmsSection,
  HeroContent,
  ShowcaseContent,
  ReorderSectionItem,
  UpdateDraftPayload,
} from "@/types/cms";

/* -------------------------------------------------------------------------- */
/*  Conteúdo padrão (usado quando o banco ainda não tem a seção)              */
/* -------------------------------------------------------------------------- */

export const DEFAULT_HERO_CONTENT: HeroContent = {
  interval_seconds: 6,
  slides: [
    {
      id: "slide-primavera",
      image_url: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1800&q=85",
      mobile_image_url: "",
      alt_text: "Coleção Primavera • 2026 – useTrêsMarias",
      image_fit: "cover",
      eyebrow: "Coleção Primavera • 2026",
      title: "Seu estilo.<br>Do seu jeito.",
      description: "Peças femininas pensadas para acompanhar todos os momentos — com leveza, personalidade e aquele toque especial das Três Marias.",
      button_text: "Conheça a coleção",
      button_url: "/novidades",
    },
  ],
};

export const DEFAULT_NOVIDADES_CONTENT: ShowcaseContent = {
  section_badge: "Acabou de chegar",
  section_headline: "Novidades",
  section_subheadline: "Lançamentos selecionados para compor produções elegantes e contemporâneas.",
  view_all_text: "Ver todas as novidades",
  view_all_url: "/novidades",
  max_items: 8,
};

export const DEFAULT_CONJUNTOS_CONTENT: ShowcaseContent = {
  section_badge: "Harmonia total",
  section_headline: "Conjuntos",
  section_subheadline: "Combinações prontas e harmoniosas para você estar impecável com o mínimo de esforço.",
  view_all_text: "Ver todos os conjuntos",
  view_all_url: "/conjuntos",
  max_items: 8,
};

const STATIC_TIMESTAMP = "2026-10-21T00:00:00.000Z";

/** Únicas seções exibidas na página inicial (na ordem padrão). */
export const HOME_SECTION_KEYS = ["home-hero", "home-novidades", "home-conjuntos"] as const;

export const ALL_FALLBACK_SECTIONS: CmsSection[] = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    page_id: "00000000-0000-0000-0000-000000000000",
    stable_key: "home-hero",
    section_type: "hero",
    internal_title: "Hero – Carrossel institucional",
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
    internal_title: "Vitrine – Novidades",
    position: 2,
    is_active: true,
    status: "published",
    draft_content: DEFAULT_NOVIDADES_CONTENT,
    published_content: DEFAULT_NOVIDADES_CONTENT,
    published_at: STATIC_TIMESTAMP,
    updated_at: STATIC_TIMESTAMP,
  },
  {
    id: "00000000-0000-0000-0000-000000000006",
    page_id: "00000000-0000-0000-0000-000000000000",
    stable_key: "home-conjuntos",
    section_type: "conjuntos",
    internal_title: "Vitrine – Conjuntos",
    position: 3,
    is_active: true,
    status: "published",
    draft_content: DEFAULT_CONJUNTOS_CONTENT,
    published_content: DEFAULT_CONJUNTOS_CONTENT,
    published_at: STATIC_TIMESTAMP,
    updated_at: STATIC_TIMESTAMP,
  },
];

export const FALLBACK_HERO_SECTION = ALL_FALLBACK_SECTIONS[0];

/** Mantém somente as seções da Home e completa com os padrões que faltarem. */
function mergeHomeSections(fromDb: CmsSection[]): CmsSection[] {
  const allowed = new Set<string>(HOME_SECTION_KEYS);
  const filtered = fromDb.filter((s) => allowed.has(s.stable_key));
  const keysInDb = new Set(filtered.map((s) => s.stable_key));

  for (const fallback of ALL_FALLBACK_SECTIONS) {
    if (!keysInDb.has(fallback.stable_key)) {
      filtered.push(fallback);
    }
  }

  return filtered.sort((a, b) => a.position - b.position);
}

function isUuid(str: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

function resolveStableKey(idOrKey: string): string {
  const map: Record<string, string> = {
    "default-hero-id": "home-hero",
    "00000000-0000-0000-0000-000000000001": "home-hero",
    "00000000-0000-0000-0000-000000000002": "home-novidades",
    "00000000-0000-0000-0000-000000000006": "home-conjuntos",
    "hero": "home-hero",
    "novidades": "home-novidades",
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

    const allowed = new Set<string>(HOME_SECTION_KEYS);
    const homeSections = (sections || []).filter((s) => allowed.has(s.stable_key)) as CmsSection[];

    if (sectionsError || homeSections.length === 0) {
      return ALL_FALLBACK_SECTIONS;
    }

    // A leitura pública só enxerga seções ativas/publicadas: se uma seção não
    // veio do banco é porque foi ocultada no painel, então não usamos fallback.
    return homeSections.sort((a, b) => a.position - b.position);
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

    return { pageId, sections: mergeHomeSections(sections as CmsSection[]) };
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
    if (!isUuid(item.id)) {
      throw new Error("ID de seção inválido: " + item.id);
    }
    await supabase
      .from("cms_sections")
      .update({ position: item.position })
      .eq("id", item.id);
  }
}
