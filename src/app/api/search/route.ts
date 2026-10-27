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
  } catch (error: unknown) {
    if (error && typeof error === "object" && "digest" in error) {
      throw error;
    }
    const message = error instanceof Error ? error.message : String(error);
    console.error("Erro na busca de produtos:", message);
    return NextResponse.json(
      {
        success: false,
        error: message,
        products: [],
      },
      { status: 500 }
    );
  }
}
