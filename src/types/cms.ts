export type SectionType =
  | 'hero'
  | 'novidades'
  | 'cards_grid'
  | 'vestidos'
  | 'blusas'
  | 'bermudas'
  | 'conjuntos'
  | 'banner'
  | 'vitrine';

export type PublicationStatus = 'draft' | 'published' | 'archived';

export interface HeroContent {
  desktop_image_url: string;
  mobile_image_url: string;
  alt_text: string;
  title: string;
  description: string;
  button_text: string;
  button_url: string;
  content_alignment: 'left' | 'center' | 'right';
  image_position: 'background' | 'split-right' | 'split-left';
  overlay_opacity: number; // 0 a 100
}

export interface CardItem {
  id: string;
  image_url: string;
  alt_text: string;
  title: string;
  description: string;
  button_text: string;
  button_url: string;
  badge?: string;
  is_visible: boolean;
  position: 1 | 2 | 3;
}

export interface CardsGridContent {
  section_badge?: string;
  section_headline: string;
  section_subheadline?: string;
  view_all_text?: string;
  view_all_url?: string;
  cards: [CardItem, CardItem, CardItem];
}

export type NovidadesCard = CardItem;
export type NovidadesContent = CardsGridContent;

export type SectionContent = HeroContent | CardsGridContent | Record<string, unknown>;

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
