"use client";

import { useState } from "react";
import { FlowerEmblem } from "./AboutStorySection";

/* -------------------------------------------------------------------------- */
/*  Ícones SVG para os Canais de Atendimento                                  */
/* -------------------------------------------------------------------------- */

function WhatsAppIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 15 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.53 7.03C9.36 7.03 9.09 7.09 8.85 7.35C8.62 7.62 7.96 8.24 7.96 9.49C7.96 10.74 8.87 11.95 9 12.12C9.13 12.29 10.8 14.86 13.35 15.96C13.96 16.22 14.43 16.38 14.8 16.5C15.42 16.69 15.98 16.67 16.42 16.6C16.92 16.53 17.95 15.98 18.17 15.36C18.38 14.75 18.38 14.22 18.32 14.11C18.25 14 18.1 13.93 17.87 13.82C17.65 13.71 16.55 13.17 16.35 13.1C16.14 13.02 16 12.98 15.85 13.2C15.7 13.43 15.28 13.93 15.15 14.07C15.02 14.22 14.9 14.24 14.67 14.13C14.45 14.01 13.73 13.78 12.87 13.01C12.21 12.42 11.76 11.69 11.63 11.47C11.51 11.24 11.62 11.12 11.73 11.01C11.83 10.9 11.96 10.74 12.07 10.6C12.19 10.46 12.23 10.36 12.3 10.21C12.38 10.06 12.34 9.93 12.28 9.82C12.23 9.71 11.78 8.6 11.59 8.15C11.41 7.71 11.22 7.77 11.08 7.76C10.95 7.76 10.8 7.75 10.65 7.75C10.5 7.75 10.26 7.81 10.06 8.03C9.86 8.24 9.53 8.56 9.53 9.49" />
    </svg>
  );
}

function InstagramIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function MailIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function CopyIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*  Props do Componente de Contato                                            */
/* -------------------------------------------------------------------------- */
export interface ContactSectionProps {
  whatsappNumber?: string;
  whatsappFormatted?: string;
  instagramHandle?: string;
  emailAddress?: string;
  businessHours?: string;
  showForm?: boolean;
}

