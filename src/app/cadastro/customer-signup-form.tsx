"use client";

import { useState, useRef, FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createAuthClient } from "@/lib/supabase/auth-client";
import { customerSignUpSchema } from "@/validations/customer-auth-schemas";
import { sanitizeRedirectUrl } from "@/lib/auth-redirect";

function getSignUpErrorMessage(
  code: string | undefined,
  message: string | undefined
): string {
  const normalizedMsg = message?.toLowerCase() || "";
  const normalizedCode = code?.toLowerCase() || "";

  if (
    normalizedCode === "user_already_exists" ||
    normalizedMsg.includes("already registered") ||
    normalizedMsg.includes("already exists")
  ) {
    return "Este endereço de e-mail já está cadastrado. Você pode entrar diretamente na sua conta.";
  }

  if (
    normalizedCode === "signup_disabled" ||
    normalizedMsg.includes("signups not allowed")
  ) {
    return "O cadastro de novos clientes está desativado nas configurações do Supabase (Authentication > Sign In / Up).";
  }

  if (
    normalizedCode === "email_provider_disabled" ||
    normalizedMsg.includes("email logins are disabled")
  ) {
    return "O provedor de e-mail está desativado nas configurações do Supabase (Authentication > Providers > Email).";
  }

  if (normalizedCode === "weak_password") {
    return "A senha é muito fraca. Utilize pelo menos 6 caracteres combinando letras e números.";
  }

  if (
    normalizedCode === "over_email_send_rate_limit" ||
    normalizedCode === "over_request_rate_limit" ||
    normalizedMsg.includes("rate limit") ||
    normalizedMsg.includes("rate-limit")
  ) {
    return "Limite de envio de e-mails do Supabase atingido (cota gratuita de 3 envios/hora). Para permitir cadastros ilimitados sem confirmação por e-mail, desative a opção 'Confirm email' no painel do Supabase (Authentication > Providers > Email).";
  }

  return (
    message ||
    "Não foi possível concluir seu cadastro. Verifique os dados informados."
  );
}

