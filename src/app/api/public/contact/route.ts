import { NextResponse } from "next/server";
import { getContactSettings } from "@/services/contact-service";

export async function GET() {
  try {
    const contact = await getContactSettings();
    return NextResponse.json({
      success: true,
      contact,
    });
  } catch (error) {
    console.error("[API Public Contact] Erro ao buscar canais de contato:", error);
    return NextResponse.json(
      { success: false, error: "Falha ao consultar canais de contato." },
      { status: 500 }
    );
  }
}
