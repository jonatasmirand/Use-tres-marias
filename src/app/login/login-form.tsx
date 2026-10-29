"use client";

import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createAuthClient } from "@/lib/supabase/auth-client";
import { sanitizeRedirectUrl } from "@/lib/auth-redirect";

function getAuthErrorMessage(code: string | undefined, message: string | undefined): string {
  if (code === "invalid_credentials" || code === "invalid_grant") {
    return "E-mail ou senha incorretos. Por favor, confira seus dados e tente novamente.";
  }
  if (code === "email_provider_disabled" || message?.toLowerCase().includes("email logins are disabled")) {
    return "O login por e-mail está desativado no painel do Supabase (Authentication > Providers > Email). Ative-o para permitir o acesso.";
  }
  if (code === "email_not_confirmed") {
    return "E-mail ainda não confirmado. Verifique a caixa de entrada da sua conta.";
  }
  if (code === "over_request_rate_limit") {
    return "Muitas tentativas em sequência. Por segurança, aguarde alguns minutos.";
  }
  return message || "Não foi possível validar o acesso. Verifique suas credenciais e tente novamente.";
}

export default function LoginForm() {
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const emailInputRef = useRef<HTMLInputElement>(null);
  const submissionInProgress = useRef(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submissionInProgress.current) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");
    setResetSent(false);

    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setErrorMessage("Informe seu e-mail cadastrado.");
      emailInputRef.current?.focus();
      return;
    }

    if (emailInputRef.current?.validity.typeMismatch || !normalizedEmail.includes("@")) {
      setErrorMessage("Informe um formato de e-mail válido.");
      emailInputRef.current?.focus();
      return;
    }

    if (!password) {
      setErrorMessage("Informe sua senha de acesso.");
      return;
    }

    submissionInProgress.current = true;
    setIsSubmitting(true);

    try {
      const supabase = createAuthClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) {
        setErrorMessage(getAuthErrorMessage(error.code, error.message));
        return;
      }

      if (!data.user || !data.session) {
        setErrorMessage(
          "O serviço de autenticação não confirmou a sessão. Tente novamente."
        );
        return;
      }

      // IDENTIFICAÇÃO DE INSTÂNCIA: Admin vs Cliente
      const userRole = data.user.app_metadata?.role;
      const isAdmin = userRole === "admin";

      if (isAdmin) {
        setSuccessMessage("Acesso administrativo confirmado. Entrando no painel...");
        const destination = sanitizeRedirectUrl(nextUrl, "/admin", true);
        setTimeout(() => {
          window.location.href = destination;
        }, 700);
      } else {
        const destination = sanitizeRedirectUrl(nextUrl, "/cliente", false);

        setSuccessMessage("Login realizado com sucesso! Redirecionando...");
        setTimeout(() => {
          window.location.href = destination;
        }, 700);
      }
    } catch {
      setErrorMessage(
        "Falha na comunicação com o servidor de autenticação. Verifique sua conexão e tente novamente."
      );
    } finally {
      submissionInProgress.current = false;
      setIsSubmitting(false);
    }
  }

  const handleForgotPassword = async () => {
    const cleanEmail = email.trim();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setErrorMessage("Digite seu e-mail no campo acima para receber as instruções de recuperação.");
      emailInputRef.current?.focus();
      return;
    }

    setIsResetting(true);
    setErrorMessage("");

    try {
      const supabase = createAuthClient();
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo: `${origin}/redefinir-senha`,
      });

      if (error) {
        setErrorMessage(error.message || "Erro ao solicitar recuperação de senha.");
      } else {
        setResetSent(true);
      }
    } catch {
      setErrorMessage("Não foi possível enviar o e-mail de recuperação.");
    } finally {
      setIsResetting(false);
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

      <div className="w-full max-w-[440px]">
        {/* Cabeçalho superior com link da marca */}
        <div className="mb-6 text-center">
          <Link
            aria-label="Use Três Marias - Página inicial"
            className="inline-block font-serif text-[28px] font-bold tracking-tight text-[#202522] transition hover:opacity-90"
            href="/"
          >
            use<span className="text-[#1f6b4f]">Três</span>Marias
          </Link>
        </div>

        {/* Card do formulário de login unificado */}
        <section
          aria-labelledby="login-title"
          className="rounded-2xl border border-[#e6e7e4] bg-white p-7 shadow-[0_8px_30px_rgb(32,37,34,0.04)] sm:p-9"
        >
          <header className="mb-6 text-center">
            {nextUrl.includes("checkout") ? (
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-[#d2e5db] bg-[#eaf3ee] px-3 py-1 text-[11px] font-semibold text-[#1f6b4f]">
                <span>🛍️ Finalização da Compra</span>
              </div>
            ) : null}

            <h1
              id="login-title"
              className="font-serif text-[24px] font-bold tracking-tight text-[#202522]"
            >
              Acessar Conta
            </h1>
            <p className="mt-1.5 text-xs leading-relaxed text-[#5f6863]">
              {nextUrl.includes("checkout")
                ? "Entre na sua conta para vincular o pedido com segurança."
                : "Acesse para acompanhar seus pedidos ou gerenciar a loja."}
            </p>
          </header>

          <form className="space-y-4" noValidate onSubmit={handleSubmit}>
            {/* Campo de E-mail */}
            <div>
              <label
                className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.06em] text-[#202522]"
                htmlFor="email"
              >
                E-mail
              </label>
              <input
                ref={emailInputRef}
                autoComplete="email"
                className="w-full rounded-xl border border-[#e6e7e4] bg-[#fafbf9] px-3.5 py-2.5 text-sm text-[#202522] placeholder-[#9ea7a2] transition focus:border-[#1f6b4f] focus:bg-white focus:ring-4 focus:ring-[#1f6b4f]/10 focus:outline-none disabled:bg-[#f0f2f0] disabled:text-[#9ea7a2]"
                disabled={isSubmitting}
                id="email"
                name="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="seuemail@exemplo.com"
                required
                type="email"
                value={email}
              />
            </div>

            {/* Campo de Senha com botão de visualização */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label
                  className="block text-xs font-semibold uppercase tracking-[0.06em] text-[#202522]"
                  htmlFor="password"
                >
                  Senha de Acesso
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={isResetting}
                  className="text-[11px] font-medium text-[#1f6b4f] hover:underline"
                >
                  {isResetting ? "Enviando..." : "Esqueceu a senha?"}
                </button>
              </div>

              <div className="relative">
                <input
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-[#e6e7e4] bg-[#fafbf9] px-3.5 py-2.5 pr-10 text-sm text-[#202522] placeholder-[#9ea7a2] transition focus:border-[#1f6b4f] focus:bg-white focus:ring-4 focus:ring-[#1f6b4f]/10 focus:outline-none disabled:bg-[#f0f2f0] disabled:text-[#9ea7a2]"
                  disabled={isSubmitting}
                  id="password"
                  name="password"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••••••"
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

            {/* Alerta de Link de Recuperação */}
            {resetSent && (
              <div className="rounded-xl border border-blue-200 bg-blue-50/90 p-3 text-xs text-blue-800">
                Instruções para redefinir sua senha foram enviadas para o seu e-mail, caso ele esteja cadastrado.
              </div>
            )}

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

            {/* Botão de Entrar */}
            <button
              aria-busy={isSubmitting}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1f6b4f] px-4 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-[#18563f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1f6b4f] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? (
                <>
                  <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Validando acesso...</span>
                </>
              ) : (
                <span>Entrar na Conta</span>
              )}
            </button>
          </form>

          {/* Link para quem não tem cadastro */}
          <div className="mt-6 border-t border-[#f0f2f0] pt-4 text-center">
            <p className="text-xs text-[#5f6863]">
              Ainda não tem conta de cliente?{" "}
              <Link
                href={`/cadastro${nextUrl ? `?next=${encodeURIComponent(nextUrl)}` : ""}`}
                className="font-bold text-[#1f6b4f] hover:underline"
              >
                Cadastre-se gratuitamente
              </Link>
            </p>
          </div>
        </section>

        {/* Link para retornar à loja */}
        <div className="mt-6 text-center">
          <Link
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#5f6863] transition hover:text-[#1f6b4f]"
            href="/"
          >
            <span>←</span>
            <span>Voltar para a vitrine Use Três Marias</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
