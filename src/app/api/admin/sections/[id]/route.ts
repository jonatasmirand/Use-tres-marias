import { NextResponse } from "next/server";
import { requireAdminSession } from "@/services/auth-service";
import { getSectionById, toggleSectionVisibility, updateSectionDraft } from "@/services/cms-service";
import { validateHeroContent, validateCardsGridContent } from "@/validations/cms-schemas";
import { UpdateDraftPayload } from "@/types/cms";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  _request: Request,
  { params }: RouteContext
) {
  try {
    await requireAdminSession();
    const { id } = await params;
    const section = await getSectionById(id);

    if (!section) {
      return NextResponse.json({ success: false, error: "Seção não encontrada." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: section }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, error: "Acesso administrativo não autorizado." }, { status: 401 });
    }
    const message = error instanceof Error ? error.message : "Erro ao carregar detalhes da seção.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: RouteContext
) {
  try {
    await requireAdminSession();
    const { id } = await params;
    const body = (await request.json()) as UpdateDraftPayload;

    const section = await getSectionById(id);
    if (!section) {
      return NextResponse.json({ success: false, error: "Seção não encontrada para atualização." }, { status: 404 });
    }

    // Se for do tipo Hero, valida os campos estritamente
    if (section.section_type === "hero") {
      const validation = validateHeroContent(body.draft_content);
      if (!validation.isValid) {
        return NextResponse.json({ success: false, errors: validation.errors }, { status: 400 });
      }
      body.draft_content = validation.data!;
    } else {
      const validation = validateCardsGridContent(body.draft_content);
      if (!validation.isValid) {
        return NextResponse.json({ success: false, errors: validation.errors }, { status: 400 });
      }
      body.draft_content = validation.data!;
    }

    const updated = await updateSectionDraft(id, body);
    return NextResponse.json({ success: true, data: updated, message: "Rascunho salvo com sucesso." }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, error: "Acesso administrativo não autorizado." }, { status: 401 });
    }
    const message = error instanceof Error ? error.message : "Erro ao salvar rascunho.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: RouteContext
) {
  try {
    await requireAdminSession();
    const { id } = await params;
    const body = await request.json();

    if (typeof body?.is_active !== "boolean") {
      return NextResponse.json({ success: false, error: "O campo 'is_active' deve ser booleano." }, { status: 400 });
    }

    const updated = await toggleSectionVisibility(id, body.is_active);
    return NextResponse.json({ success: true, data: updated, message: "Visibilidade atualizada." }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, error: "Acesso administrativo não autorizado." }, { status: 401 });
    }
    const message = error instanceof Error ? error.message : "Erro ao alterar visibilidade.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
