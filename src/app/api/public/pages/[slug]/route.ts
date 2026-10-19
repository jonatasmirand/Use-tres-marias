import { NextResponse } from "next/server";
import { getPublicPageSections } from "@/services/cms-service";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const { slug } = await params;
    const sections = await getPublicPageSections(slug);

    return NextResponse.json({
      success: true,
      data: {
        slug,
        sections,
      },
    }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao carregar seções da página.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
