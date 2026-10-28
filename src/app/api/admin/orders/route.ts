import { NextResponse } from "next/server";
import { requireAdminSession } from "@/services/auth-service";
import { getAdminOrders } from "@/services/order-service";
import { OrderStatus } from "@/types/order";

export async function GET(request: Request) {
  try {
    await requireAdminSession();

    const { searchParams } = new URL(request.url);
    const statusParam = searchParams.get("status") as OrderStatus | "all" | null;
    const filterParam = searchParams.get("filtro"); // "ativos" | "concluidos" | "todos"
    const search = searchParams.get("busca") || undefined;

    const orders = await getAdminOrders({
      status: statusParam || undefined,
      activeOnly: filterParam === "ativos",
      completedOnly: filterParam === "concluidos",
      search,
    });

    return NextResponse.json({ success: true, data: orders }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, error: "Acesso administrativo não autorizado." },
        { status: 401 }
      );
    }
    const message = error instanceof Error ? error.message : "Erro ao consultar pedidos.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
