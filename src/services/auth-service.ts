import { createClient } from "../../lib/supabase/server";

export interface AdminSession {
  id: string;
  email: string;
}

/**
 * Validação centralizada de sessão e autorização administrativa no servidor.
 * Rejeita qualquer requisição que não possua sessão autenticada com cookies válidos.
 */
export async function requireAdminSession(): Promise<AdminSession> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("UNAUTHORIZED");
  }

  return {
    id: user.id,
    email: user.email || "",
  };
}