export default function ContactSection({
  whatsappNumber = "5511999999999",
  whatsappFormatted = "(11) 99999-9999",
  instagramHandle = "usetresmarias",
  emailAddress = "contato@usetresmarias.com.br",
  businessHours = "Segunda a Sexta: 09h às 18h | Sábado: 09h às 13h",
  showForm = true,
}: ContactSectionProps) {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "Dúvidas sobre peças",
    message: "",
  });

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    "Olá! Gostaria de tirar uma dúvida sobre as peças da Três Marias."
  )}`;

  const instagramUrl = `https://instagram.com/${instagramHandle.replace("@", "")}`;

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(emailAddress);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2500);
    } catch {
      // Fallback simples
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2500);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  return (
    <section
      id="contato"
      aria-label="Canais de Atendimento e Contato"
      className="w-full bg-[#fbf9f6] py-16 sm:py-24"
    >
      <div className="mx-auto max-w-[1240px] px-6">
        {/* Cabeçalho da Seção */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#1f6b4f] bg-[#eaf3ee] px-3.5 py-1.5 rounded-full">
            <FlowerEmblem className="w-3.5 h-3.5" strokeWidth={2} />
            Atendimento Exclusivo
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#192620] tracking-tight">
            Fale com a Três Marias
          </h2>
          <p className="text-[14px] sm:text-[15px] leading-relaxed text-[#5f6863]">
            Estamos sempre prontas para te ouvir. Tire dúvidas sobre tamanhos, tecidos, entregas ou
            solicite ajuda personalizada para encontrar seu look perfeito.
          </p>
        </div>

        {/* Grade com os 3 Canais Oficiais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16">
          {/* Card 1: WhatsApp */}
          <div className="bg-white rounded-3xl p-7 lg:p-8 border border-[#e6e7e4] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-28 h-28 bg-[#25D366]/5 rounded-bl-[80px] pointer-events-none transition group-hover:scale-110" />

            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-13 h-13 rounded-2xl bg-[#eaf7ef] text-[#1ea952] flex items-center justify-center shadow-xs">
                  <WhatsAppIcon className="w-7 h-7" />
                </div>
                <span className="text-[11px] font-medium uppercase tracking-wider text-[#1ea952] bg-[#eaf7ef] px-2.5 py-1 rounded-full">
                  Atendimento Ágil
                </span>
              </div>

              <h3 className="font-serif text-2xl text-[#1e2923] mb-2 font-normal">WhatsApp</h3>
              <p className="text-[13px] sm:text-[14px] text-[#5f6863] leading-relaxed mb-4">
                Converse com nossas consultoras para tirar dúvidas sobre caimento, medidas, estoque
                ou fazer pedidos assistidos em tempo real.
              </p>

              <div className="text-[15px] font-semibold text-[#1e2923] mb-1 font-mono">
                {whatsappFormatted}
              </div>
              <p className="text-[11px] text-[#8a948e] mb-6">
                {businessHours}
              </p>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 bg-[#25D366] hover:bg-[#20ba5a] text-white text-[13px] font-semibold tracking-wide rounded-xl transition shadow-xs hover:shadow-md"
            >
              <WhatsAppIcon className="w-4 h-4" />
              <span>Chamar no WhatsApp</span>
            </a>
          </div>

          {/* Card 2: Instagram */}
          <div className="bg-white rounded-3xl p-7 lg:p-8 border border-[#e6e7e4] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-28 h-28 bg-[#E1306C]/5 rounded-bl-[80px] pointer-events-none transition group-hover:scale-110" />

            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-13 h-13 rounded-2xl bg-[#fdf0f4] text-[#cf2b63] flex items-center justify-center shadow-xs">
                  <InstagramIcon className="w-7 h-7" />
                </div>
                <span className="text-[11px] font-medium uppercase tracking-wider text-[#cf2b63] bg-[#fdf0f4] px-2.5 py-1 rounded-full">
                  Comunidade & Looks
                </span>
              </div>

              <h3 className="font-serif text-2xl text-[#1e2923] mb-2 font-normal">Instagram</h3>
              <p className="text-[13px] sm:text-[14px] text-[#5f6863] leading-relaxed mb-4">
                Acompanhe nossos provadores diários, bastidores, lançamentos e envie mensagens
                diretas para interagir com a nossa equipe.
              </p>

              <div className="text-[15px] font-semibold text-[#1e2923] mb-1">
                @{instagramHandle.replace("@", "")}
              </div>
              <p className="text-[11px] text-[#8a948e] mb-6">
                Directs respondidos ao longo do dia com todo carinho
              </p>
            </div>

            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-5 bg-[#183428] hover:bg-[#12281f] text-white text-[13px] font-semibold tracking-wide rounded-xl transition shadow-xs hover:shadow-md"
            >
              <InstagramIcon className="w-4 h-4" />
              <span>Seguir & Enviar Mensagem</span>
            </a>
          </div>

          {/* Card 3: E-mail */}
          <div className="bg-white rounded-3xl p-7 lg:p-8 border border-[#e6e7e4] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-28 h-28 bg-[#183428]/5 rounded-bl-[80px] pointer-events-none transition group-hover:scale-110" />

            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-13 h-13 rounded-2xl bg-[#f2f5f3] text-[#183428] flex items-center justify-center shadow-xs">
                  <MailIcon className="w-7 h-7" />
                </div>
                <span className="text-[11px] font-medium uppercase tracking-wider text-[#183428] bg-[#f2f5f3] px-2.5 py-1 rounded-full">
                  Suporte Formal
                </span>
              </div>

              <h3 className="font-serif text-2xl text-[#1e2923] mb-2 font-normal">E-mail</h3>
              <p className="text-[13px] sm:text-[14px] text-[#5f6863] leading-relaxed mb-4">
                Ideal para solicitações de trocas e devoluções, envio de comprovantes, propostas de
                parcerias ou dúvidas detalhadas.
              </p>

              <div className="text-[13px] sm:text-[14px] font-mono font-medium text-[#1e2923] mb-1 break-all">
                {emailAddress}
              </div>
              <p className="text-[11px] text-[#8a948e] mb-6">
                Tempo médio de resposta: até 24 horas úteis
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleCopyEmail}
                className={`py-3 px-3 text-[12px] font-semibold rounded-xl border transition flex items-center justify-center gap-1.5 ${
                  copiedEmail
                    ? "bg-[#eaf7ef] border-[#25D366] text-[#1ea952]"
                    : "bg-white border-[#e6e7e4] text-[#202522] hover:bg-[#f6f7f5]"
                }`}
                aria-label="Copiar endereço de e-mail"
              >
                {copiedEmail ? (
                  <>
                    <CheckIcon className="w-3.5 h-3.5" />
                    <span>Copiado!</span>
                  </>
                ) : (
                  <>
                    <CopyIcon className="w-3.5 h-3.5" />
                    <span>Copiar</span>
                  </>
                )}
              </button>

              <a
                href={`mailto:${emailAddress}`}
                className="py-3 px-3 bg-[#183428] hover:bg-[#12281f] text-white text-[12px] font-semibold rounded-xl transition text-center flex items-center justify-center"
              >
                Escrever
              </a>
            </div>
          </div>
        </div>

        {/* Formulário Rápido de Contato & Dúvidas */}
        {showForm && (
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#e6e7e4] shadow-sm max-w-3xl mx-auto">
            <div className="text-center mb-8">
              <h3 className="font-serif text-2xl sm:text-3xl text-[#192620] mb-2 font-normal">
                Envie uma Mensagem Direta
              </h3>
              <p className="text-[13px] sm:text-[14px] text-[#5f6863]">
                Preencha o formulário abaixo e retornaremos diretamente no seu e-mail ou WhatsApp.
              </p>
            </div>

            {formSubmitted ? (
              <div className="py-10 text-center space-y-4 bg-[#f8faf8] rounded-2xl border border-[#e2ece5] p-6">
                <div className="w-14 h-14 rounded-full bg-[#eaf7ef] text-[#1ea952] flex items-center justify-center mx-auto">
                  <CheckIcon className="w-7 h-7" />
                </div>
                <h4 className="font-serif text-2xl text-[#1e2923]">Mensagem Enviada!</h4>
                <p className="text-[14px] text-[#5f6863] max-w-md mx-auto">
                  Obrigada pelo contato, <strong>{formData.name || "amiga"}</strong>. Nossa equipe
                  já recebeu sua mensagem e responderá em breve.
                </p>
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setFormSubmitted(false);
                      setFormData({
                        name: "",
                        email: "",
                        phone: "",
                        subject: "Dúvidas sobre peças",
                        message: "",
                      });
                    }}
                    className="text-[12px] text-[#183428] underline underline-offset-4 font-medium"
                  >
                    Enviar outra mensagem
                  </button>
                  <span className="hidden sm:inline text-gray-300">•</span>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[12px] text-[#1ea952] font-semibold hover:underline"
                  >
                    Precisa de resposta urgente? Chamar no WhatsApp →
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="block text-[12px] font-semibold text-[#202522] mb-1.5 uppercase tracking-wider"
                    >
                      Seu Nome *
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Como você prefere ser chamada?"
                      className="w-full rounded-xl border border-[#e6e7e4] bg-[#fafafa] px-4 py-3 text-[14px] text-[#202522] focus:border-[#183428] focus:bg-white focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="contact-email"
                      className="block text-[12px] font-semibold text-[#202522] mb-1.5 uppercase tracking-wider"
                    >
                      Seu E-mail *
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="exemplo@email.com"
                      className="w-full rounded-xl border border-[#e6e7e4] bg-[#fafafa] px-4 py-3 text-[14px] text-[#202522] focus:border-[#183428] focus:bg-white focus:outline-none transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="contact-phone"
                      className="block text-[12px] font-semibold text-[#202522] mb-1.5 uppercase tracking-wider"
                    >
                      WhatsApp / Telefone
                    </label>
                    <input
                      id="contact-phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(DD) 99999-9999"
                      className="w-full rounded-xl border border-[#e6e7e4] bg-[#fafafa] px-4 py-3 text-[14px] text-[#202522] focus:border-[#183428] focus:bg-white focus:outline-none transition"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="contact-subject"
                      className="block text-[12px] font-semibold text-[#202522] mb-1.5 uppercase tracking-wider"
                    >
                      Assunto *
                    </label>
                    <select
                      id="contact-subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full rounded-xl border border-[#e6e7e4] bg-[#fafafa] px-4 py-3 text-[14px] text-[#202522] focus:border-[#183428] focus:bg-white focus:outline-none transition"
                    >
                      <option value="Dúvidas sobre peças">Dúvidas sobre tamanhos ou tecidos</option>
                      <option value="Trocas e devoluções">Trocas e Devoluções</option>
                      <option value="Acompanhamento de pedido">Rastreamento de Pedido</option>
                      <option value="Parcerias">Parcerias e Colaborações</option>
                      <option value="Outro assunto">Outro assunto</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="contact-message"
                    className="block text-[12px] font-semibold text-[#202522] mb-1.5 uppercase tracking-wider"
                  >
                    Mensagem *
                  </label>
                  <textarea
                    id="contact-message"
                    rows={4}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Conte como podemos te ajudar..."
                    className="w-full rounded-xl border border-[#e6e7e4] bg-[#fafafa] px-4 py-3 text-[14px] text-[#202522] focus:border-[#183428] focus:bg-white focus:outline-none transition resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-[#183428] hover:bg-[#12281f] text-white text-[13px] font-semibold uppercase tracking-[0.1em] rounded-xl transition shadow-md hover:shadow-lg"
                >
                  Enviar Mensagem
                </button>
              </form>
            )}
          </div>
        )}

        {/* Informações Complementares & Selos */}
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-6 pt-10 border-t border-[#e8e9e6] text-center">
          <div className="space-y-1">
            <h4 className="text-[13px] font-bold text-[#1e2923]">Envio Rápido & Seguro</h4>
            <p className="text-[12px] text-[#5f6863]">
              Entrega em todo o Brasil com código de rastreamento.
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="text-[13px] font-bold text-[#1e2923]">Troca Sem Complicação</h4>
            <p className="text-[12px] text-[#5f6863]">
              Até 30 dias para solicitar a troca da sua peça.
            </p>
          </div>
          <div className="space-y-1">
            <h4 className="text-[13px] font-bold text-[#1e2923]">Atendimento Humano</h4>
            <p className="text-[12px] text-[#5f6863]">
              Mulheres cuidando de mulheres em cada detalhe.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
