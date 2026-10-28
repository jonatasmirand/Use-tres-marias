/**
 * Serviço de Gerenciamento das Informações de Contato e Atendimento
 * Projeto: Use Três Marias
 */

import { supabase as publicSupabase } from "@/lib/supabase/client";
import { createClient } from "@/lib/supabase/server";
import { ContactSettings, UpdateContactSettingsInput } from "@/types/contact";
import { validateContactSettings } from "@/validations/contact-schemas";

export const DEFAULT_CONTACT_SETTINGS: ContactSettings = {
  whatsapp_number: "5511999999999",
  whatsapp_formatted: "(11) 99999-9999",
  instagram_handle: "usetresmarias",
  email_address: "contato@usetresmarias.com.br",
  business_hours: "Segunda a Sexta: 09h às 18h | Sábado: 09h às 13h",
  whatsapp_group_url: "https://chat.whatsapp.com/invite/usetresmarias",
  address_summary: "São Paulo - SP • Atendimento Online para todo o Brasil",
  updated_at: "2026-10-27T12:00:00.000Z",
};

/** Fallback em memória para desenvolvimento e resiliência */
let memoryContactSettings: ContactSettings = { ...DEFAULT_CONTACT_SETTINGS };

/**
 * Consulta as configurações de contato públicas da loja
 */
export async function getContactSettings(): Promise<ContactSettings> {
  try {
    const supabase = publicSupabase;
    const { data, error } = await supabase
      .from("site_settings")
      .select("value, updated_at")
      .eq("key", "contact_info")
      .maybeSingle();

    if (!error && data && data.value && typeof data.value === "object") {
      const merged: ContactSettings = {
        ...DEFAULT_CONTACT_SETTINGS,
        ...(data.value as Partial<ContactSettings>),
        updated_at: data.updated_at || memoryContactSettings.updated_at,
      };
      memoryContactSettings = merged;
      return merged;
    }
  } catch {
    // Fallback gracioso em memória caso tabela ainda não tenha sido criada no Supabase
  }

  return memoryContactSettings;
}

/**
 * Atualiza as configurações de contato (Operação Administrativa)
 */
export async function updateContactSettings(
  input: UpdateContactSettingsInput,
  updatedByUserId?: string
): Promise<ContactSettings> {
  const validation = validateContactSettings(input);
  if (!validation.isValid || !validation.data) {
    throw new Error(validation.errors.join(", ") || "Dados de contato inválidos.");
  }

  const now = new Date().toISOString();
  const updatedSettings: ContactSettings = {
    ...memoryContactSettings,
    ...validation.data,
    updated_at: now,
    updated_by: updatedByUserId,
  };

  // Atualiza cache em memória imediatamente
  memoryContactSettings = updatedSettings;

  try {
    const supabase = await createClient();

    const { error } = await supabase
      .from("site_settings")
      .upsert({
        key: "contact_info",
        value: {
          whatsapp_number: updatedSettings.whatsapp_number,
          whatsapp_formatted: updatedSettings.whatsapp_formatted,
          instagram_handle: updatedSettings.instagram_handle,
          email_address: updatedSettings.email_address,
          business_hours: updatedSettings.business_hours,
          whatsapp_group_url: updatedSettings.whatsapp_group_url || null,
          address_summary: updatedSettings.address_summary || null,
        },
        updated_at: now,
        updated_by: updatedByUserId || null,
      });

    if (error) {
      console.warn("[ContactService] Erro ao sincronizar com Supabase site_settings (usando fallback em memória):", error.message);
    }
  } catch (err) {
    console.warn("[ContactService] Falha de conexão ao salvar site_settings:", err);
  }

  return updatedSettings;
}
