/**
 * Schemas de Validação Zod para Configurações de Contato
 * Projeto: Use Três Marias
 */

import { z } from "zod";
import { ContactSettings, UpdateContactSettingsInput } from "@/types/contact";

export interface ValidationResult<T> {
  isValid: boolean;
  errors: string[];
  data: T | null;
}

/** Limpa caracteres não numéricos e padroniza para formato internacional com DDI 55 caso necessário */
export function sanitizeWhatsAppNumber(input: string): string {
  const digitsOnly = input.replace(/\D/g, "");
  if (!digitsOnly) return "";

  // Se já tem DDI (começa com 55 e tem 12 ou 13 dígitos)
  if (digitsOnly.length === 12 || digitsOnly.length === 13) {
    return digitsOnly;
  }

  // Se tem 10 ou 11 dígitos (DDD + número brasileiro padrão)
  if (digitsOnly.length === 10 || digitsOnly.length === 11) {
    return `55${digitsOnly}`;
  }

  return digitsOnly;
}

/** Formata número de telefone brasileiro para exibição humana (ex: (11) 99999-9999) */
export function formatDisplayPhoneNumber(input: string): string {
  let digits = input.replace(/\D/g, "");
  // Remove 55 inicial se existir para exibição nacional limpa
  if (digits.startsWith("55") && (digits.length === 12 || digits.length === 13)) {
    digits = digits.slice(2);
  }

  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return input.trim();
}

export const contactSettingsSchema = z.object({
  whatsapp_number: z
    .string({ message: "O número de WhatsApp é obrigatório." })
    .trim()
    .min(10, "Informe o número com DDD (mínimo 10 dígitos).")
    .max(25, "O número informado é excessivamente longo.")
    .refine(
      (val) => {
        const digits = val.replace(/\D/g, "");
        return digits.length >= 10 && digits.length <= 15;
      },
      { message: "Número de WhatsApp inválido. Digite DDD + número (ex: 11 99999-9999)." }
    ),
  whatsapp_formatted: z
    .string()
    .trim()
    .max(35, "A formatação do WhatsApp deve ter no máximo 35 caracteres.")
    .optional(),
  instagram_handle: z
    .string()
    .trim()
    .max(60, "O Instagram deve ter no máximo 60 caracteres.")
    .optional()
    .default("usetresmarias"),
  email_address: z
    .string({ message: "O e-mail de atendimento é obrigatório." })
    .trim()
    .email("Informe um endereço de e-mail válido.")
    .max(120, "O e-mail deve ter no máximo 120 caracteres."),
  business_hours: z
    .string()
    .trim()
    .max(200, "O horário de atendimento deve ter no máximo 200 caracteres.")
    .optional()
    .default("Segunda a Sexta: 09h às 18h | Sábado: 09h às 13h"),
  whatsapp_group_url: z
    .string()
    .trim()
    .url("O link do grupo do WhatsApp deve ser uma URL válida (ex: https://chat.whatsapp.com/...).")
    .optional()
    .or(z.literal("")),
  address_summary: z
    .string()
    .trim()
    .max(250, "O endereço deve ter no máximo 250 caracteres.")
    .optional()
    .default("São Paulo - SP • Atendimento Online para todo o Brasil"),
});

export function validateContactSettings(data: unknown): ValidationResult<UpdateContactSettingsInput> {
  if (!data || typeof data !== "object") {
    return { isValid: false, errors: ["Dados de contato inválidos."], data: null };
  }

  const result = contactSettingsSchema.safeParse(data);
  if (!result.success) {
    const errorMessages = (result.error.issues || []).map((issue) => issue.message);
    return {
      isValid: false,
      errors: Array.from(new Set(errorMessages)),
      data: null,
    };
  }

  const validated = result.data;
  const sanitizedWhatsApp = sanitizeWhatsAppNumber(validated.whatsapp_number);
  const formattedWhatsApp =
    validated.whatsapp_formatted?.trim() || formatDisplayPhoneNumber(validated.whatsapp_number);

  const cleanData: ContactSettings = {
    whatsapp_number: sanitizedWhatsApp,
    whatsapp_formatted: formattedWhatsApp,
    instagram_handle: validated.instagram_handle?.replace(/^@/, "").trim() || "usetresmarias",
    email_address: validated.email_address.toLowerCase().trim(),
    business_hours:
      validated.business_hours || "Segunda a Sexta: 09h às 18h | Sábado: 09h às 13h",
    whatsapp_group_url: validated.whatsapp_group_url || undefined,
    address_summary: validated.address_summary || "São Paulo - SP • Atendimento Online para todo o Brasil",
  };

  return {
    isValid: true,
    errors: [],
    data: cleanData,
  };
}
