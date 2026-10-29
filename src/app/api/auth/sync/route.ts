import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncAuthenticatedUser } from "@/services/user-service";

/**
 * Endpoint de sincronização de contas autenticadas.
 * Chamado automaticamente no login, cadastro ou acesso à área do cliente/admin
 * para garantir que o painel administrativo reflita imediatamente as contas reais registradas.
 */
export async function POST(request: Request) {
  try {
    let payload: {
      id?: string;
      email?: string;
      name?: string;
      role?: "admin" | "customer";
      status?: "active" | "blocked";
      created_at?: string;
      last_sign_in_at?: string | null;
    } = {};

    try {
      payload = await request.json();
    } catch {
      payload = {};
    }

    const supabase = await createClient();
    const {
      data: { user: sessionUser },
    } = await supabase.auth.getUser();

    // Prioriza dados da sessão autenticada do Supabase para confiabilidade
    const id = sessionUser?.id || payload.id;
    const email = sessionUser?.email || payload.email;

    if (!id || !email) {
      return NextResponse.json(
        { success: false, error: "Identificação do usuário ausente." },
        { status: 400 }
      );
    }

    const role =
      sessionUser?.app_metadata?.role === "admin"
        ? "admin"
        : payload.role === "admin" && sessionUser?.app_metadata?.role === "admin"
        ? "admin"
        : "customer";

    const name =
      (sessionUser?.user_metadata?.full_name as string) ||
      (sessionUser?.user_metadata?.name as string) ||
      payload.name ||
      email.split("@")[0] ||
      "Cliente";

    const isBlocked = Boolean(sessionUser?.app_metadata?.is_blocked);

    const now = new Date().toISOString();
    const created_at = sessionUser?.created_at || payload.created_at || now;
    const last_sign_in_at =
      sessionUser?.last_sign_in_at || payload.last_sign_in_at || now;

    await syncAuthenticatedUser({
      id,
      email,
      name,
      role,
      status: isBlocked ? "blocked" : payload.status || "active",
      created_at,
      last_sign_in_at,
    });

    return NextResponse.json(
      {
        success: true,
        user: { id, email, name, role },
      },
      { status: 200 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro interno ao sincronizar conta.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

