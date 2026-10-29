import { NextResponse } from "next/server";
import { requireAdminSession } from "@/services/auth-service";
import { setUserBlockedStatus } from "@/services/user-service";
import { blockUserSchema } from "@/validations/user-schemas";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const session = await requireAdminSession();
    const { id } = await params;
    const body = await request.json();

    const validation = blockUserSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.issues[0]?.message || "Dados de bloqueio inválidos.",
        },
        { status: 400 }
      );
    }

    const result = await setUserBlockedStatus(
      id,
      validation.data.block,
      session.id,
      validation.data.reason
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, error: "Acesso administrativo não autorizado." },
        { status: 401 }
      );
    }
    const message = error instanceof Error ? error.message : "Erro ao alterar situação da conta.";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

