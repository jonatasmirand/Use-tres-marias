import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

type RouteContext = {
    params: Promise<{ id: string }>;
};

export async function GET(
    _request: Request,
    { params }: RouteContext
) {
    const { id } = await params;

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
        .eq("id", id)
        .eq("is_active", true)
        .maybeSingle();

    if (error) {
        console.error("Erro ao consultar categoria:", error.message);

        return NextResponse.json(
            { error: "Não foi possível consultar a categoria." },
            { status: 500 }
        );
    }

    if (!data) {
        return NextResponse.json(
            { error: "Categoria não encontrada." },
            { status: 404 }
        );
    }

    return NextResponse.json({ data }, { status: 200 });
}
