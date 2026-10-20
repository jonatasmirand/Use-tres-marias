"use client";

import Link from "next/link";
import { useState } from "react";

const navigationLinks = [
  { label: "Novidades", href: "/#novidades" },
  { label: "Vestidos", href: "/#vestidos" },
  { label: "Blusas", href: "/#blusas" },
  { label: "Bermudas", href: "/#bermudas" },
  { label: "Conjuntos", href: "/#conjuntos" },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  function handleCartClick() {
    setCartCount((c) => c + 1);
  }

  return (
    <>
      {/* Header Principal */}
      <header className="sticky top-0 z-30 border-b border-[#e6e7e4] bg-white">
        <div className="mx-auto grid h-[82px] max-w-[1240px] grid-cols-[auto_1fr] items-center gap-5 px-6 md:grid-cols-[1fr_auto_1fr]">
          {/* Menu de Navegação Desktop */}
          <nav aria-label="Navegação principal" className="hidden md:block">
            <ul className="flex items-center gap-[26px]">
              {navigationLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="whitespace-nowrap text-[13px] uppercase tracking-[0.06em] text-[#202522] transition hover:text-[#1f6b4f]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Botão Hambúrguer Mobile */}
          <button
            type="button"
            aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={isMenuOpen}
            className="text-2xl text-[#202522] md:hidden focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? "✕" : "☰"}
          </button>

          {/* Logo Centralizada em Georgia */}
          <Link
            href="/"
            aria-label="useTrêsMarias — página inicial"
            className="text-center font-serif text-[27px] font-bold tracking-[-0.04em] text-[#202522] transition hover:opacity-95"
            onClick={() => setIsMenuOpen(false)}
          >
            use<span className="text-[#1f6b4f]">Três</span>Marias
          </Link>

          {/* Botões de Ação à Direita (Busca, Conta e Carrinho/Favoritos) */}
          <div className="flex items-center justify-end gap-[18px]">
            <button
              type="button"
              aria-label="Buscar"
              onClick={() => alert("Busca em breve")}
              className="text-[19px] text-[#202522] transition hover:text-[#1f6b4f]"
            >
              ⌕
            </button>

            <Link
              href="/admin"
              aria-label="Painel Administrativo"
              title="Painel Administrativo"
              className="text-[19px] text-[#202522] transition hover:text-[#1f6b4f]"
            >
              ♙
            </Link>

            <button
              type="button"
              aria-label="Carrinho de Compras"
              onClick={handleCartClick}
              className="relative text-[19px] text-[#202522] transition hover:text-[#1f6b4f]"
            >
              <span>♡</span>
              <span className="absolute -top-2 -right-2 grid size-[17px] place-items-center rounded-full bg-[#1f6b4f] text-[10px] font-bold text-white">
                {cartCount}
              </span>
            </button>
          </div>
        </div>

        {/* Menu Mobile Retrátil */}
        {isMenuOpen && (
          <nav
            aria-label="Navegação móvel"
            className="border-t border-[#e6e7e4] bg-white px-6 py-4 md:hidden shadow-lg"
          >
            <ul className="flex flex-col gap-3">
              {navigationLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="block text-xs uppercase tracking-[0.06em] text-[#202522] py-1.5 transition hover:text-[#1f6b4f]"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </header>
    </>
  );
}
