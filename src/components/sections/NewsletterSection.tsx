"use client";

import { useState } from "react";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setToastMessage("Cadastro realizado! Bem-vinda às Três Marias ♥");
    setEmail("");

    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  }

  return (
    <>
      <section className="bg-[#eaf3ee] py-[70px] px-6 text-center">
        <div className="mx-auto max-w-[620px]">
          <h2 className="font-serif text-[32px] sm:text-[39px] font-normal text-[#202522] mb-3">
            Faça parte das Três Marias
          </h2>
          <p className="text-[14px] text-[#5e6862] mb-6">
            Receba novidades, lançamentos e condições especiais em primeira mão.
          </p>

          <form onSubmit={handleSubscribe} className="mx-auto flex max-w-[520px] flex-col sm:flex-row gap-0">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Seu melhor e-mail"
              required
              className="flex-1 bg-white p-[15px] border border-[#d3dcd6] text-[13px] text-[#202522] outline-none focus:border-[#1f6b4f]"
            />
            <button
              type="submit"
              className="border-0 bg-[#1f6b4f] px-[22px] py-[15px] text-[11px] font-semibold uppercase tracking-[0.08em] text-white transition hover:bg-[#164d3a] cursor-pointer"
            >
              Quero receber
            </button>
          </form>
        </div>
      </section>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 rounded-lg bg-[#18221e] px-5 py-3.5 text-xs text-white shadow-xl transition-all animate-bounce">
          {toastMessage}
        </div>
      )}
    </>
  );
}
