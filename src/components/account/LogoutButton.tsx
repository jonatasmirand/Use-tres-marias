"use client";

import { useState } from "react";
import { createAuthClient } from "@/lib/supabase/auth-client";

export default function LogoutButton({
  className = "",
  label = "Sair da conta",
}: {
  className?: string;
  label?: string;
}) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      const supabase = createAuthClient();
      await supabase.auth.signOut();

      // Chama rota de logout do servidor para garantir limpeza de cookies
      await fetch("/api/auth/logout", { method: "POST" });

      window.location.href = "/login";
    } catch {
      window.location.href = "/login";
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={
        className ||
        "inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#7a857f] hover:text-red-700 transition rounded-lg hover:bg-red-50"
      }
    >
      <span>🚪</span>
      <span>{isLoggingOut ? "Saindo..." : label}</span>
    </button>
  );
}