export default function CustomerSignUpForm() {
  const searchParams = useSearchParams();

  const rawNextUrl = searchParams.get("next") || "";
  const nextUrl = sanitizeRedirectUrl(rawNextUrl, "/cliente", false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [requiresConfirmation, setRequiresConfirmation] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);

  const handleSignUp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");
    setRequiresConfirmation(false);

    const validation = customerSignUpSchema.safeParse({
      name,
      email,
      password,
      confirmPassword,
    });

    if (!validation.success) {
      setErrorMessage(
        validation.error.issues[0]?.message || "Dados inválidos."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Tenta cadastro direto no backend (evita rate-limit se houver service role key)
      const registerRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: validation.data.name,
          email: validation.data.email,
          password: validation.data.password,
          confirmPassword: validation.data.confirmPassword,
        }),
      });

      const registerData = await registerRes.json();

      if (registerRes.ok && registerData.success) {
        // Usuário criado com sucesso no servidor. Inicia sessão imediatamente:
        const supabase = createAuthClient();
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: validation.data.email,
          password: validation.data.password,
        });

        if (signInError) {
          setSuccessMessage("Conta criada com sucesso! Redirecionando para o login...");
          setTimeout(() => {
            window.location.href = `/login?next=${encodeURIComponent(nextUrl)}`;
          }, 1000);
          return;
        }

        setSuccessMessage("Conta criada com sucesso! Entrando...");
        window.location.href = nextUrl;
        return;
      }

      if (!registerData.useClientFallback) {
        setErrorMessage(registerData.error || "Não foi possível concluir seu cadastro.");
        return;
      }

      // 2. Fallback: Cadastro via cliente do Supabase
      const supabase = createAuthClient();

      // Não definir emailRedirectTo.
      // O Supabase utilizará a Site URL configurada
      // em Authentication > URL Configuration,
      // salvo se o template de confirmação definir outro destino.
      const { data, error } = await supabase.auth.signUp({
        email: validation.data.email,
        password: validation.data.password,
        options: {
          data: {
            full_name: validation.data.name,
          },
        },
      });

      if (error) {
        setErrorMessage(getSignUpErrorMessage(error.code, error.message));
        return;
      }

      if (data.user && !data.session) {
        // Confirmação de e-mail ativa no Supabase.
        setRequiresConfirmation(true);
        setSuccessMessage(
          "Conta criada com sucesso! Enviamos um link de confirmação para o seu e-mail. Por favor, verifique sua caixa de entrada para ativar o acesso."
        );
        return;
      }

      // Sessão já ativa automaticamente.
      setSuccessMessage("Conta criada com sucesso! Entrando...");

      window.location.href = nextUrl;
    } catch {
      setErrorMessage(
        "Erro de comunicação com o servidor. Tente novamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-[#fafbf9] px-4 py-12 text-[#202522]">
      {/* Detalhe de fundo suave */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute top-0 left-1/2 h-[480px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#eaf3ee]/70 blur-3xl" />
      </div>

      <div className="w-full max-w-[460px]">
        {/* Marca Três Marias */}
        <div className="mb-6 text-center">
          <Link
            href="/"
            className="inline-block font-serif text-[28px] font-bold tracking-tight text-[#202522] transition hover:opacity-90"
          >
            use<span className="text-[#1f6b4f]">Três</span>Marias
          </Link>
        </div>

        {/* Card do Formulário */}
        <section
          aria-labelledby="signup-title"
          className="rounded-2xl border border-[#e6e7e4] bg-white p-7 shadow-[0_8px_30px_rgb(32,37,34,0.04)] sm:p-9"
        >
          <header className="mb-6 text-center">
            {nextUrl.includes("checkout") ? (
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#d2e5db] bg-[#eaf3ee] px-3 py-1 text-[11px] font-semibold text-[#1f6b4f]">
                <span>🛍️ Criar conta para finalizar compra</span>
              </div>
            ) : null}

            <h1
              id="signup-title"
              className="font-serif text-[24px] font-bold tracking-tight text-[#202522]"
            >
              Criar Conta de Cliente
            </h1>

            <p className="mt-1.5 text-xs leading-relaxed text-[#5f6863]">
              Cadastre-se para acompanhar seus pedidos e comprar com rapidez e
              segurança.
            </p>
          </header>

          <form className="space-y-4" noValidate onSubmit={handleSignUp}>
            {/* Nome Completo */}
            <div>
              <label
                className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.06em] text-[#202522]"
                htmlFor="name"
              >
                Nome Completo
              </label>

              <input
                ref={nameRef}
                autoComplete="name"
                className="w-full rounded-xl border border-[#e6e7e4] bg-[#fafbf9] px-3.5 py-2.5 text-sm text-[#202522] placeholder-[#9ea7a2] transition focus:border-[#1f6b4f] focus:bg-white focus:ring-4 focus:ring-[#1f6b4f]/10 focus:outline-none disabled:bg-[#f0f2f0]"
                disabled={isSubmitting || requiresConfirmation}
                id="name"
                name="name"
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Maria Silva"
                required
                type="text"
                value={name}
              />
            </div>

            {/* E-mail */}
            <div>
              <label
                className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.06em] text-[#202522]"
                htmlFor="email"
              >
                E-mail
              </label>

              <input
                autoComplete="email"
                className="w-full rounded-xl border border-[#e6e7e4] bg-[#fafbf9] px-3.5 py-2.5 text-sm text-[#202522] placeholder-[#9ea7a2] transition focus:border-[#1f6b4f] focus:bg-white focus:ring-4 focus:ring-[#1f6b4f]/10 focus:outline-none disabled:bg-[#f0f2f0]"
                disabled={isSubmitting || requiresConfirmation}
                id="email"
                name="email"
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@exemplo.com"
                required
                type="email"
                value={email}
              />
            </div>

            {/* Senha */}
            <div>
              <label
                className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.06em] text-[#202522]"
                htmlFor="password"
              >
                Senha
              </label>

              <div className="relative">
                <input
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-[#e6e7e4] bg-[#fafbf9] px-3.5 py-2.5 pr-10 text-sm text-[#202522] placeholder-[#9ea7a2] transition focus:border-[#1f6b4f] focus:bg-white focus:ring-4 focus:ring-[#1f6b4f]/10 focus:outline-none disabled:bg-[#f0f2f0]"
                  disabled={isSubmitting || requiresConfirmation}
                  id="password"
                  name="password"
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                />

                <button
                  aria-label={showPassword ? "Ocultar senha" : "Ver senha"}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#7f8d85] transition hover:text-[#202522]"
                  onClick={() => setShowPassword((prev) => !prev)}
                  tabIndex={-1}
                  type="button"
                >
                  {showPassword ? (
                    <svg
                      aria-hidden="true"
                      className="size-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                      />
                    </svg>
                  ) : (
                    <svg
                      aria-hidden="true"
                      className="size-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Confirmar Senha */}
            <div>
              <label
                className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.06em] text-[#202522]"
                htmlFor="confirmPassword"
              >
                Confirmar Senha
              </label>

              <input
                autoComplete="new-password"
                className="w-full rounded-xl border border-[#e6e7e4] bg-[#fafbf9] px-3.5 py-2.5 text-sm text-[#202522] placeholder-[#9ea7a2] transition focus:border-[#1f6b4f] focus:bg-white focus:ring-4 focus:ring-[#1f6b4f]/10 focus:outline-none disabled:bg-[#f0f2f0]"
                disabled={isSubmitting || requiresConfirmation}
                id="confirmPassword"
                name="confirmPassword"
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita a senha escolhida"
                required
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
              />
            </div>

            {/* Mensagem de Erro */}
            {errorMessage && (
              <div
                aria-live="polite"
                className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50/80 p-3 text-xs text-red-800"
                role="alert"
              >
                <span className="shrink-0 text-red-600">⚠️</span>
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Mensagem de Sucesso */}
            {successMessage && (
              <div
                aria-live="polite"
                className="flex items-start gap-2.5 rounded-xl border border-[#d2e5db] bg-[#eaf3ee] p-3 text-xs text-[#1f6b4f]"
                role="status"
              >
                <span>✓</span>
                <span>{successMessage}</span>
              </div>
            )}

            {/* Botão de Cadastro */}
            {!requiresConfirmation && (
              <button
                aria-busy={isSubmitting}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1f6b4f] px-4 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-[#18563f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1f6b4f] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? (
                  <>
                    <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Criando sua conta...</span>
                  </>
                ) : (
                  <span>Criar Minha Conta</span>
                )}
              </button>
            )}

            {requiresConfirmation && (
              <Link
                href={`/login${nextUrl ? `?next=${encodeURIComponent(nextUrl)}` : ""}`}
                className="mt-2 flex w-full items-center justify-center rounded-xl bg-[#183428] px-4 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-[#10241b]"
              >
                Ir para o Login →
              </Link>
            )}
          </form>

          {/* Alternativa para quem já tem conta */}
          <div className="mt-6 border-t border-[#f0f2f0] pt-4 text-center">
            <p className="text-xs text-[#5f6863]">
              Já possui uma conta?{" "}
              <Link
                href={`/login${nextUrl ? `?next=${encodeURIComponent(nextUrl)}` : ""}`}
                className="font-bold text-[#1f6b4f] hover:underline"
              >
                Fazer login
              </Link>
            </p>
          </div>
        </section>

        {/* Retornar à loja */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#5f6863] transition hover:text-[#1f6b4f]"
          >
            <span>←</span>
            <span>Voltar para a vitrine Use Três Marias</span>
          </Link>
        </div>
      </div>
    </main>
  );
}