import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { validateCreateOrderInput } from "@/validations/order-schemas";
import { createOrder } from "@/services/order-service";
import { getDynamicSiteUrl } from "@/lib/site-url";

export async function POST(request: Request) {
  try {
    // 1. Validação estrita de autenticação no servidor
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: "Você precisa estar conectado à sua conta para finalizar a compra.",
          requiresAuth: true,
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const validation = validateCreateOrderInput(body);
    if (!validation.isValid || !validation.data) {
      return NextResponse.json(
        { success: false, errors: validation.errors, error: validation.errors[0] },
        { status: 400 }
      );
    }

    // 2. REGRA DE SEGURANÇA FUNDAMENTAL:
    // O user_id e customer_email são extraídos exclusivamente da sessão autenticada do servidor,
    // sobrescrevendo qualquer valor que possa ter sido enviado maliciosamente no corpo da requisição.
    validation.data.user_id = user.id;
    validation.data.customer_email = user.email || null;

    if (!validation.data.customer_name) {
      const metaName =
        (user.user_metadata?.full_name as string) ||
        (user.user_metadata?.name as string) ||
        null;
      validation.data.customer_name = metaName;
    }

    const rawOrigin =
      request.headers.get("origin") ||
      request.headers.get("x-forwarded-host") ||
      new URL(request.url).origin;

    const origin = await getDynamicSiteUrl(rawOrigin);
    const result = await createOrder(validation.data, origin);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro interno ao processar pedido.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
