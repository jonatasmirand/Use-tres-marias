import { NextResponse } from "next/server";
import { requireAdminSession } from "@/services/auth-service";
import { getContactSettings, updateContactSettings } from "@/services/contact-service";
import { validateContactSettings } from "@/validations/contact-schemas";

export async function GET() {
  try {
    await requireAdminSession();
    const contact = await getContactSettings();

    return NextResponse.json({
      success: true,
      contact,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, error: "Acesso não autorizado. Sessão de administrador obrigatória." },
        { status: 401 }
      );
    }
    console.error("[API Admin Contact GET] Erro:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao obter canais de contato." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await requireAdminSession();

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Formato de requisição inválido. JSON esperado." },
        { status: 400 }
      );
    }

    const validation = validateContactSettings(body);
    if (!validation.isValid || !validation.data) {
      return NextResponse.json(
        {
          success: false,
          error: "Dados de contato inválidos.",
          details: validation.errors,
        },
        { status: 422 }
      );
    }

    const updated = await updateContactSettings(validation.data, session.id);

    return NextResponse.json(
      {
        success: true,
        contact: updated,
        message: "Canais de contato e número do WhatsApp atualizados com sucesso!",
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, error: "Acesso não autorizado. Sessão de administrador obrigatória." },
        { status: 401 }
      );
    }
    console.error("[API Admin Contact PUT] Erro:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erro ao atualizar informações de contato.",
      },
      { status: 500 }
    );
  }
}
