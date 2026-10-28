import { NextResponse } from "next/server";
import { requireAdminSession } from "@/services/auth-service";
import { getAdminOrderById, updateOrderStatus } from "@/services/order-service";
import { validateUpdateOrderStatusInput } from "@/validations/order-schemas";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    await requireAdminSession();
    const { id } = await params;

    const order = await getAdminOrderById(id);
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Pedido não encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: order }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, error: "Acesso administrativo não autorizado." },
        { status: 401 }
      );
    }
    const message = error instanceof Error ? error.message : "Erro ao carregar pedido.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const session = await requireAdminSession();
    const { id } = await params;
    const body = await request.json();

    const validation = validateUpdateOrderStatusInput(body);
    if (!validation.isValid || !validation.data) {
      return NextResponse.json(
        { success: false, errors: validation.errors, error: validation.errors[0] },
        { status: 400 }
      );
    }

    const updated = await updateOrderStatus(
      id,
      validation.data.status,
      session.email,
      validation.data.notes || undefined
    );

    return NextResponse.json(
      { success: true, data: updated, message: "Status do pedido atualizado com sucesso." },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, error: "Acesso administrativo não autorizado." },
        { status: 401 }
      );
    }
    const message = error instanceof Error ? error.message : "Erro ao atualizar status do pedido.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
