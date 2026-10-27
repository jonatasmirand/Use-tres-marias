import { createClient } from "@/lib/supabase/server";

export interface AdminSession {
  id: string;
  email: string;
}

/**
 * Obtém e valida a sessão administrativa no servidor de forma segura.
 * Retorna AdminSession se o usuário for válido e tiver app_metadata.role === 'admin'.
 * Retorna null se não autenticado ou não autorizado.
 */
export async function getAdminSession(): Promise<AdminSession | null> {
  try {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    // Valida se o usuário tem a permissão de administrador no app_metadata (protegido pelo Supabase)
    const userRole = user.app_metadata?.role;
    if (userRole !== "admin") {
      return null;
    }

    return {
      id: user.id,
      email: user.email || "",
    };
  } catch {
    return null;
  }
}

/**
 * Exige uma sessão administrativa válida. Lança erro "UNAUTHORIZED" caso contrário.
 * Usado em Route Handlers de APIs administrativas.
 */
export async function requireAdminSession(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}
