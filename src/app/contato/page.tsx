import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ContactSection from "@/components/institutional/ContactSection";

export const metadata: Metadata = {
  title: "Contato & Atendimento | useTrêsMarias",
  description:
    "Fale com a equipe da Três Marias via WhatsApp, Instagram ou E-mail. Tire dúvidas sobre tamanhos, tecidos, pedidos, trocas e devoluções.",
};

export default function ContatoPage() {
  return (
    <>
      <Header />
      <main className="flex-1" aria-label="Canais de Atendimento e Contato">
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
