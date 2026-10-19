"use client";

import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createAuthClient } from "@/lib/supabase/auth-client";

function getAuthErrorMessage(code: string | undefined) {
  switch (code) {
    case "invalid_credentials":
      return "Credenciais inválidas. Verifique o e-mail administrativo e a senha.";
    case "email_not_confirmed":
      return "E-mail não confirmado. Verifique a caixa de entrada da sua conta.";
    case "over_request_rate_limit":
      return "Muitas tentativas em sequência. Aguarde alguns minutos por segurança.";
    default:
      return "Não foi possível validar o acesso. Verifique suas credenciais administrativas e tente novamente.";
  }
}

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const submissionInProgress = useRef(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submissionInProgress.current) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setErrorMessage("Informe o e-mail de administrador.");
      emailInputRef.current?.focus();
      return;
    }

    if (emailInputRef.current?.validity.typeMismatch) {
      setErrorMessage("Informe um formato de e-mail válido.");
      emailInputRef.current.focus();
      return;
    }

    if (!password) {
      setErrorMessage("Informe a senha de acesso.");
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
        setErrorMessage(getAuthErrorMessage(error.code));
        return;
      }

      if (!data.user || !data.session) {
        setErrorMessage(
          "O serviço de autenticação não confirmou a sessão. Tente novamente."
        );
        return;
      }

      setPassword("");
      setSuccessMessage("Autenticação realizada com sucesso. Redirecionando para o painel...");

      setTimeout(() => {
        router.push("/admin");
        router.refresh();
      }, 900);
    } catch {
      setErrorMessage(
        "Falha na comunicação com o servidor de autenticação. Verifique sua conexão e tente novamente."
      );
    } finally {
      submissionInProgress.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-[#fafbf9] px-4 py-12 text-[#202522]">
      {/* Detalhe de fundo suave com as cores da marca */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute top-0 left-1/2 h-[420px] w-[680px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#eaf3ee]/60 blur-3xl" />
      </div>

      <div className="w-full max-w-[440px]">
        {/* Cabeçalho superior com link da marca */}
        <div className="mb-6 text-center">
          <Link
            aria-label="Use Três Marias - Página inicial"
            className="inline-block font-serif text-[28px] font-bold tracking-[-0.04em] text-[#202522] transition hover:opacity-90 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1f6b4f]"
            href="/"
          >
            use<span className="text-[#1f6b4f]">Três</span>Marias
          </Link>
        </div>

        {/* Card do formulário de login */}
        <section
          aria-labelledby="login-title"
          className="rounded-2xl border border-[#e6e7e4] bg-white p-7 shadow-[0_8px_30px_rgb(32,37,34,0.04)] sm:p-9"
        >
          <header className="mb-7 text-center">
            {/* Badge de Acesso Restrito para Admins */}
            <div className="mb-3.5 inline-flex items-center gap-1.5 rounded-full border border-[#d2e5db] bg-[#eaf3ee] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#1f6b4f]">
              <svg
                aria-hidden="true"
                className="size-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <span>Acesso Administrativo</span>
            </div>

            <h1
              id="login-title"
              className="font-serif text-[24px] font-bold tracking-tight text-[#202522]"
            >
              Entrar no Painel
            </h1>
            <p className="mt-1.5 text-xs leading-relaxed text-[#5f6863]">
              Área restrita exclusivamente a administradores autorizados.
            </p>
          </header>

          <form className="space-y-4" noValidate onSubmit={handleSubmit}>
            {/* Campo de E-mail */}
            <div>
              <label
                className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.06em] text-[#202522]"
                htmlFor="email"
              >
                E-mail Administrativo
              </label>
              <input
                ref={emailInputRef}
                autoComplete="email"
                className="w-full rounded-xl border border-[#e6e7e4] bg-[#fafbf9] px-3.5 py-2.5 text-sm text-[#202522] placeholder-[#9ea7a2] transition focus:border-[#1f6b4f] focus:bg-white focus:ring-4 focus:ring-[#1f6b4f]/10 focus:outline-none disabled:bg-[#f0f2f0] disabled:text-[#9ea7a2]"
                disabled={isSubmitting}
                id="email"
                name="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@usetresmarias.com.br"
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

            {/* Mensagem de Erro */}
            {errorMessage && (
              <div
                aria-live="polite"
                className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50/80 p-3 text-xs text-red-800"
                role="alert"
              >
                <svg
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
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
                <svg
                  aria-hidden="true"
                  className="mt-0.5 size-4 shrink-0 text-[#1f6b4f]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span>{successMessage}</span>
              </div>
            )}

            {/* Botão de Entrar */}
            <button
              aria-busy={isSubmitting}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1f6b4f] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#18563f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1f6b4f] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? (
                <>
                  <svg
                    aria-hidden="true"
                    className="size-4 animate-spin text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      fill="currentColor"
                    />
                  </svg>
                  <span>Autenticando...</span>
                </>
              ) : (
                <span>Acessar Painel</span>
              )}
            </button>
          </form>

          {/* Aviso de segurança e aviso de acesso apenas para administradores */}
          <div className="mt-6 border-t border-[#f0f2f0] pt-4 text-center">
            <p className="text-[11px] leading-relaxed text-[#7f8d85]">
              🔒 Ambiente seguro monitorado. Somente administradores autorizados têm permissão para entrar.
            </p>
          </div>
        </section>

        {/* Link para retornar à loja */}
        <div className="mt-6 text-center">
          <Link
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#5f6863] transition hover:text-[#1f6b4f] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1f6b4f]"
            href="/"
          >
            <span aria-hidden="true">←</span>
            <span>Voltar para a loja Use Três Marias</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
