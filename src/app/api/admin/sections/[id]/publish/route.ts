import { NextResponse } from "next/server";
import { requireAdminSession } from "@/services/auth-service";
import { publishSection } from "@/services/cms-service";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(
  _request: Request,
  { params }: RouteContext
) {
  try {
    await requireAdminSession();
    const { id } = await params;

    const published = await publishSection(id);
    return NextResponse.json({
      success: true,
      data: published,
      message: "Seção publicada com sucesso na loja pública!",
    }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, error: "Acesso administrativo não autorizado." }, { status: 401 });
    }
    const message = error instanceof Error ? error.message : "Não foi possível publicar a seção.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
