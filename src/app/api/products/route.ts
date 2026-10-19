
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function GET() {
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
        .eq("is_active", true)
        .order("name", { ascending: true });

    if (error) {
        console.error("Erro ao consultar produtos:", error.message);

        return NextResponse.json(
            { error: "Não foi possível consultar os produtos." },
            { status: 500 }
        );
    }

    return NextResponse.json({ data }, { status: 200 });
}
