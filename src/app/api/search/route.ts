import { NextRequest, NextResponse } from "next/server";
import { searchProducts } from "@/services/product-service";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";
    const limit = Number(searchParams.get("limit")) || 20;

    const products = await searchProducts(query, limit);

    return NextResponse.json({
      success: true,
      query,
      count: products.length,
      products,
    });
  } catch (error: any) {
    console.error("Erro na busca de produtos:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || String(error),
        products: [],
      },
      { status: 500 }
    );
  }
}
