import { z } from "zod";
import { ProductInput, MAX_PRODUCT_IMAGES } from "@/types/catalog";

export type ValidationResult<T> = { isValid: boolean; errors: string[]; data: T | null };

/** Esquema Zod robusto para validação e sanitização dos dados de entrada de produto */
export const productInputSchema = z.object({
  name: z.preprocess(
    (val) => (typeof val === "string" ? val.trim() : ""),
    z
      .string()
      .min(1, "O nome do produto é obrigatório.")
      .max(150, "O nome deve ter no máximo 150 caracteres.")
  ),
  price: z.preprocess((val) => {
    if (typeof val === "number") return val;
    if (typeof val === "string") {
      const parsed = Number(val.replace(",", "."));
      return Number.isFinite(parsed) ? parsed : NaN;
    }
    return NaN;
  }, z.number({ message: "Informe um preço válido maior que zero." }).positive("Informe um preço válido maior que zero.")),
  description: z.preprocess(
    (val) => (typeof val === "string" ? val.trim() : ""),
    z.string().default("")
  ),
  category_id: z.preprocess(
    (val) => (typeof val === "string" ? val.trim() : ""),
    z.string().min(1, "Selecione o tipo de roupa (categoria).")
  ),
  images: z.preprocess(
    (val) => (Array.isArray(val) ? val.filter((item) => typeof item === "string" && item.trim().length > 0) : []),
    z
      .array(z.string().trim())
      .min(1, "Adicione pelo menos uma foto.")
      .max(MAX_PRODUCT_IMAGES, `Máximo de ${MAX_PRODUCT_IMAGES} fotos por produto.`)
      .refine(
        (urls) => urls.every((url) => url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/")),
        { message: "Uma das fotos tem um endereço inválido." }
      )
      .transform((urls) => Array.from(new Set(urls)))
  ),
  sizes: z.preprocess(
    (val) => (Array.isArray(val) ? val.filter((item) => typeof item === "string" && item.trim().length > 0) : []),
    z
      .array(z.string().trim())
      .default([])
      .transform((sizes) => Array.from(new Set(sizes.map((s) => s.toUpperCase()))))
  ),
  is_new: z.preprocess((val) => val === true, z.boolean()).default(false),
  is_active: z.preprocess((val) => val !== false, z.boolean()).default(true),
});

export type ValidatedProductInput = z.infer<typeof productInputSchema>;

export function validateProductInput(data: unknown): ValidationResult<ProductInput> {
  if (!data || typeof data !== "object") {
    return { isValid: false, errors: ["Dados do produto inválidos."], data: null };
  }

  const result = productInputSchema.safeParse(data);
  if (!result.success) {
    const errorMessages = (result.error.issues || []).map((issue) => issue.message);
    return {
      isValid: false,
      errors: Array.from(new Set(errorMessages)),
      data: null,
    };
  }

  return {
    isValid: true,
    errors: [],
    data: {
      ...result.data,
      price: Math.round(result.data.price * 100) / 100,
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
