export type SectionType =
  | 'hero'
  | 'novidades'
  | 'conjuntos'
  | 'cards_grid'
  | 'vestidos'
  | 'blusas'
  | 'bermudas'
  | 'banner'
  | 'vitrine';

export type PublicationStatus = 'draft' | 'published' | 'archived';

/* -------------------------------------------------------------------------- */
/*  Hero – Carrossel institucional                                            */
/* -------------------------------------------------------------------------- */

export type SlideImageFit = 'cover' | 'contain';

export interface HeroSlide {
  id: string;
  image_url: string;
  mobile_image_url?: string;
  alt_text: string;
  /** 'contain' mostra a arte inteira (ideal para artes prontas); 'cover' preenche a tela. */
  image_fit: SlideImageFit;
  eyebrow?: string;
  title?: string;
  description?: string;
  button_text?: string;
  button_url?: string;
}

export interface HeroContent {
  /** Tempo de exibição de cada slide, em segundos. */
  interval_seconds: number;
  slides: HeroSlide[];
}

/** Formato antigo do Hero (um único banner). Mantido apenas para conversão. */
export interface LegacyHeroContent {
  desktop_image_url: string;
  mobile_image_url?: string;
  alt_text?: string;
  title?: string;
  description?: string;
  button_text?: string;
  button_url?: string;
}

export const HERO_INTERVAL_MIN = 3;
export const HERO_INTERVAL_MAX = 15;
export const HERO_MAX_SLIDES = 10;

export const DEFAULT_HERO_SLIDE: HeroSlide = {
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
};

export const DEFAULT_HERO_CONTENT: HeroContent = {
  interval_seconds: 6,
  slides: [DEFAULT_HERO_SLIDE],
};

/* -------------------------------------------------------------------------- */
/*  Vitrines de produtos da Home (Novidades / Conjuntos)                      */
/* -------------------------------------------------------------------------- */

export interface ShowcaseContent {
  section_badge?: string;
  section_headline: string;
  section_subheadline?: string;
  view_all_text?: string;
  view_all_url?: string;
  /** Quantidade máxima de produtos exibidos na Home. */
  max_items: number;
}

export type CardsGridContent = ShowcaseContent;

export type SectionContent = HeroContent | ShowcaseContent | Record<string, unknown>;

export interface CmsSection<T = SectionContent> {
  id: string;
  page_id: string;
  stable_key: string;
  section_type: SectionType;
  internal_title: string;
  position: number;
  is_active: boolean;
  status: PublicationStatus;
  draft_content: T;
  published_content: T | null;
  published_at?: string | null;
  updated_at?: string;
}

export interface CmsPage {
  id: string;
  slug: string;
  title: string;
  is_active: boolean;
  sections?: CmsSection[];
  created_at?: string;
  updated_at?: string;
}

export interface UpdateDraftPayload<T = SectionContent> {
  draft_content: T;
  internal_title?: string;
}

export interface ReorderSectionItem {
  id: string;
  position: number;
}
