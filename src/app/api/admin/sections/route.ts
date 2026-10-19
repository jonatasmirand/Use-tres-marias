import { NextResponse } from "next/server";
import { requireAdminSession } from "@/services/auth-service";
import { getAdminPageSections, reorderSections } from "@/services/cms-service";
import { ReorderSectionItem } from "@/types/cms";

export async function GET(request: Request) {
  try {
    await requireAdminSession();
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get("slug") || "home";

    const data = await getAdminPageSections(slug);
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, error: "Acesso administrativo não autorizado." }, { status: 401 });
    }
    const message = error instanceof Error ? error.message : "Erro ao carregar seções.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdminSession();
    const body = await request.json();

    if (!Array.isArray(body?.items)) {
      return NextResponse.json({ success: false, error: "Formato inválido. 'items' deve ser um array." }, { status: 400 });
    }

    await reorderSections(body.items as ReorderSectionItem[]);
    return NextResponse.json({ success: true, message: "Ordem das seções atualizada com sucesso." }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, error: "Acesso administrativo não autorizado." }, { status: 401 });
    }
    const message = error instanceof Error ? error.message : "Erro ao reordenar seções.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
