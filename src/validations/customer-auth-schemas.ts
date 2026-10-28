import { z } from "zod";

export const customerSignUpSchema = z
  .object({
    name: z
      .string({ message: "O nome completo é obrigatório." })
      .trim()
      .min(2, "O nome deve ter pelo menos 2 caracteres.")
      .max(120, "O nome deve ter no máximo 120 caracteres."),
    email: z
      .string({ message: "O e-mail é obrigatório." })
      .trim()
      .email("Informe um endereço de e-mail válido.")
      .toLowerCase(),
    password: z
      .string({ message: "A senha é obrigatória." })
      .min(6, "A senha deve conter no mínimo 6 caracteres.")
      .max(72, "A senha deve ter no máximo 72 caracteres."),
    confirmPassword: z
      .string({ message: "A confirmação de senha é obrigatória." })
      .min(6, "A confirmação deve conter no mínimo 6 caracteres."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem. Digite a mesma senha em ambos os campos.",
    path: ["confirmPassword"],
  });

export const customerLoginSchema = z.object({
  email: z
    .string({ message: "O e-mail é obrigatório." })
    .trim()
    .email("Informe um endereço de e-mail válido.")
    .toLowerCase(),
  password: z
    .string({ message: "A senha é obrigatória." })
    .min(1, "Informe sua senha de acesso."),
});

export type CustomerSignUpInput = z.infer<typeof customerSignUpSchema>;
export type CustomerLoginInput = z.infer<typeof customerLoginSchema>;
