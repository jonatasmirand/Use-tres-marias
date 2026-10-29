import { NextResponse } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { customerSignUpSchema } from "@/validations/customer-auth-schemas";

/**
 * Rota de cadastro de clientes protegida no servidor.
 * Quando SUPABASE_SERVICE_ROLE_KEY estiver disponível no servidor, cria a conta
 * com email_confirm: true para evitar o envio de e-mails com limite restrito (3/hora)
 * da infraestrutura padrão do Supabase.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = customerSignUpSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.error.issues[0]?.message || "Dados de cadastro inválidos.",
        },
        { status: 400 }
      );
    }

    const { name, email, password } = validation.data;
    const adminClient = getSupabaseAdminClient();

    // Se o servidor não tiver service role key configurada,
    // instrui o cliente a utilizar o fluxo nativo supabase.auth.signUp()
    if (!adminClient) {
      return NextResponse.json(
        { success: false, useClientFallback: true },
        { status: 200 }
      );
    }

    // Cria o usuário com confirmação de e-mail imediata (sem consumir cota SMTP de rate-limit)
    const { data, error } = await adminClient.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password,
      email_confirm: true,
      user_metadata: {
        full_name: name.trim(),
      },
      app_metadata: {
        role: "customer",
      },
    });

    if (error) {
      const msg = error.message?.toLowerCase() || "";
      if (
        error.code === "user_already_exists" ||
        msg.includes("already registered") ||
        msg.includes("already exists")
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Este endereço de e-mail já está cadastrado. Você pode entrar diretamente na sua conta.",
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { success: false, error: error.message || "Erro ao criar conta." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          id: data.user.id,
          email: data.user.email,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro interno no servidor.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

