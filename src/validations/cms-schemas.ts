import {
  HeroContent,
  HeroSlide,
  LegacyHeroContent,
  ShowcaseContent,
  HERO_INTERVAL_MAX,
  HERO_INTERVAL_MIN,
  HERO_MAX_SLIDES,
  DEFAULT_HERO_CONTENT,
  DEFAULT_HERO_SLIDE,
} from "@/types/cms";

type ValidationResult<T> = { isValid: boolean; errors: string[]; data: T | null };

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isValidLink(url: string): boolean {
  return url === "" || url.startsWith("/") || url.startsWith("http");
}

function clampInterval(value: unknown): number {
  const n = typeof value === "number" && Number.isFinite(value) ? Math.round(value) : 5;
  return Math.min(HERO_INTERVAL_MAX, Math.max(HERO_INTERVAL_MIN, n));
}

/* -------------------------------------------------------------------------- */
/*  Hero (carrossel)                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Converte qualquer conteúdo de Hero salvo (formato novo ou antigo) para o
 * formato de carrossel. Nunca lança erro – usado na renderização.
 */
export function normalizeHeroContent(raw: unknown): HeroContent {
  if (!raw || typeof raw !== "object") {
    return DEFAULT_HERO_CONTENT;
  }

  const obj = raw as Partial<HeroContent> & Partial<LegacyHeroContent>;

  // Se tiver slides já no formato carrossel com pelo menos 1 slide
  if (Array.isArray(obj.slides) && obj.slides.length > 0) {
    return {
      interval_seconds: clampInterval(obj.interval_seconds),
      slides: obj.slides
        .filter((s): s is HeroSlide => !!s && typeof s === "object")
        .map((s, idx) => ({
          id: str(s.id) || `slide-${idx + 1}`,
          image_url: str(s.image_url) || DEFAULT_HERO_SLIDE.image_url,
          mobile_image_url: str(s.mobile_image_url),
          alt_text: str(s.alt_text) || DEFAULT_HERO_SLIDE.alt_text,
          image_fit: s.image_fit === "contain" ? "contain" : "cover",
          eyebrow: str(s.eyebrow) || DEFAULT_HERO_SLIDE.eyebrow,
          title: str(s.title) || DEFAULT_HERO_SLIDE.title,
          description: str(s.description) || DEFAULT_HERO_SLIDE.description,
          button_text: str(s.button_text) || DEFAULT_HERO_SLIDE.button_text,
          button_url: str(s.button_url) || DEFAULT_HERO_SLIDE.button_url,
        })),
    };
  }

  // Se for o formato antigo da tabela (ou sem slides cadastrados), retorna o slide padrão da nova coleção
  return DEFAULT_HERO_CONTENT;
}

export function validateHeroContent(data: unknown): ValidationResult<HeroContent> {
  if (!data || typeof data !== "object") {
    return { isValid: false, errors: ["O conteúdo do carrossel é obrigatório."], data: null };
  }

  const content = normalizeHeroContent(data);
  const errors: string[] = [];

  if (content.slides.length === 0) {
    errors.push("Adicione pelo menos um slide ao carrossel.");
  }

  if (content.slides.length > HERO_MAX_SLIDES) {
    errors.push(`O carrossel aceita no máximo ${HERO_MAX_SLIDES} slides.`);
  }

  content.slides.forEach((slide, idx) => {
    const n = idx + 1;
    if (!slide.image_url) {
      errors.push(`O slide ${n} precisa de uma imagem.`);
    }
    if (!isValidLink(slide.button_url || "")) {
      errors.push(`O link do botão do slide ${n} deve começar com '/' (interno) ou 'http' (externo).`);
    }
    if (slide.button_text && !slide.button_url) {
      errors.push(`O slide ${n} tem texto de botão, mas está sem link.`);
    }
  });

  if (errors.length > 0) {
    return { isValid: false, errors, data: null };
  }

  return {
    isValid: true,
    errors: [],
    data: {
      interval_seconds: content.interval_seconds,
      slides: content.slides.map((s, idx) => ({
        ...s,
        alt_text: s.alt_text || s.title || `Slide ${idx + 1} – Três Marias`,
        mobile_image_url: s.mobile_image_url || "",
      })),
    },
  };
}

/* -------------------------------------------------------------------------- */
/*  Vitrines (Novidades / Conjuntos)                                          */
/* -------------------------------------------------------------------------- */

export function normalizeShowcaseContent(raw: unknown, fallbackUrl = "/novidades"): ShowcaseContent {
  const obj = (raw && typeof raw === "object" ? raw : {}) as Partial<ShowcaseContent>;
  const max = typeof obj.max_items === "number" && Number.isFinite(obj.max_items) ? obj.max_items : 8;

  return {
    section_badge: str(obj.section_badge),
    section_headline: str(obj.section_headline),
    section_subheadline: str(obj.section_subheadline),
    view_all_text: str(obj.view_all_text) || "Ver todos",
    // Links antigos com âncora (/#vestidos) passam a apontar para a página da categoria
    view_all_url: (str(obj.view_all_url) || fallbackUrl).replace(/^\/#/, "/"),
    max_items: Math.min(24, Math.max(1, Math.round(max))),
  };
}

export function validateShowcaseContent(data: unknown): ValidationResult<ShowcaseContent> {
  if (!data || typeof data !== "object") {
    return { isValid: false, errors: ["O conteúdo da vitrine é obrigatório."], data: null };
  }

  const content = normalizeShowcaseContent(data);
  const errors: string[] = [];

  if (!content.section_headline) {
    errors.push("O título da vitrine é obrigatório.");
  }
  if (!isValidLink(content.view_all_url || "")) {
    errors.push("O link 'ver todos' deve começar com '/' ou 'http'.");
  }

  if (errors.length > 0) {
    return { isValid: false, errors, data: null };
  }

  return { isValid: true, errors: [], data: content };
}

export const validateCardsGridContent = validateShowcaseContent;
