import { Suspense } from "react";
import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ContactSection from "@/components/institutional/ContactSection";
import { getContactSettings } from "@/services/contact-service";

export const metadata: Metadata = {
  title: "Contato & Atendimento | useTrêsMarias",
  description:
    "Fale com a equipe da Três Marias via WhatsApp, Instagram ou E-mail. Tire dúvidas sobre tamanhos, tecidos, pedidos, trocas e devoluções.",
};

async function ContatoContent() {
  const contact = await getContactSettings();

  return (
    <ContactSection
      whatsappNumber={contact.whatsapp_number}
      whatsappFormatted={contact.whatsapp_formatted}
      instagramHandle={contact.instagram_handle}
      emailAddress={contact.email_address}
      businessHours={contact.business_hours}
    />
  );
}

function ContactFallback() {
  return (
    <div className="w-full bg-[#fbf9f6] py-24 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="size-8 rounded-full border-2 border-[#1f6b4f] border-t-transparent animate-spin" />
        <span className="text-xs text-[#5f6863]">Carregando canais de atendimento...</span>
      </div>
    </div>
  );
}

export default function ContatoPage() {
  return (
    <>
      <Header />
      <main className="flex-1" aria-label="Canais de Atendimento e Contato">
        <Suspense fallback={<ContactFallback />}>
          <ContatoContent />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
