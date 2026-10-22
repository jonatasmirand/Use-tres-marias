import { ProductInput, MAX_PRODUCT_IMAGES } from "@/types/catalog";

type ValidationResult<T> = { isValid: boolean; errors: string[]; data: T | null };

function str(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function uniqueStrings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const out: string[] = [];
  for (const item of value) {
    const s = str(item);
    if (s && !out.includes(s)) out.push(s);
  }
  return out;
}

export function validateProductInput(data: unknown): ValidationResult<ProductInput> {
  if (!data || typeof data !== "object") {
    return { isValid: false, errors: ["Dados do produto inválidos."], data: null };
  }

  const raw = data as Record<string, unknown>;
  const errors: string[] = [];

  const name = str(raw.name);
  const description = str(raw.description);
  const category_id = str(raw.category_id);
  const price = typeof raw.price === "number" ? raw.price : Number(String(raw.price ?? "").replace(",", "."));
  const images = uniqueStrings(raw.images);
  const sizes = uniqueStrings(raw.sizes).map((s) => s.toUpperCase());

  if (!name) errors.push("O nome do produto é obrigatório.");
  if (name.length > 150) errors.push("O nome deve ter no máximo 150 caracteres.");
  if (!Number.isFinite(price) || price <= 0) errors.push("Informe um preço válido maior que zero.");
  if (!category_id) errors.push("Selecione o tipo de roupa (categoria).");
  if (images.length === 0) errors.push("Adicione pelo menos uma foto.");
  if (images.length > MAX_PRODUCT_IMAGES) errors.push(`Máximo de ${MAX_PRODUCT_IMAGES} fotos por produto.`);
  if (images.some((url) => !url.startsWith("http") && !url.startsWith("/"))) {
    errors.push("Uma das fotos tem um endereço inválido.");
  }

  if (errors.length > 0) {
    return { isValid: false, errors, data: null };
  }

  return {
    isValid: true,
    errors: [],
    data: {
      name,
      description,
      category_id,
      price: Math.round(price * 100) / 100,
      images,
      sizes,
      is_new: raw.is_new === true,
      is_active: raw.is_active !== false,
    },
  };
}

/** Gera um slug amigável para URL: "Vestido Midi Floral" → "vestido-midi-floral". */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
