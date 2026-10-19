
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
        .from("products")
        .select(`
      id,
      name,
      slug,
      sku,
      description,
      price,
      stock_quantity,
      category_id,
      categories (
        id,
        name,
        slug
      )
    `)
        .eq("id", id)
        .eq("is_active", true)
        .maybeSingle();

    if (error) {
        console.error("Erro ao consultar produto:", error.message);

        return NextResponse.json(
            { error: "Não foi possível consultar o produto." },
            { status: 500 }
        );
    }

    if (!data) {
        return NextResponse.json(
            { error: "Produto não encontrado." },
            { status: 404 }
        );
    }

    return NextResponse.json({ data }, { status: 200 });
}
