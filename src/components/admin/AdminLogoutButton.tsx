"use client";

import { useState } from "react";
import { createAuthClient } from "@/lib/supabase/auth-client";

interface AdminLogoutButtonProps {
  className?: string;
  showText?: boolean;
}

export default function AdminLogoutButton({
  className,
  showText = false,
}: AdminLogoutButtonProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      // 1. Encerra a sessão via Supabase no cliente
      const supabase = createAuthClient();
      await supabase.auth.signOut();

      // 2. Chama a rota de logout no servidor para limpar os cookies da sessão
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // Continua para o redirecionamento mesmo se houver erro
    } finally {
      // 3. Força navegação completa para /login limpando o cache da página
      window.location.href = "/login";
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={
        className ||
        "rounded-lg p-1.5 text-[#5f6863] transition hover:bg-red-50 hover:text-red-700 cursor-pointer disabled:opacity-50"
      }
      title="Encerrar sessão"
      aria-label="Encerrar sessão de administrador"
    >
      <div className="flex items-center gap-1.5">
        <svg
          className="size-4 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
        {showText && <span>{isLoggingOut ? "Saindo..." : "Sair"}</span>}
      </div>
    </button>
  );
}
