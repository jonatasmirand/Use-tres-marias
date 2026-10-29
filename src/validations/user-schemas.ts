import { z } from "zod";

export const blockUserSchema = z.object({
  block: z.boolean(),
  reason: z.string().max(255, "O motivo deve ter no máximo 255 caracteres.").optional(),
});

export const inviteAdminSchema = z.object({
  email: z.string().trim().email("Informe um endereço de e-mail válido."),
  name: z.string().trim().min(2, "O nome deve ter pelo menos 2 caracteres.").max(100).optional(),
  password: z
    .string()
    .min(6, "A senha temporária deve ter pelo menos 6 caracteres.")
    .max(100)
    .optional()
    .or(z.literal("")),
});

