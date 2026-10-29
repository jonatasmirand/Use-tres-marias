import { NextResponse } from "next/server";
import { requireAdminSession } from "@/services/auth-service";
import { listUsers, createOrInviteAdmin } from "@/services/user-service";
import { inviteAdminSchema } from "@/validations/user-schemas";
import { UserRole, UserStatus } from "@/types/user";

export async function GET(request: Request) {
  try {
    await requireAdminSession();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("busca") || searchParams.get("search") || undefined;
    const roleParam = searchParams.get("role") || searchParams.get("tipo");
    const statusParam = searchParams.get("status");
    const pageParam = parseInt(searchParams.get("page") || "1", 10);
    const perPageParam = parseInt(searchParams.get("perPage") || "20", 10);

    const role =
      roleParam === "admin" || roleParam === "customer" ? (roleParam as UserRole) : "all";
    const status =
      statusParam === "active" || statusParam === "blocked" ? (statusParam as UserStatus) : "all";

    const result = await listUsers({
      search,
      role,
      status,
      page: isNaN(pageParam) ? 1 : pageParam,
      perPage: isNaN(perPageParam) ? 20 : perPageParam,
    });

    return NextResponse.json({ success: true, data: result }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, error: "Acesso administrativo não autorizado." },
        { status: 401 }
      );
    }
    const message = error instanceof Error ? error.message : "Erro ao consultar usuários.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAdminSession();
    const body = await request.json();

    const validation = inviteAdminSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.issues[0]?.message || "Dados inválidos.",
        },
        { status: 400 }
      );
    }

    const result = await createOrInviteAdmin(
      {
        email: validation.data.email,
        name: validation.data.name,
        password: validation.data.password || undefined,
      },
      session.id
    );

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, error: "Acesso administrativo não autorizado." },
        { status: 401 }
      );
    }
    const message = error instanceof Error ? error.message : "Erro ao processar convite.";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

