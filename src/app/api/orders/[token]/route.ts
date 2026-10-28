import { NextResponse } from "next/server";
import { getPublicOrderTracking } from "@/services/order-service";

type RouteContext = {
  params: Promise<{ token: string }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const { token } = await params;

    if (!token || typeof token !== "string" || token.trim().length < 4) {
      return NextResponse.json(
        { success: false, error: "Identificador de acompanhamento inválido." },
        { status: 400 }
      );
    }

    const tracking = await getPublicOrderTracking(token);

    if (!tracking) {
      return NextResponse.json(
        { success: false, error: "Pedido não encontrado ou link expirado." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: tracking }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao consultar acompanhamento do pedido.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
