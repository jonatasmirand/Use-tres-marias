import type { Metadata } from "next";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CheckoutClient from "./checkout-client";

export const instant = false;

export const metadata: Metadata = {
  title: "Finalizar Compra | Use Três Marias",
  description: "Confirme seus dados e finalize seu pedido com segurança na Use Três Marias.",
};

export default async function CheckoutPage() {
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 1. Redirecionamento automático se não estiver autenticado
  if (!user) {
    redirect("/login?next=/checkout");
  }

  const initialCustomer = {
    userId: user.id,
    email: user.email || "",
    name:
      (user.user_metadata?.full_name as string) ||
      (user.user_metadata?.name as string) ||
      "",
  };

  return <CheckoutClient customer={initialCustomer} />;
}
