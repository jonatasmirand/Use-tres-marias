import { HeroContent, CardsGridContent, CardItem } from "@/types/cms";

export function validateHeroContent(data: unknown): { isValid: boolean; errors: string[]; data: HeroContent | null } {
  const errors: string[] = [];

  if (!data || typeof data !== "object") {
    return { isValid: false, errors: ["O conteúdo da seção Hero é obrigatório."], data: null };
  }

  const c = data as Partial<HeroContent>;

  if (!c.title || typeof c.title !== "string" || c.title.trim().length === 0) {
    errors.push("O título principal da seção Hero é obrigatório.");
  }

  if (!c.desktop_image_url || typeof c.desktop_image_url !== "string" || c.desktop_image_url.trim().length === 0) {
    errors.push("A imagem para desktop é obrigatória.");
  }

  if (c.button_url && typeof c.button_url === "string" && !c.button_url.startsWith("/") && !c.button_url.startsWith("http")) {
    errors.push("O link do botão deve começar com '/' (interno) ou 'http' (externo).");
  }

  const validAlignments = ["left", "center", "right"];
  if (c.content_alignment && !validAlignments.includes(c.content_alignment)) {
    errors.push("O alinhamento de conteúdo deve ser 'left', 'center' ou 'right'.");
  }

  const validImagePositions = ["background", "split-right", "split-left"];
  if (c.image_position && !validImagePositions.includes(c.image_position)) {
    errors.push("A posição da imagem deve ser 'background', 'split-right' ou 'split-left'.");
  }

  const opacity = typeof c.overlay_opacity === "number" ? c.overlay_opacity : 30;
  if (opacity < 0 || opacity > 100) {
    errors.push("A opacidade de sobreposição deve estar entre 0% e 100%.");
  }

  if (errors.length > 0) {
    return { isValid: false, errors, data: null };
  }

  const sanitized: HeroContent = {
    desktop_image_url: c.desktop_image_url?.trim() || "",
    mobile_image_url: c.mobile_image_url?.trim() || c.desktop_image_url?.trim() || "",
    alt_text: c.alt_text?.trim() || "Destaque Use Três Marias",
    title: c.title?.trim() || "",
    description: c.description?.trim() || "",
    button_text: c.button_text?.trim() || "Ver Coleção",
    button_url: c.button_url?.trim() || "/#novidades",
    content_alignment: (c.content_alignment as "left" | "center" | "right") || "left",
    image_position: (c.image_position as "background" | "split-right" | "split-left") || "background",
    overlay_opacity: opacity,
  };

  return { isValid: true, errors: [], data: sanitized };
}

export function validateCardsGridContent(data: unknown): { isValid: boolean; errors: string[]; data: CardsGridContent | null } {
  if (!data || typeof data !== "object") {
    return { isValid: false, errors: ["O conteúdo da seção de cards é obrigatório."], data: null };
  }

  const c = data as Partial<CardsGridContent>;
  const errors: string[] = [];

  if (!c.section_headline || typeof c.section_headline !== "string" || c.section_headline.trim().length === 0) {
    errors.push("O título da seção é obrigatório.");
  }

  if (!Array.isArray(c.cards) || c.cards.length !== 3) {
    errors.push("A seção deve conter exatamente três cards de imagens configuráveis.");
    return { isValid: false, errors, data: null };
  }

  const sanitizedCards = c.cards.map((card, idx) => {
    const item = card as Partial<CardItem>;
    if (!item.title || typeof item.title !== "string" || item.title.trim().length === 0) {
      errors.push(`O título do card ${idx + 1} é obrigatório.`);
    }
    if (!item.image_url || typeof item.image_url !== "string" || item.image_url.trim().length === 0) {
      errors.push(`A imagem do card ${idx + 1} é obrigatória.`);
    }

    return {
      id: item.id || `card-${idx + 1}`,
      image_url: item.image_url?.trim() || "",
      alt_text: item.alt_text?.trim() || item.title?.trim() || `Peça ${idx + 1}`,
      title: item.title?.trim() || `Peça ${idx + 1}`,
      description: item.description?.trim() || "",
      button_text: item.button_text?.trim() || "Ver Detalhes",
      button_url: item.button_url?.trim() || "/#novidades",
      badge: item.badge?.trim() || "",
      is_visible: typeof item.is_visible === "boolean" ? item.is_visible : true,
      position: (idx + 1) as 1 | 2 | 3,
    };
  }) as [CardItem, CardItem, CardItem];

  if (errors.length > 0) {
    return { isValid: false, errors, data: null };
  }

  return {
    isValid: true,
    errors: [],
    data: {
      section_badge: c.section_badge?.trim() || "",
      section_headline: c.section_headline?.trim() || "",
      section_subheadline: c.section_subheadline?.trim() || "",
      view_all_text: c.view_all_text?.trim() || "Ver Toda a Coleção",
      view_all_url: c.view_all_url?.trim() || "/#novidades",
      cards: sanitizedCards,
    },
  };
}

export const validateNovidadesContent = validateCardsGridContent;
