import { createClient } from "@/lib/supabase/server";

export interface AdminSession {
  id: string;
  email: string;
}

export async function requireAdminSession(): Promise<AdminSession> {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("UNAUTHORIZED");
  }

  // Valida se o usuário tem a permissão de administrador no app_metadata
  const userRole = user.app_metadata?.role;
  if (userRole !== "admin") {
    throw new Error("UNAUTHORIZED");
  }

  return {
    id: user.id,
    email: user.email || "",
  };
}
