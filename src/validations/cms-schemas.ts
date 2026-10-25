import { z } from "zod";
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

export type ValidationResult<T> = { isValid: boolean; errors: string[]; data: T | null };

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
/*  Hero Schemas & Validação Zod                                              */
/* -------------------------------------------------------------------------- */

export const heroSlideSchema = z
  .object({
    id: z.preprocess((val) => (typeof val === "string" ? val.trim() : ""), z.string().default("")),
    image_url: z.preprocess(
      (val) => (typeof val === "string" ? val.trim() : ""),
      z.string().min(1, "A imagem do slide é obrigatória.")
    ),
    mobile_image_url: z.preprocess((val) => (typeof val === "string" ? val.trim() : ""), z.string().default("")),
    alt_text: z.preprocess((val) => (typeof val === "string" ? val.trim() : ""), z.string().default("")),
    image_fit: z.preprocess(
      (val) => (val === "contain" ? "contain" : "cover"),
      z.enum(["cover", "contain"])
    ).default("cover"),
    eyebrow: z.preprocess((val) => (typeof val === "string" ? val.trim() : ""), z.string().default("")),
    title: z.preprocess((val) => (typeof val === "string" ? val.trim() : ""), z.string().default("")),
    description: z.preprocess((val) => (typeof val === "string" ? val.trim() : ""), z.string().default("")),
    button_text: z.preprocess((val) => (typeof val === "string" ? val.trim() : ""), z.string().default("")),
    button_url: z.preprocess(
      (val) => (typeof val === "string" ? val.trim() : ""),
      z.string().default("").refine((url) => !url || url.startsWith("/") || url.startsWith("http"), {
        message: "O link do botão deve começar com '/' (interno) ou 'http' (externo).",
      })
    ),
  })
  .superRefine((slide, ctx) => {
    if (slide.button_text && !slide.button_url) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "O slide tem texto de botão, mas está sem link.",
      });
    }
  });

export const heroContentSchema = z.object({
  interval_seconds: z.preprocess(
    (val) => {
      const n = typeof val === "number" && Number.isFinite(val) ? Math.round(val) : 5;
      return Math.min(HERO_INTERVAL_MAX, Math.max(HERO_INTERVAL_MIN, n));
    },
    z.number().int().min(HERO_INTERVAL_MIN).max(HERO_INTERVAL_MAX).default(5)
  ),
  slides: z.preprocess(
    (val) => (Array.isArray(val) ? val.filter((s) => s && typeof s === "object") : []),
    z
      .array(heroSlideSchema)
      .min(1, "Adicione pelo menos um slide ao carrossel.")
      .max(HERO_MAX_SLIDES, `O carrossel aceita no máximo ${HERO_MAX_SLIDES} slides.`)
  ),
});

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

  const parsed = heroContentSchema.safeParse(data);
  if (!parsed.success) {
    const errorMessages = (parsed.error.issues || []).map((issue) => issue.message);
    return { isValid: false, errors: Array.from(new Set(errorMessages)), data: null };
  }

  return {
    isValid: true,
    errors: [],
    data: {
      interval_seconds: parsed.data.interval_seconds,
      slides: parsed.data.slides.map((s, idx) => ({
        ...s,
        alt_text: s.alt_text || s.title || `Slide ${idx + 1} – Três Marias`,
        mobile_image_url: s.mobile_image_url || "",
      })),
    },
  };
}

/* -------------------------------------------------------------------------- */
/*  Vitrines (Novidades / Conjuntos) Schemas & Validação Zod                  */
/* -------------------------------------------------------------------------- */

export const showcaseContentSchema = z.object({
  section_badge: z.preprocess((val) => (typeof val === "string" ? val.trim() : ""), z.string().default("")),
  section_headline: z.preprocess(
    (val) => (typeof val === "string" ? val.trim() : ""),
    z.string().min(1, "O título da vitrine é obrigatório.")
  ),
  section_subheadline: z.preprocess((val) => (typeof val === "string" ? val.trim() : ""), z.string().default("")),
  view_all_text: z.preprocess(
    (val) => (typeof val === "string" && val.trim() ? val.trim() : "Ver todos"),
    z.string().default("Ver todos")
  ),
  view_all_url: z.preprocess(
    (val) => {
      const s = typeof val === "string" ? val.trim().replace(/^\/#/, "/") : "";
      return s || "/novidades";
    },
    z.string().refine((url) => !url || url.startsWith("/") || url.startsWith("http"), {
      message: "O link 'ver todos' deve começar com '/' ou 'http'.",
    })
  ),
  max_items: z.preprocess(
    (val) => {
      const n = typeof val === "number" && Number.isFinite(val) ? Math.round(val) : 8;
      return Math.min(24, Math.max(1, n));
    },
    z.number().int().min(1).max(24).default(8)
  ),
});

export function normalizeShowcaseContent(raw: unknown, fallbackUrl = "/novidades"): ShowcaseContent {
  const obj = (raw && typeof raw === "object" ? raw : {}) as Partial<ShowcaseContent>;
  const max = typeof obj.max_items === "number" && Number.isFinite(obj.max_items) ? obj.max_items : 8;

  return {
    section_badge: str(obj.section_badge),
    section_headline: str(obj.section_headline),
    section_subheadline: str(obj.section_subheadline),
    view_all_text: str(obj.view_all_text) || "Ver todos",
    view_all_url: (str(obj.view_all_url) || fallbackUrl).replace(/^\/#/, "/"),
    max_items: Math.min(24, Math.max(1, Math.round(max))),
  };
}

export function validateShowcaseContent(data: unknown): ValidationResult<ShowcaseContent> {
  if (!data || typeof data !== "object") {
    return { isValid: false, errors: ["O conteúdo da vitrine é obrigatório."], data: null };
  }

  const parsed = showcaseContentSchema.safeParse(data);
  if (!parsed.success) {
    const errorMessages = (parsed.error.issues || []).map((issue) => issue.message);
    return { isValid: false, errors: Array.from(new Set(errorMessages)), data: null };
  }

  return { isValid: true, errors: [], data: parsed.data };
}

export const validateCardsGridContent = validateShowcaseContent;

