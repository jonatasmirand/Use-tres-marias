import { getContactSettings } from "@/services/contact-service";

/**
 * Retorna a URL base do site de forma dinâmica e resiliente:
 * 1. Se o host da requisição for um domínio remoto em produção (Vercel ou domínio próprio),
 *    utiliza https://{host} garantindo compatibilidade dinâmica com múltiplos domínios.
 * 2. Se estiver em localhost ou ambiente de desenvolvimento, utiliza a URL oficial
 *    configurada no Supabase (site_settings.contact_info.site_url), permitindo que links
 *    de WhatsApp e visualização apontem para o domínio real (ex: https://use-tres-marias.vercel.app).
 * 3. Fallbacks para NEXT_PUBLIC_SITE_URL ou https://use-tres-marias.vercel.app.
 */
export async function getDynamicSiteUrl(requestHost?: string | null): Promise<string> {
  const cleanHost = requestHost?.trim().toLowerCase() || "";
  const isLocal =
    !cleanHost ||
    cleanHost.startsWith("localhost") ||
    cleanHost.startsWith("127.0.0.1") ||
    cleanHost.startsWith("0.0.0.0");

  if (!isLocal) {
    const protocol = cleanHost.includes("localhost") ? "http" : "https";
    return `${protocol}://${cleanHost}`;
  }

  try {
    const contact = await getContactSettings();
    if (contact.site_url && contact.site_url.trim()) {
      return contact.site_url.trim().replace(/\/$/, "");
    }
  } catch {
    // Ignora erro no fallback
  }

  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.trim().replace(/\/$/, "");
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.trim().replace(/\/$/, "")}`;
  }

  return "https://use-tres-marias.vercel.app";
}

