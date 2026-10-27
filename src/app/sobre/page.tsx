import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import NewsletterSection from "@/components/sections/NewsletterSection";
import AboutStorySection from "@/components/institutional/AboutStorySection";

export const metadata: Metadata = {
  title: "Sobre Nós | useTrêsMarias",
  description:
    "Conheça a história da Três Marias: o encontro de três amigas que compartilham a fé, o amor pela moda e o propósito de vestir mulheres com elegância e conforto.",
};

export default function SobrePage() {
  return (
    <>
      <Header />
      <main className="flex-1" aria-label="História e Propósito da Três Marias">
        <AboutStorySection />
      </main>
      <NewsletterSection />
      <Footer />
    </>
  );
}
