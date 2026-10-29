/**
 * Tipos e Interfaces para Configurações de Contato e Atendimento
 * Projeto: Use Três Marias
 */

export interface ContactSettings {
  whatsapp_number: string;
  whatsapp_formatted: string;
  instagram_handle: string;
  email_address: string;
  business_hours: string;
  whatsapp_group_url?: string;
  address_summary?: string;
  site_url?: string;
  updated_at?: string;
  updated_by?: string;
}

export type UpdateContactSettingsInput = Partial<Omit<ContactSettings, "updated_at" | "updated_by">>;

export interface ContactApiResponse {
  success: boolean;
  contact: ContactSettings;
  message?: string;
}
