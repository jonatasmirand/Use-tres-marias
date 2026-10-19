import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function GET() {
    const { data, error } = await supabase
        .from("categories")
        .select(`
      id,
      name,
      slug,
      description,
      is_active,
      created_at,
      updated_at
    `)
        .eq("is_active", true)
        .order("name", { ascending: true });

    if (error) {
        console.error("Erro ao consultar categorias:", error.message);

        return NextResponse.json(
            { error: "Não foi possível consultar as categorias." },
            { status: 500 }
        );
    }

    return NextResponse.json({ data }, { status: 200 });
}