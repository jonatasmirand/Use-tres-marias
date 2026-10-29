import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let adminClientInstance: SupabaseClient | null = null;

/**
 * Retorna o cliente administrativo do Supabase com privilégios de service_role.
 * Usado EXCLUSIVAMENTE no servidor em rotas protegidas por requireAdminSession().
 * NUNCA deve ser importado em componentes clientes ou exposto ao navegador.
 */
export function getSupabaseAdminClient(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  if (!adminClientInstance) {
    adminClientInstance = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return adminClientInstance;
}

