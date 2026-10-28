import type { Metadata } from "next";
import { Suspense } from "react";
import CustomerSignUpForm from "./customer-signup-form";

export const metadata: Metadata = {
  title: "Criar Conta de Cliente | Use Três Marias",
  description: "Crie sua conta na Use Três Marias para acompanhar pedidos e comprar com facilidade.",
};

export default function CadastroPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#fafbf9]">
          <div className="size-8 animate-spin rounded-full border-2 border-[#1f6b4f] border-t-transparent" />
        </div>
      }
    >
      <CustomerSignUpForm />
    </Suspense>
  );
}
