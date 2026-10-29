"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";

const WHATSAPP_PHONE = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5511999999999";

interface CheckoutClientProps {
  customer: {
    userId: string;
    email: string;
    name: string;
  };
  whatsappNumber?: string;
}

interface ConfirmedOrder {
  orderId: string;
  reference: string;
  trackingToken: string;
  trackingUrl: string;
  whatsappUrl: string;
}

export default function CheckoutClient({ customer, whatsappNumber }: CheckoutClientProps) {
  const { items, totalPrice, clearCart } = useCart();

  const [customerName, setCustomerName] = useState(customer.name);
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmedOrder, setConfirmedOrder] = useState<ConfirmedOrder | null>(null);

  const isSubmittingRef = useRef(false);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);

  const installmentValue = formatCurrency(totalPrice / 6);

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmittingRef.current || isSubmitting || items.length === 0) {
      return;
    }

    if (!phone.trim()) {
      setErrorMessage("Por favor, informe seu telefone de contato/WhatsApp para acompanhamento.");
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = {
        items: items.map((item) => ({
          product_id: item.productId,
          name: item.name,
          size: item.size,
          price: item.price,
          quantity: item.quantity,
          image_url: item.image,
        })),
        customer_name: customerName.trim() || customer.name || undefined,
        customer_phone: phone.trim(),
        customer_notes: notes.trim() || undefined,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Não foi possível registrar o pedido.");
      }

      // Constrói a mensagem para o WhatsApp com link de rastreio e referência
      const itemsList = items
        .map(
          (item) =>
            `• ${item.quantity}x ${item.name} (${item.size}) — ${formatCurrency(
              item.price * item.quantity
            )}`
        )
        .join("\n");

      const text = `Olá, equipe useTrêsMarias! Gostaria de finalizar meu pedido:

🛍️ *Pedido Registrado:* ${data.reference}
👤 *Cliente:* ${customerName || customer.email}
📱 *Telefone:* ${phone.trim()}
${notes.trim() ? `📝 *Observações:* ${notes.trim()}\n` : ""}
*Itens da Sacola:*
${itemsList}

💰 *Subtotal:* ${formatCurrency(totalPrice)}
🚚 *Frete:* A calcular com o CEP
💳 *Total:* ${formatCurrency(totalPrice)}

🔗 *Acompanhe seu pedido pelo link oficial:*
${data.trackingUrl}

Poderiam me enviar os dados para pagamento e prazo de envio? Obrigado!`;

      const cleanPhone = (whatsappNumber || WHATSAPP_PHONE).replace(/\D/g, "");
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;

      // Limpa sacola somente após sucesso
      clearCart();

      // Abre WhatsApp em nova aba
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");

      setConfirmedOrder({
        orderId: data.orderId,
        reference: data.reference,
        trackingToken: data.trackingToken,
        trackingUrl: data.trackingUrl,
        whatsappUrl,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao processar pedido.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
      isSubmittingRef.current = false;
    }
  };

  // 1. Tela de Pedido Confirmado
  if (confirmedOrder) {
    return (
      <main className="min-h-screen bg-[#fafbf9] py-12 px-4 text-[#202522]">
        <div className="mx-auto max-w-[640px]">
          <div className="rounded-3xl border border-[#e6e7e4] bg-white p-8 sm:p-10 shadow-xs text-center space-y-6">
            <div className="size-20 rounded-full bg-[#eaf3ee] text-[#1f6b4f] mx-auto flex items-center justify-center text-4xl shadow-xs">
              ✓
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#1f6b4f] bg-[#eaf3ee] px-3 py-1 rounded-full">
                Pedido Vinculado à sua Conta
              </span>
              <h1 className="font-serif text-3xl font-bold text-[#182620] mt-3">
                Pedido {confirmedOrder.reference}
              </h1>
              <p className="text-xs text-[#5f6863] mt-2 max-w-md mx-auto leading-relaxed">
                Seu pedido foi registrado e associado com segurança ao seu perfil. Você pode
                acompanhar o status em tempo real tanto pela sua conta quanto pelo link exclusivo.
              </p>
            </div>

            {/* Card com Links de Acesso */}
            <div className="rounded-2xl border border-[#e6e7e4] bg-[#fafbf9] p-5 text-left space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#7a857f] block">
                Link de Acompanhamento do Pedido
              </span>
              <p className="text-xs text-[#202522] break-all font-mono bg-white p-3 rounded-xl border border-[#e6e7e4]">
                {confirmedOrder.trackingUrl}
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <Link
                  href={confirmedOrder.trackingUrl}
                  className="w-full sm:flex-1 text-center py-3 bg-[#183428] text-white text-xs font-semibold rounded-xl hover:bg-[#10241b] transition shadow-xs"
                >
                  Abrir Rastreio Oficial →
                </Link>

                <Link
                  href={`/cliente/pedidos/${confirmedOrder.orderId}`}
                  className="w-full sm:flex-1 text-center py-3 bg-white border border-[#e6e7e4] text-[#202522] text-xs font-semibold rounded-xl hover:border-[#183428] transition"
                >
                  Ver em Meus Pedidos
                </Link>
              </div>
            </div>

            {/* Ações WhatsApp e Continuar */}
            <div className="space-y-3 pt-2">
              <a
                href={confirmedOrder.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-[#20ba5a] transition"
              >
                <span>Reabrir WhatsApp</span>
                <span>↗</span>
              </a>

              <Link
                href="/"
                className="block text-center text-xs font-semibold text-[#5f6863] hover:text-[#183428] transition py-2"
              >
                ← Voltar para a loja Use Três Marias
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // 2. Sacola Vazia
  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-[#fafbf9] py-16 px-4 text-[#202522] flex items-center justify-center">
        <div className="max-w-[460px] text-center space-y-4 rounded-3xl border border-[#e6e7e4] bg-white p-8 shadow-xs">
          <span className="text-5xl block">🛍️</span>
          <h1 className="font-serif text-2xl font-bold text-[#182620]">
            Sua sacola está vazia
          </h1>
          <p className="text-xs text-[#5f6863] leading-relaxed">
            Adicione algumas peças exclusivas antes de prosseguir com o fechamento do pedido.
          </p>
          <Link
            href="/novidades"
            className="inline-block px-5 py-2.5 bg-[#1f6b4f] text-white text-xs font-semibold rounded-xl hover:bg-[#164d3a] transition shadow-xs"
          >
            Explorar Coleção →
          </Link>
        </div>
      </main>
    );
  }

  // 3. Formulário de Confirmação de Checkout
  return (
    <main className="min-h-screen bg-[#fafbf9] py-10 px-4 text-[#202522]">
      <div className="mx-auto max-w-[1080px]">
        {/* Cabeçalho */}
        <header className="mb-8 flex items-center justify-between border-b border-[#e6e7e4] pb-5">
          <div>
            <Link
              href="/"
              className="font-serif text-2xl font-bold tracking-tight text-[#202522] hover:opacity-90 transition"
            >
              use<span className="text-[#1f6b4f]">Três</span>Marias
            </Link>
            <p className="text-xs text-[#5f6863] mt-1">
              Finalização de Compra Segura
            </p>
          </div>

          <Link
            href="/"
            className="text-xs font-semibold text-[#5f6863] hover:text-[#183428] transition"
          >
            ← Voltar para a loja
          </Link>
        </header>

        {errorMessage && (
          <div
            role="alert"
            className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-800 flex items-center gap-2"
          >
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleConfirmOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Coluna Esquerda: Dados do Cliente e Entrega */}
            <div className="lg:col-span-7 space-y-6">
              {/* Card de Identificação do Cliente */}
              <div className="rounded-3xl border border-[#e6e7e4] bg-white p-6 sm:p-7 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#f0f2f0] pb-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#1f6b4f]">
                      Passo 1
                    </span>
                    <h2 className="font-serif text-lg font-bold text-[#182620]">
                      Identificação do Comprador
                    </h2>
                  </div>
                  <span className="text-[11px] font-semibold text-[#1f6b4f] bg-[#eaf3ee] px-2.5 py-0.5 rounded-full">
                    ✓ Autenticado
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#202522] mb-1">
                      E-mail da Conta (vinculado automaticamente)
                    </label>
                    <input
                      type="email"
                      value={customer.email}
                      disabled
                      className="w-full rounded-xl border border-[#e6e7e4] bg-[#f0f2f0] px-3.5 py-2.5 text-xs text-[#5f6863] cursor-not-allowed font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#202522] mb-1">
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Seu nome completo"
                      required
                      className="w-full rounded-xl border border-[#e6e7e4] bg-[#fafbf9] px-3.5 py-2.5 text-xs text-[#202522] focus:bg-white focus:border-[#1f6b4f] outline-none transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#202522] mb-1">
                      WhatsApp / Telefone para Contato <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(11) 99999-9999"
                      required
                      className="w-full rounded-xl border border-[#e6e7e4] bg-[#fafbf9] px-3.5 py-2.5 text-xs text-[#202522] focus:bg-white focus:border-[#1f6b4f] outline-none transition"
                    />
                    <span className="text-[11px] text-[#7a857f] mt-1 block">
                      Utilizado para confirmação do pagamento e envio do código de rastreamento.
                    </span>
                  </div>
                </div>
              </div>

              {/* Card de Informações de Entrega / Observações */}
              <div className="rounded-3xl border border-[#e6e7e4] bg-white p-6 sm:p-7 shadow-xs space-y-4">
                <div className="border-b border-[#f0f2f0] pb-3">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#1f6b4f]">
                    Passo 2
                  </span>
                  <h2 className="font-serif text-lg font-bold text-[#182620]">
                    Endereço de Entrega ou Observações
                  </h2>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#202522] mb-1">
                    CEP, Endereço ou Detalhes para envio
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ex: CEP 01234-567, Rua das Flores, 120, Apto 42 — São Paulo/SP..."
                    className="w-full rounded-xl border border-[#e6e7e4] bg-[#fafbf9] p-3 text-xs text-[#202522] focus:bg-white focus:border-[#1f6b4f] outline-none transition resize-none"
                  />
                  <span className="text-[11px] text-[#7a857f] mt-1 block">
                    O frete será calculado via WhatsApp de acordo com o seu CEP.
                  </span>
                </div>
              </div>
            </div>

            {/* Coluna Direita: Resumo dos Itens e Botão de Finalização */}
            <div className="lg:col-span-5 space-y-6">
              <div className="rounded-3xl border border-[#e6e7e4] bg-white p-6 sm:p-7 shadow-xs space-y-5">
                <h2 className="font-serif text-lg font-bold text-[#182620] border-b border-[#f0f2f0] pb-3">
                  Resumo da Sacola ({items.length} {items.length === 1 ? "item" : "itens"})
                </h2>

                {/* Lista de Itens */}
                <div className="divide-y divide-[#f0f2f0] max-h-[300px] overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.id} className="py-3 flex items-center gap-3">
                      <div className="size-14 rounded-xl overflow-hidden bg-[#fafbf9] border border-[#e6e7e4] shrink-0 relative">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover object-top"
                          sizes="56px"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-xs font-semibold text-[#182620] truncate">
                          {item.name}
                        </h3>
                        <p className="text-[11px] text-[#7a857f]">
                          Tam: {item.size} • Qtd: {item.quantity}
                        </p>
                      </div>

                      <span className="text-xs font-bold text-[#182620]">
                        {formatCurrency(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Detalhes Financeiros */}
                <div className="border-t border-[#e6e7e4] pt-4 space-y-2 text-xs text-[#5f6863]">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-[#182620]">{formatCurrency(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Frete</span>
                    <span className="text-[#1f6b4f] font-semibold">A calcular com o CEP</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-[#182620] pt-2 border-t border-[#f0f2f0]">
                    <span>Total</span>
                    <span>{formatCurrency(totalPrice)}</span>
                  </div>
                  <p className="text-[11px] text-[#7a857f] text-right">
                    ou em até 6x de {installmentValue} sem juros
                  </p>
                </div>

                {/* Botão de Confirmação */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#1f6b4f] py-4 text-xs font-bold uppercase tracking-wider text-white shadow-md transition hover:bg-[#164d3a] hover:shadow-lg disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Registrando Pedido...</span>
                    </>
                  ) : (
                    <>
                      <span>Confirmar e Finalizar pelo WhatsApp</span>
                      <span>→</span>
                    </>
                  )}
                </button>

                {/* Garantias de Segurança */}
                <div className="pt-2 text-center text-[10px] text-[#777d78] flex items-center justify-center gap-2">
                  <span>🔒 Compra 100% Segura</span>
                  <span>•</span>
                  <span>📦 Rastreio em Tempo Real</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
