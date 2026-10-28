import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "./login-form";

export const metadata: Metadata = {
  title: "Entrar na Conta | Use Três Marias",
  description: "Acesse sua conta para acompanhar seus pedidos ou gerenciar a loja Use Três Marias.",
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#fafbf9]">
          <div className="size-8 animate-spin rounded-full border-2 border-[#1f6b4f] border-t-transparent" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
