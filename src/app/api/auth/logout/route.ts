import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();

    return NextResponse.json({ success: true, message: "Sessão encerrada com sucesso." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao encerrar sessão.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
