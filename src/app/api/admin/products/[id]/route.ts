import { NextResponse } from "next/server";
import { requireAdminSession } from "@/services/auth-service";
import { getProductById, updateProduct, deleteProduct } from "@/services/product-service";
import { validateProductInput } from "@/validations/product-schemas";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    await requireAdminSession();
    const { id } = await params;
    const product = await getProductById(id);

    if (!product) {
      return NextResponse.json({ success: false, error: "Produto não encontrado." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: product }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, error: "Acesso administrativo não autorizado." }, { status: 401 });
    }
    const message = error instanceof Error ? error.message : "Erro ao carregar produto.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteContext) {
  try {
    await requireAdminSession();
    const { id } = await params;
    const body = await request.json();

    const validation = validateProductInput(body);
    if (!validation.isValid) {
      return NextResponse.json({ success: false, errors: validation.errors }, { status: 400 });
    }

    const updated = await updateProduct(id, validation.data!);
    return NextResponse.json({ success: true, data: updated, message: "Produto atualizado com sucesso." }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, error: "Acesso administrativo não autorizado." }, { status: 401 });
    }
    const message = error instanceof Error ? error.message : "Erro ao atualizar produto.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  try {
    await requireAdminSession();
    const { id } = await params;
    await deleteProduct(id);

    return NextResponse.json({ success: true, message: "Produto excluído com sucesso." }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, error: "Acesso administrativo não autorizado." }, { status: 401 });
    }
    const message = error instanceof Error ? error.message : "Erro ao excluir produto.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
