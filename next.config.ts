import type { NextConfig } from "next";

const TRUSTED_SUPABASE_HOSTS = new Set([
  "offedwqruronmkhzkofn.supabase.co",
]);

const DEV_LOCAL_HOSTS = new Set(["localhost", "127.0.0.1"]);

/**
 * Valida a URL do Supabase, garantindo que em produção o protocolo seja estritamente HTTPS,
 * que pertença a um host explicitamente confiável e que a origem de WebSocket seja restrita a WSS seguro,
 * sem credenciais embutidas e sem vazar URLs ou segredos nas mensagens de erro.
 */
function validateSupabaseUrl(rawUrl: string | undefined, isProd: boolean) {
  const fallbackUrl = "https://offedwqruronmkhzkofn.supabase.co";
  const target = rawUrl?.trim() || fallbackUrl;

  let parsed: URL;
  try {
    parsed = new URL(target);
  } catch {
    if (isProd) {
      throw new Error("[next.config.ts] NEXT_PUBLIC_SUPABASE_URL contém uma URL inválida.");
    }
    parsed = new URL(fallbackUrl);
  }

  if (parsed.username || parsed.password) {
    throw new Error(
      "[next.config.ts] NEXT_PUBLIC_SUPABASE_URL não pode conter credenciais de autenticação."
    );
  }

  if (isProd) {
    if (parsed.protocol !== "https:") {
      throw new Error(
        "[next.config.ts] NEXT_PUBLIC_SUPABASE_URL deve obrigatoriamente utilizar protocolo HTTPS em produção."
      );
    }

    if (!TRUSTED_SUPABASE_HOSTS.has(parsed.hostname)) {
      throw new Error(
        "[next.config.ts] NEXT_PUBLIC_SUPABASE_URL configurada com hostname não autorizado para este projeto."
      );
    }
  } else {
    const isAllowedDevHost =
      TRUSTED_SUPABASE_HOSTS.has(parsed.hostname) || DEV_LOCAL_HOSTS.has(parsed.hostname);

    if (!isAllowedDevHost) {
      throw new Error(
        "[next.config.ts] NEXT_PUBLIC_SUPABASE_URL configurada com hostname não autorizado."
      );
    }
  }

  const origin = parsed.origin;
  const host = parsed.host;
  const hostname = parsed.hostname;
  const wsOrigin = isProd ? `wss://${host}` : `${parsed.protocol === "https:" ? "wss:" : "ws:"}//${host}`;

  return { origin, host, hostname, wsOrigin, protocol: parsed.protocol };
}

function getSecurityHeaders(isProd: boolean) {
  const supabaseConfig = validateSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL, isProd);

  // Diretivas CSP restritas às origens estritamente necessárias ao projeto:
  // - default-src: 'self' como barreira base
  // - script-src: 'self' e 'unsafe-inline' (scripts de hidratação/bootstrap do Next.js). 'unsafe-eval' apenas em desenvolvimento para HMR
  // - style-src: 'self', 'unsafe-inline' (Tailwind CSS v4 e tags de estilo inline) e https://fonts.googleapis.com (Google Fonts)
  // - font-src: 'self' (fontes auto-hospedadas do next/font), https://fonts.gstatic.com (binários woff2 do Google Fonts) e data:
  // - img-src: 'self', data:, blob: (previews locais), https://images.unsplash.com e bucket Supabase Storage estritamente validado
  // - connect-src: 'self', API Supabase e WebSockets seguros (wss://) do Supabase Realtime
  // - object-src: 'none' (bloqueia plugins, Flash e applets)
  // - base-uri: 'self' (bloqueia manipulação da tag <base>)
  // - form-action: 'self' (submissões restritas à mesma origem)
  // - frame-ancestors: 'none' (mitigação máxima contra clickjacking — a aplicação não utiliza iframes)
  // - upgrade-insecure-requests: forçado em produção HTTPS
  const cspDirectives = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    `img-src 'self' data: blob: https://images.unsplash.com ${supabaseConfig.origin}`,
    `connect-src 'self' ${supabaseConfig.origin} ${supabaseConfig.wsOrigin}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(isProd ? ["upgrade-insecure-requests"] : []),
  ];

  return [
    {
      key: "Content-Security-Policy",
      value: cspDirectives.join("; "),
    },
    {
      key: "X-Frame-Options",
      value: "DENY",
    },
    {
      key: "X-Content-Type-Options",
      value: "nosniff",
    },
    {
      key: "Referrer-Policy",
      value: "strict-origin-when-cross-origin",
    },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
    },
    {
      key: "Cross-Origin-Opener-Policy",
      value: "same-origin-allow-popups",
    },
    // HSTS ativado estritamente em produção HTTPS (max-age de 1 ano = 31536000s).
    // includeSubDomains e preload NÃO são ativados para evitar indisponibilidade em subdomínios não mapeados.
    ...(isProd
      ? [
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000",
          },
        ]
      : []),
  ];
}

const isBuildProd = process.env.NODE_ENV === "production";
const initialSupabaseConfig = validateSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL, isBuildProd);

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: initialSupabaseConfig.hostname,
      },
    ],
  },
  async headers() {
    const isProd = process.env.NODE_ENV === "production";
    return [
      {
        source: "/:path*",
        headers: getSecurityHeaders(isProd),
      },
    ];
  },
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
