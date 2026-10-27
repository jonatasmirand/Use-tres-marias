import { NextResponse } from "next/server";
import { requireAdminSession } from "@/services/auth-service";
import { getAdminPageSections, reorderSections } from "@/services/cms-service";
import { validateReorderSectionsPayload } from "@/validations/cms-schemas";

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

    const validation = validateReorderSectionsPayload(body);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, errors: validation.errors, error: validation.errors[0] },
        { status: 400 }
      );
    }

    await reorderSections(validation.data!);
    return NextResponse.json({ success: true, message: "Ordem das seções atualizada com sucesso." }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, error: "Acesso administrativo não autorizado." }, { status: 401 });
    }
    const message = error instanceof Error ? error.message : "Erro ao reordenar seções.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

