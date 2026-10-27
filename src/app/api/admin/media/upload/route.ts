import { NextResponse } from "next/server";
import { requireAdminSession } from "@/services/auth-service";
import { uploadCmsMedia, MediaValidationError } from "@/services/media-service";

export async function POST(request: Request) {
  try {
    await requireAdminSession();

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "Nenhum arquivo de imagem foi enviado." },
        { status: 400 }
      );
    }

    const result = await uploadCmsMedia(file);
    return NextResponse.json(
      { success: true, data: result, message: "Upload concluído com sucesso." },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, error: "Acesso administrativo não autorizado." },
        { status: 401 }
      );
    }

    if (error instanceof MediaValidationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    console.error("[MediaUpload API] Erro inesperado:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { success: false, error: "Erro ao processar upload da imagem." },
      { status: 500 }
    );
  }
}

