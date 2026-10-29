import { getContactSettings } from "@/services/contact-service";

/**
 * Normaliza e sanitiza qualquer URL ou host, garantindo formato https://dominio sem duplicidades de protocolo ou barras finais.
 */
export function normalizeSiteUrl(input?: string | null): string {
  if (!input) return "";
  let clean = input.trim();

  // Se já tiver protocolo duplicado por engano (ex: https://https:// ou https://http://), corrige
  clean = clean.replace(/^(https?:\/\/)+(https?:\/\/)+/, "$2");

  // Se não começar com http:// ou https://, adiciona o protocolo apropriado
  if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
    const isLocal =
      clean.includes("localhost") ||
      clean.includes("127.0.0.1") ||
      clean.includes("0.0.0.0");
    const protocol = isLocal ? "http" : "https";
    clean = `${protocol}://${clean}`;
  }

  // Remove barras no final
  return clean.replace(/\/+$/, "");
}

/**
 * Retorna a URL base do site de forma dinâmica e resiliente:
 * 1. Se o host/origem da requisição for um domínio remoto em produção (Vercel ou domínio próprio),
 *    retorna a URL normalizada garantindo compatibilidade com múltiplos domínios.
 * 2. Se for localhost ou estiver vazio, utiliza a URL oficial configurada no Supabase
 *    (site_settings.contact_info.site_url), permitindo que links de WhatsApp e visualização
 *    apontem para o domínio real (ex: https://use-tres-marias.vercel.app).
 * 3. Fallbacks para NEXT_PUBLIC_SITE_URL ou https://use-tres-marias.vercel.app.
 */
export async function getDynamicSiteUrl(requestHostOrOrigin?: string | null): Promise<string> {
  const rawInput = requestHostOrOrigin?.trim().toLowerCase() || "";

  // Extrai o host puro (sem protocolo, caminhos ou portas) para testar se é local
  const hostWithoutProtocol = rawInput
    .replace(/^https?:\/\//, "")
    .split("/")[0]
    .split(":")[0];

  const isLocal =
    !hostWithoutProtocol ||
    hostWithoutProtocol === "localhost" ||
    hostWithoutProtocol === "127.0.0.1" ||
    hostWithoutProtocol === "0.0.0.0";

  // Se a requisição vem de um domínio remoto (produção na Vercel ou domínio personalizado),
  // utiliza diretamente a URL normalizada da requisição
  if (!isLocal) {
    return normalizeSiteUrl(rawInput);
  }

  // Se estiver em ambiente local (desenvolvimento), consulta a URL oficial configurada no Supabase
  try {
    const contact = await getContactSettings();
    if (contact.site_url && contact.site_url.trim()) {
      return normalizeSiteUrl(contact.site_url);
    }
  } catch {
    // Ignora erro e continua para os fallbacks
  }

  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return normalizeSiteUrl(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);
  }

  return "https://use-tres-marias.vercel.app";
}
