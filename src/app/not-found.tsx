import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-20 text-center">
        <span className="mb-3 rounded-full bg-[#eaf3ee] px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-[#1f6b4f]">
          Erro 404
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-[#202522] mb-4">
          Página não encontrada
        </h1>
        <p className="max-w-md text-sm text-[#777d78] mb-8 leading-relaxed">
          O endereço que você tentou acessar não existe, foi movido ou está indisponível.
        </p>
        <Link
          href="/"
          className="btn"
        >
          Voltar para o início
        </Link>
      </main>
      <Footer />
    </>
  );
}
