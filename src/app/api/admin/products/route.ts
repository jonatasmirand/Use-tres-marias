import { NextResponse } from "next/server";
import { requireAdminSession } from "@/services/auth-service";
import { getProducts, createProduct } from "@/services/product-service";
import { validateProductInput } from "@/validations/product-schemas";

export async function GET(request: Request) {
  try {
    await requireAdminSession();
    const { searchParams } = new URL(request.url);
    const categorySlug = searchParams.get("categoria") || undefined;
    const isNew = searchParams.get("novidade") === "true" ? true : undefined;

    const data = await getProducts({
      categorySlug,
      isNew,
      includeInactive: true,
    });

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, error: "Acesso administrativo não autorizado." }, { status: 401 });
    }
    const message = error instanceof Error ? error.message : "Erro ao consultar produtos.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminSession();
    const body = await request.json();

    const validation = validateProductInput(body);
    if (!validation.isValid) {
      return NextResponse.json({ success: false, errors: validation.errors }, { status: 400 });
    }

    const created = await createProduct(validation.data!);
    return NextResponse.json({ success: true, data: created, message: "Produto cadastrado com sucesso." }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, error: "Acesso administrativo não autorizado." }, { status: 401 });
    }
    const message = error instanceof Error ? error.message : "Erro ao cadastrar produto.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
