import type { Metadata } from "next";
import { connection } from "next/server";
import { getContactSettings } from "@/services/contact-service";
import ContactFormClient from "./contact-form-client";

export const instant = false;

export const metadata: Metadata = {
  title: "Canais de Contato & Atendimento | Use Três Marias Admin",
  description: "Gerencie o número de WhatsApp, e-mail, Instagram e horários de atendimento da loja.",
};

export default async function AdminContatoPage() {
  await connection();
  const initialSettings = await getContactSettings();

  return (
    <div className="mx-auto max-w-[1100px] space-y-6">
      {/* Topo da Página */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-[#e6e7e4] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">📞</span>
            <h1 className="font-serif text-2xl font-bold tracking-tight text-[#202522] md:text-3xl">
              Canais de Contato & Atendimento
            </h1>
          </div>
          <p className="text-xs text-[#5f6863] mt-1">
            Configure o número de WhatsApp oficial, telefone de exibição, e-mail e redes sociais exibidos na loja e na página de contato.
          </p>
        </div>
      </div>

      {/* Formulário Interativo com Pré-visualização */}
      <ContactFormClient initialSettings={initialSettings} />
    </div>
  );
}
