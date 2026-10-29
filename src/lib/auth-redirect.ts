/**
 * Validador e higienizador centralizado de URLs de redirecionamento pós-autenticação.
 * Previne vulnerabilidades de Open Redirect, loops de redirecionamento e garante
 * a correta segregação de acesso por perfil (Administrador vs Cliente).
 */
export function sanitizeRedirectUrl(
  url: string | null | undefined,
  fallback: string,
  isAdmin?: boolean
): string {
  if (!url || typeof url !== "string") {
    return fallback;
  }

  const trimmed = url.trim();

  // 1. Exige caminho relativo iniciado estritamente com barra única (bloqueia //, /\, etc.)
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.startsWith("/\\")) {
    return fallback;
  }

  // 2. Previne injeção de esquemas (ex: javascript:, data:) ou contrabarras
  if (trimmed.includes(":") || trimmed.includes("\\")) {
    return fallback;
  }

  // 3. Previne loops para páginas de autenticação
  const cleanPath = trimmed.split("?")[0].toLowerCase();
  if (cleanPath === "/login" || cleanPath === "/cadastro") {
    return fallback;
  }

  // 4. Bloqueia rotas descontinuadas/extintas
  if (cleanPath === "/conta" || cleanPath.startsWith("/conta/")) {
    return fallback;
  }

  // 5. Segregação rigorosa por perfil (autorização no servidor):
  if (isAdmin) {
    // Administrador NUNCA deve ser redirecionado para rotas de cliente como destino
    if (cleanPath === "/cliente" || cleanPath.startsWith("/cliente/")) {
      return "/admin";
    }
  } else {
    // Cliente ou visitante comum NUNCA deve ser direcionado para o painel administrativo
    if (cleanPath === "/admin" || cleanPath.startsWith("/admin/") || cleanPath.startsWith("/api/admin")) {
      return "/cliente";
    }
  }

  return trimmed;
}

