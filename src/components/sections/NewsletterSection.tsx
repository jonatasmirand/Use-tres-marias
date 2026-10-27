"use client";

import { FlowerEmblem } from "@/components/institutional/AboutStorySection";

interface NewsletterSectionProps {
  /** Link de convite do grupo do WhatsApp */
  groupUrl?: string;
  /** Título customizado opcional */
  title?: string;
  /** Subtítulo customizado opcional */
  description?: string;
}

function WhatsAppIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 15 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.53 7.03C9.36 7.03 9.09 7.09 8.85 7.35C8.62 7.62 7.96 8.24 7.96 9.49C7.96 10.74 8.87 11.95 9 12.12C9.13 12.29 10.8 14.86 13.35 15.96C13.96 16.22 14.43 16.38 14.8 16.5C15.42 16.69 15.98 16.67 16.42 16.6C16.92 16.53 17.95 15.98 18.17 15.36C18.38 14.75 18.38 14.22 18.32 14.11C18.25 14 18.1 13.93 17.87 13.82C17.65 13.71 16.55 13.17 16.35 13.1C16.14 13.02 16 12.98 15.85 13.2C15.7 13.43 15.28 13.93 15.15 14.07C15.02 14.22 14.9 14.24 14.67 14.13C14.45 14.01 13.73 13.78 12.87 13.01C12.21 12.42 11.76 11.69 11.63 11.47C11.51 11.24 11.62 11.12 11.73 11.01C11.83 10.9 11.96 10.74 12.07 10.6C12.19 10.46 12.23 10.36 12.3 10.21C12.38 10.06 12.34 9.93 12.28 9.82C12.23 9.71 11.78 8.6 11.59 8.15C11.41 7.71 11.22 7.77 11.08 7.76C10.95 7.76 10.8 7.75 10.65 7.75C10.5 7.75 10.26 7.81 10.06 8.03C9.86 8.24 9.53 8.56 9.53 9.49" />
    </svg>
  );
}

export default function NewsletterSection({
  groupUrl = "https://chat.whatsapp.com/invite/usetresmarias",
  title = "Receba as Novidades de Moda no WhatsApp",
  description = "Faça parte do nosso Grupo VIP exclusivo para receber em primeira mão novos lançamentos, provadores reais, dicas de combinações de looks e condições especiais.",
}: NewsletterSectionProps) {
  // Se ainda não houver link direto do grupo configurado, pode direcionar para solicitar o link via WhatsApp
  const finalUrl =
    groupUrl ||
    `https://wa.me/5511999999999?text=${encodeURIComponent(
      "Olá! Gostaria de entrar no grupo VIP de novidades de moda da Três Marias."
    )}`;

  return (
    <section
      aria-label="Convite para o Grupo VIP de Moda no WhatsApp"
      className="relative overflow-hidden bg-gradient-to-b from-[#f2f7f4] via-[#eaf3ee] to-[#f4f7f5] py-16 sm:py-20 px-6 border-t border-[#e2ece5]"
    >
      {/* Elementos decorativos de fundo */}
      <div
        className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-[#1f6b4f]/5 pointer-events-none blur-2xl"
        aria-hidden="true"
      />
      <div
        className="absolute -left-24 -bottom-24 w-96 h-96 rounded-full bg-[#25D366]/5 pointer-events-none blur-2xl"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-[680px] text-center">
        {/* Badge de destaque */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#d6e5dc] shadow-2xs mb-5">
          <span className="flex size-2 rounded-full bg-[#25D366] animate-pulse" />
          <WhatsAppIcon className="w-4 h-4 text-[#20ba5a]" />
          <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#1a553f]">
            Comunidade VIP no WhatsApp
          </span>
        </div>

        {/* Título Principal */}
        <h2 className="font-serif text-[30px] sm:text-[38px] lg:text-[42px] font-normal text-[#182620] leading-tight mb-4 tracking-tight">
          {title}
        </h2>

        {/* Descrição */}
        <p className="text-[14px] sm:text-[15px] leading-relaxed text-[#56655c] max-w-[580px] mx-auto mb-8">
          {description}
        </p>


        {/* Botão de Chamada para Ação */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={finalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#25D366] hover:bg-[#20ba5a] text-white text-[13px] sm:text-[14px] font-bold tracking-wide rounded-full shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
          >
            <WhatsAppIcon className="w-5 h-5 shrink-0" />
            <span>Entrar no Grupo VIP de Moda</span>
            <span className="text-white/80 text-base">→</span>
          </a>
        </div>

        {/* Informação de tranquilidade */}
        <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-[#6e7e75]">
          <FlowerEmblem className="w-3.5 h-3.5 text-[#1f6b4f]" strokeWidth={1.8} />
          <span>Grupo fechado e silencioso • Sem spam • Apenas novidades imperdíveis</span>
        </div>
      </div>
    </section>
  );
}
