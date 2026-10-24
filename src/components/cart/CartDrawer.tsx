"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

const WHATSAPP_PHONE = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "5511999999999";

export default function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    totalCount,
    totalPrice,
  } = useCart();

  const drawerRef = useRef<HTMLDivElement>(null);

  // Fecha o drawer com a tecla ESC e trava o scroll da página enquanto aberto
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        closeCart();
      }
    }

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, closeCart]);

  const formattedSubtotal = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(totalPrice);

  const installmentValue = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(totalPrice / 6);

  // Mensagem formatada para o WhatsApp
  const generateWhatsAppMessage = () => {
    const itemsList = items
      .map(
        (item) =>
          `• ${item.quantity}x ${item.name} (${item.size}) — ${new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(item.price * item.quantity)}`
      )
      .join("\n");

    const freteTexto = "A calcular com o CEP";

    const text = `Olá, equipe useTrêsMarias! Gostaria de finalizar meu pedido:

🛍️ *Itens da Sacola:*
${itemsList}

💰 *Subtotal:* ${formattedSubtotal}
🚚 *Frete:* ${freteTexto}
💳 *Total:* ${formattedSubtotal}

Poderiam me passar os dados para pagamento e prazo de envio? Obrigado!`;

    return encodeURIComponent(text);
  };

  return (
    <>
      {/* Backdrop com desfoque e transição suave */}
      <div
        aria-hidden="true"
        onClick={closeCart}
        className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-xs transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer deslizante da direita */}
      <aside
        ref={drawerRef}
        aria-label="Sua Sacola de Compras"
        aria-hidden={!isOpen}
        className={`fixed top-0 right-0 z-50 flex h-full w-full max-w-[420px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Topo do Drawer */}
        <header className="flex items-center justify-between border-b border-[#e6e7e4] px-6 py-5">
          <div className="flex items-center gap-2">
            <h2 className="font-serif text-lg font-bold tracking-tight text-[#202522]">
              Sua Sacola
            </h2>
            <span className="rounded-full bg-[#eaf3ee] px-2 py-0.5 text-xs font-semibold text-[#1f6b4f]">
              {totalCount} {totalCount === 1 ? "item" : "itens"}
            </span>
          </div>

          <button
            type="button"
            onClick={closeCart}
            aria-label="Fechar sacola"
            className="flex size-9 items-center justify-center rounded-full text-[#777d78] transition hover:bg-[#fafbf9] hover:text-[#202522]"
          >
            <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        {/* Conteúdo Central: Itens ou Estado Vazio */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center py-12">
              <div className="flex size-16 items-center justify-center rounded-full bg-[#eaf3ee] text-2xl text-[#1f6b4f] mb-4">
                ♡
              </div>
              <h3 className="font-serif text-lg font-bold text-[#202522] mb-1">
                Sua sacola está vazia
              </h3>
              <p className="text-xs leading-relaxed text-[#777d78] max-w-[260px] mb-6">
                Descubra nossas novidades e encontre as peças que combinam com o seu momento.
              </p>
              <button
                type="button"
                onClick={closeCart}
                className="btn btn-light"
              >
                Explorar novidades
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#f0f2f0]">
              {items.map((item) => {
                const itemTotal = new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(item.price * item.quantity);

                return (
                  <div key={item.id} className="flex gap-4 py-4.5">
                    {/* Foto da Peça */}
                    <Link
                      href={`/produto/${item.slug}`}
                      onClick={closeCart}
                      className="size-20 shrink-0 overflow-hidden rounded-xl bg-[#fafbf9] border border-[#e6e7e4]"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="size-full object-cover object-top transition hover:scale-105"
                      />
                    </Link>

                    {/* Detalhes do Item */}
                    <div className="flex flex-1 flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={`/produto/${item.slug}`}
                            onClick={closeCart}
                            className="text-xs font-semibold text-[#202522] line-clamp-1 hover:text-[#1f6b4f] transition"
                          >
                            {item.name}
                          </Link>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            aria-label={`Remover ${item.name}`}
                            className="text-[#9ea7a2] hover:text-red-700 transition"
                          >
                            <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>

                        <span className="mt-1 inline-block rounded-md bg-[#fafbf9] border border-[#e6e7e4] px-2 py-0.5 text-[10px] font-semibold text-[#5f6863]">
                          Tam: {item.size}
                        </span>
                      </div>

                      {/* Controle de Quantidade e Preço Total do Item */}
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center rounded-lg border border-[#e6e7e4] bg-[#fafbf9]">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="px-2 py-1 text-xs text-[#5f6863] transition hover:text-[#202522] disabled:opacity-30"
                            aria-label="Diminuir quantidade"
                          >
                            −
                          </button>
                          <span className="min-w-6 text-center text-xs font-bold text-[#202522]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-2 py-1 text-xs text-[#5f6863] transition hover:text-[#202522]"
                            aria-label="Aumentar quantidade"
                          >
                            +
                          </button>
                        </div>

                        <span className="text-xs font-bold text-[#202522]">
                          {itemTotal}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Rodapé Fixo com Subtotal e Botão de Finalização */}
        {items.length > 0 && (
          <footer className="border-t border-[#e6e7e4] bg-white p-6 shadow-lg">
            <div className="space-y-1 mb-4">
              <div className="flex items-center justify-between text-xs text-[#5f6863]">
                <span>Subtotal</span>
                <span className="font-bold text-[#202522] text-sm">{formattedSubtotal}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#777d78]">
                <span>Parcelamento</span>
                <span>em até 6x de {installmentValue} sem juros</span>
              </div>
            </div>

            {/* Botão de Finalização via WhatsApp */}
            <div className="space-y-2">
              <a
                href={`https://wa.me/${WHATSAPP_PHONE}?text=${generateWhatsAppMessage()}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1f6b4f] py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-md transition hover:bg-[#164d3a] hover:shadow-lg active:scale-[0.99]"
              >
                <span>Finalizar Pedido pelo WhatsApp</span>
                <span>→</span>
              </a>

              <button
                type="button"
                onClick={closeCart}
                className="w-full text-center py-2 text-xs font-semibold text-[#5f6863] transition hover:text-[#202522]"
              >
                Continuar comprando
              </button>
            </div>

            {/* Garantias de Segurança */}
            <div className="mt-4 border-t border-[#f0f2f0] pt-3 text-center text-[10px] text-[#777d78] flex items-center justify-center gap-3">
              <span>🔒 Compra Segura</span>
              <span>•</span>
              <span>🔄 Troca Fácil em 30 dias</span>
            </div>
          </footer>
        )}
      </aside>
    </>
  );
}
