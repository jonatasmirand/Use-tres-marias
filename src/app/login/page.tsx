import type { Metadata } from "next";
import LoginForm from "./login-form";

export const metadata: Metadata = {
  title: "Acesso Administrativo | Use Três Marias",
  description: "Acesso restrito exclusivamente para administradores da Use Três Marias.",
};

export default function LoginPage() {
  return <LoginForm />;
}
