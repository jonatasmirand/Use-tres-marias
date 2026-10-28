"use client";

import { useState } from "react";
import { ContactSettings } from "@/types/contact";
import { formatDisplayPhoneNumber, sanitizeWhatsAppNumber } from "@/validations/contact-schemas";

interface ContactFormClientProps {
  initialSettings: ContactSettings;
}

export default function ContactFormClient({ initialSettings }: ContactFormClientProps) {
  const [formData, setFormData] = useState({
    whatsapp_number: initialSettings.whatsapp_number || "5511999999999",
    whatsapp_formatted: initialSettings.whatsapp_formatted || "(11) 99999-9999",
    instagram_handle: initialSettings.instagram_handle || "usetresmarias",
    email_address: initialSettings.email_address || "contato@usetresmarias.com.br",
    business_hours: initialSettings.business_hours || "Segunda a Sexta: 09h às 18h | Sábado: 09h às 13h",
    whatsapp_group_url: initialSettings.whatsapp_group_url || "",
    address_summary: initialSettings.address_summary || "São Paulo - SP • Atendimento Online para todo o Brasil",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Manipulador de alteração de campos
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Helper para formatar automaticamente o número informado
  const handleAutoFormatPhone = () => {
    const rawDigits = formData.whatsapp_number.replace(/\D/g, "");
    if (!rawDigits) return;

    const formatted = formatDisplayPhoneNumber(rawDigits);
    const sanitized = sanitizeWhatsAppNumber(rawDigits);

    setFormData((prev) => ({
      ...prev,
      whatsapp_number: sanitized,
      whatsapp_formatted: formatted,
    }));
  };

  // Envio do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/admin/contact", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Erro ao atualizar informações de contato.");
      }

      setStatusMessage({
        type: "success",
        text: "Configurações salvas com sucesso! O novo número e dados de contato já estão ativos na página pública.",
      });

      if (data.contact) {
        setFormData({
          whatsapp_number: data.contact.whatsapp_number,
          whatsapp_formatted: data.contact.whatsapp_formatted,
          instagram_handle: data.contact.instagram_handle,
          email_address: data.contact.email_address,
          business_hours: data.contact.business_hours,
          whatsapp_group_url: data.contact.whatsapp_group_url || "",
          address_summary: data.contact.address_summary || "",
        });
      }
    } catch (err) {
      setStatusMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Falha na comunicação com o servidor.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // URL gerada para teste rápido do link do WhatsApp
  const cleanNumber = formData.whatsapp_number.replace(/\D/g, "");
  const testWhatsAppUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(
    "Olá! Esta é uma mensagem de teste enviada a partir do painel administrativo da Use Três Marias."
  )}`;

  return (
    <div className="space-y-6">
      {/* Banner de Status / Feedback */}
      {statusMessage && (
        <div
          className={`p-4 rounded-2xl border text-xs sm:text-sm font-medium flex items-center justify-between gap-3 animate-in fade-in duration-200 ${
            statusMessage.type === "success"
              ? "bg-[#eaf3ee] border-[#b2d3c2] text-[#18563f]"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          <div className="flex items-center gap-2">
            <span>{statusMessage.type === "success" ? "✓" : "⚠️"}</span>
            <span>{statusMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="text-xs font-bold opacity-60 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Coluna da Esquerda: Formulário de Edição */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#e6e7e4] shadow-sm space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Bloco 1: WhatsApp */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#183428] flex items-center gap-2">
                  <span className="text-base">💬</span>
                  <span>WhatsApp de Atendimento</span>
                </h2>
                <button
                  type="button"
                  onClick={handleAutoFormatPhone}
                  className="text-xs font-semibold text-[#1f6b4f] hover:underline"
                >
                  Auto-formatar
                </button>
              </div>

              {/* Número do WhatsApp (somente números com DDD e DDI) */}
              <div>
                <label className="block text-xs font-bold text-[#202522] mb-1.5">
                  Número para Link Direto (wa.me)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="whatsapp_number"
                    value={formData.whatsapp_number}
                    onChange={handleChange}
                    placeholder="Ex: 5511999999999"
                    required
                    className="w-full rounded-xl border border-[#e6e7e4] bg-[#fafbf9] px-3.5 py-2.5 text-xs text-[#202522] font-mono focus:border-[#1f6b4f] focus:bg-white focus:outline-none transition"
                  />
                </div>
                <p className="text-[11px] text-[#7f8d85] mt-1">
                  Digite com o DDI do Brasil (55) + DDD + número. Exemplo: <code className="bg-[#f0f2f0] px-1 py-0.5 rounded">5511999999999</code>.
                </p>
              </div>

              {/* WhatsApp Formatado para exibição visual */}
              <div>
                <label className="block text-xs font-bold text-[#202522] mb-1.5">
                  Formatação para Exibição na Tela
                </label>
                <input
                  type="text"
                  name="whatsapp_formatted"
                  value={formData.whatsapp_formatted}
                  onChange={handleChange}
                  placeholder="Ex: (11) 99999-9999"
                  className="w-full rounded-xl border border-[#e6e7e4] bg-[#fafbf9] px-3.5 py-2.5 text-xs text-[#202522] focus:border-[#1f6b4f] focus:bg-white focus:outline-none transition"
                />
                <p className="text-[11px] text-[#7f8d85] mt-1">
                  Como o cliente verá no card de contato da loja.
                </p>
              </div>

              {/* Botão de teste do WhatsApp */}
              <div className="pt-1">
                <a
                  href={testWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1ea952] hover:text-[#18563f] hover:underline"
                >
                  <span>🔗 Testar abertura do link do WhatsApp no navegador ↗</span>
                </a>
              </div>
            </div>

            <hr className="border-[#f0f2f0]" />

            {/* Bloco 2: E-mail e Redes Sociais */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#183428] flex items-center gap-2">
                <span className="text-base">✉️</span>
                <span>E-mail & Redes Sociais</span>
              </h2>

              {/* E-mail */}
              <div>
                <label className="block text-xs font-bold text-[#202522] mb-1.5">
                  E-mail Oficial de Atendimento
                </label>
                <input
                  type="email"
                  name="email_address"
                  value={formData.email_address}
                  onChange={handleChange}
                  placeholder="Ex: contato@usetresmarias.com.br"
                  required
                  className="w-full rounded-xl border border-[#e6e7e4] bg-[#fafbf9] px-3.5 py-2.5 text-xs text-[#202522] focus:border-[#1f6b4f] focus:bg-white focus:outline-none transition"
                />
              </div>

              {/* Instagram */}
              <div>
                <label className="block text-xs font-bold text-[#202522] mb-1.5">
                  Perfil do Instagram (@)
                </label>
                <div className="flex rounded-xl border border-[#e6e7e4] bg-[#fafbf9] overflow-hidden focus-within:border-[#1f6b4f] focus-within:bg-white transition">
                  <span className="inline-flex items-center px-3 text-xs text-[#7f8d85] font-semibold border-r border-[#e6e7e4] bg-[#f4f5f2]">
                    @
                  </span>
                  <input
                    type="text"
                    name="instagram_handle"
                    value={formData.instagram_handle}
                    onChange={handleChange}
                    placeholder="usetresmarias"
                    className="flex-1 bg-transparent px-3 py-2.5 text-xs text-[#202522] focus:outline-none"
                  />
                </div>
              </div>

              {/* Link do Grupo VIP no WhatsApp */}
              <div>
                <label className="block text-xs font-bold text-[#202522] mb-1.5">
                  Link de Convite do Grupo VIP no WhatsApp (Newsletter)
                </label>
                <input
                  type="url"
                  name="whatsapp_group_url"
                  value={formData.whatsapp_group_url}
                  onChange={handleChange}
                  placeholder="Ex: https://chat.whatsapp.com/invite/..."
                  className="w-full rounded-xl border border-[#e6e7e4] bg-[#fafbf9] px-3.5 py-2.5 text-xs text-[#202522] focus:border-[#1f6b4f] focus:bg-white focus:outline-none transition"
                />
                <p className="text-[11px] text-[#7f8d85] mt-1">
                  Usado no botão de convite da seção de Newsletter na Página Inicial.
                </p>
              </div>
            </div>

            <hr className="border-[#f0f2f0]" />

            {/* Bloco 3: Horários e Informações Complementares */}
            <div className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#183428] flex items-center gap-2">
                <span className="text-base">🕒</span>
                <span>Horários de Atendimento</span>
              </h2>

              <div>
                <label className="block text-xs font-bold text-[#202522] mb-1.5">
                  Horário de Funcionamento Exibido
                </label>
                <input
                  type="text"
                  name="business_hours"
                  value={formData.business_hours}
                  onChange={handleChange}
                  placeholder="Segunda a Sexta: 09h às 18h | Sábado: 09h às 13h"
                  className="w-full rounded-xl border border-[#e6e7e4] bg-[#fafbf9] px-3.5 py-2.5 text-xs text-[#202522] focus:border-[#1f6b4f] focus:bg-white focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#202522] mb-1.5">
                  Resumo de Localização / Atendimento
                </label>
                <input
                  type="text"
                  name="address_summary"
                  value={formData.address_summary}
                  onChange={handleChange}
                  placeholder="São Paulo - SP • Atendimento Online para todo o Brasil"
                  className="w-full rounded-xl border border-[#e6e7e4] bg-[#fafbf9] px-3.5 py-2.5 text-xs text-[#202522] focus:border-[#1f6b4f] focus:bg-white focus:outline-none transition"
                />
              </div>
            </div>

            {/* Botão Salvar */}
            <div className="pt-4 flex items-center gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-3 bg-[#183428] hover:bg-[#10241b] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-sm hover:shadow flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <div className="size-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Salvando alterações...</span>
                  </>
                ) : (
                  <>
                    <span>💾</span>
                    <span>Salvar Informações de Contato</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Coluna da Direita: Pré-visualização em Tempo Real */}
        <div className="lg:col-span-5 space-y-4">
          <div className="sticky top-6">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#7f8d85]">
                Pré-visualização ao Vivo
              </span>
              <span className="text-[10px] bg-[#eaf3ee] text-[#1f6b4f] font-semibold px-2 py-0.5 rounded-full">
                Como os clientes verão
              </span>
            </div>

            {/* Card Simulador do WhatsApp na Página de Contato */}
            <div className="bg-white rounded-3xl p-6 border border-[#e6e7e4] shadow-sm relative overflow-hidden space-y-4">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#25D366]/5 rounded-bl-[60px] pointer-events-none" />

              <div className="flex items-center justify-between">
                <div className="size-11 rounded-2xl bg-[#eaf7ef] text-[#1ea952] flex items-center justify-center text-lg font-bold">
                  💬
                </div>
                <span className="text-[10px] font-medium uppercase tracking-wider text-[#1ea952] bg-[#eaf7ef] px-2 py-0.5 rounded-full">
                  Atendimento Ágil
                </span>
              </div>

              <div>
                <h3 className="font-serif text-xl text-[#1e2923] mb-1 font-normal">WhatsApp</h3>
                <p className="text-xs text-[#5f6863] leading-relaxed mb-3">
                  Converse com nossas consultoras para tirar dúvidas sobre caimento, medidas ou pedidos assistidos.
                </p>

                <div className="text-sm font-bold text-[#1e2923] font-mono">
                  {formData.whatsapp_formatted || "(11) 99999-9999"}
                </div>
                <p className="text-[10px] text-[#8a948e] mt-0.5">
                  {formData.business_hours || "Segunda a Sexta: 09h às 18h | Sábado: 09h às 13h"}
                </p>
              </div>

              <a
                href={testWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-semibold rounded-xl transition shadow-xs"
              >
                <span>Chamar no WhatsApp →</span>
              </a>
            </div>

            {/* Card Simulador do E-mail e Instagram */}
            <div className="bg-white rounded-2xl p-5 border border-[#e6e7e4] shadow-xs space-y-3 mt-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#7f8d85]">E-mail de contato:</span>
                <span className="font-semibold text-[#202522]">{formData.email_address}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#7f8d85]">Instagram:</span>
                <span className="font-semibold text-[#cf2b63]">@{formData.instagram_handle.replace("@", "")}</span>
              </div>
              {formData.whatsapp_group_url && (
                <div className="flex items-center justify-between text-xs pt-1 border-t border-[#f0f2f0]">
                  <span className="text-[#7f8d85]">Grupo VIP:</span>
                  <span className="font-semibold text-[#1ea952] truncate max-w-[180px]">Link configurado ✓</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
