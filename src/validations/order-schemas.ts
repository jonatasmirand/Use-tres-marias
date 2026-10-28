import { z } from "zod";
import { CreateOrderInput, OrderStatus } from "@/types/order";

export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const ORDER_STATUSES: [OrderStatus, ...OrderStatus[]] = [
  "pending",
  "in_progress",
  "on_the_way",
  "completed",
];

export type ValidationResult<T> = { isValid: boolean; errors: string[]; data: T | null };

export const createOrderItemSchema = z.object({
  product_id: z
    .string()
    .optional()
    .refine((val) => !val || UUID_REGEX.test(val), {
      message: "ID de produto deve ser um UUID válido.",
    }),
  name: z
    .string({ message: "O nome do produto é obrigatório." })
    .trim()
    .min(1, "O nome do item é obrigatório.")
    .max(200, "O nome do item deve ter no máximo 200 caracteres."),
  size: z
    .string()
    .trim()
    .default("Único")
    .transform((val) => (val ? val.toUpperCase() : "ÚNICO")),
  price: z
    .number({ message: "O preço unitário deve ser um número válido." })
    .positive("O preço unitário deve ser maior que zero."),
  quantity: z
    .number({ message: "A quantidade deve ser um número inteiro." })
    .int("A quantidade deve ser um número inteiro.")
    .min(1, "A quantidade mínima por item é 1.")
    .max(100, "A quantidade máxima por item é 100."),
  image_url: z
    .string()
    .optional()
    .refine(
      (val) =>
        !val ||
        val.startsWith("http://") ||
        val.startsWith("https://") ||
        val.startsWith("/"),
      { message: "A foto do item possui uma URL inválida." }
    ),
});

export const createOrderSchema = z.object({
  items: z
    .array(createOrderItemSchema, { message: "Os itens do pedido são obrigatórios." })
    .min(1, "A sacola deve conter pelo menos 1 item para fechar o pedido.")
    .max(50, "Máximo de 50 itens diferentes por pedido."),
  customer_name: z
    .string()
    .trim()
    .max(120, "O nome deve ter no máximo 120 caracteres.")
    .optional()
    .nullable(),
  customer_email: z
    .string()
    .trim()
    .email("Formato de e-mail inválido.")
    .optional()
    .nullable(),
  user_id: z
    .string()
    .refine((val) => !val || UUID_REGEX.test(val), {
      message: "ID de usuário deve ser um UUID válido.",
    })
    .optional()
    .nullable(),
  customer_phone: z
    .string()
    .trim()
    .max(30, "O telefone deve ter no máximo 30 caracteres.")
    .optional()
    .nullable(),
  customer_notes: z
    .string()
    .trim()
    .max(500, "As observações devem ter no máximo 500 caracteres.")
    .optional()
    .nullable(),
  frete: z
    .number()
    .min(0, "O frete não pode ser negativo.")
    .default(0),
  discount: z
    .number()
    .min(0, "O desconto não pode ser negativo.")
    .default(0),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES, {
    message: "Status inválido. Deve ser 'pending', 'in_progress', 'on_the_way' ou 'completed'.",
  }),
  notes: z
    .string()
    .trim()
    .max(300, "A nota interna deve ter no máximo 300 caracteres.")
    .optional()
    .nullable(),
});

export function validateCreateOrderInput(data: unknown): ValidationResult<CreateOrderInput> {
  if (!data || typeof data !== "object") {
    return { isValid: false, errors: ["Dados do pedido inválidos."], data: null };
  }

  const result = createOrderSchema.safeParse(data);
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
    data: result.data as unknown as CreateOrderInput,
  };
}

export function validateUpdateOrderStatusInput(
  data: unknown
): ValidationResult<z.infer<typeof updateOrderStatusSchema>> {
  if (!data || typeof data !== "object") {
    return { isValid: false, errors: ["Dados de status inválidos."], data: null };
  }

  const result = updateOrderStatusSchema.safeParse(data);
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
    data: result.data,
  };
}
