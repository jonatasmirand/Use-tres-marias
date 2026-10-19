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
  const cartItemCount = 0;

  return (
    <header className="sticky top-0 z-50 border-b border-[#e6e7e4] bg-white">
      <div className="mx-auto grid min-h-[82px] max-w-[1240px] grid-cols-[1fr_auto] items-center gap-4 px-5 md:grid-cols-[1fr_auto_1fr] md:px-6">
        <nav
          aria-label="Navegação principal"
          className="hidden md:block"
        >
          <ul className="flex items-center gap-5 lg:gap-[26px]">
            {navigationLinks.map((link) => (
              <li key={link.label}>
                <Link
                  className="whitespace-nowrap text-xs font-medium uppercase tracking-[0.06em] text-[#202522] transition hover:text-[#1f6b4f] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1f6b4f]"
                  href={link.href}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <Link
          aria-label="Use Três Marias - página inicial"
          className="col-start-1 row-start-1 whitespace-nowrap font-serif text-[22px] font-bold tracking-[-0.04em] text-[#202522] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1f6b4f] md:col-start-2 md:text-[27px]"
          href="/"
          onClick={() => setIsMenuOpen(false)}
        >
          use<span className="text-[#1f6b4f]">Três</span>Marias
        </Link>

        <div className="col-start-2 row-start-1 flex shrink-0 items-center justify-end gap-2 md:col-start-3 md:gap-[18px]">
          <button
            aria-label={`Carrinho, ${cartItemCount} itens`}
            className="relative inline-flex size-10 items-center justify-center rounded-full text-[#202522] transition hover:bg-[#eaf3ee] hover:text-[#1f6b4f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1f6b4f]"
            type="button"
          >
            <svg
              aria-hidden="true"
              className="size-[21px]"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path d="M3 3h2l2.4 11.2a2 2 0 0 0 2 1.6h8.8a2 2 0 0 0 2-1.6L22 7H6" />
              <circle cx="10" cy="20" r="1" />
              <circle cx="18" cy="20" r="1" />
            </svg>
            <span
              aria-hidden="true"
              className="absolute -right-0.5 -top-0.5 grid size-[17px] place-items-center rounded-full bg-[#1f6b4f] text-[10px] font-semibold text-white"
            >
              {cartItemCount}
            </span>
          </button>

          <button
            aria-controls="mobile-navigation"
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
            className="inline-flex size-10 items-center justify-center rounded-lg text-[#202522] transition hover:bg-[#eaf3ee] hover:text-[#1f6b4f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1f6b4f] md:hidden"
            onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
            type="button"
          >
            <svg
              aria-hidden="true"
              className="size-6"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path d="m6 6 12 12M18 6 6 18" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      <nav
        aria-label="Navegação móvel"
        className="border-t border-[#e6e7e4] bg-white px-4 py-3 md:hidden"
        hidden={!isMenuOpen}
        id="mobile-navigation"
      >
        <ul className="mx-auto max-w-7xl space-y-1">
          {navigationLinks.map((link) => (
            <li key={link.label}>
              <Link
                className="block rounded-lg px-3 py-3 text-xs font-medium uppercase tracking-[0.06em] text-[#202522] transition hover:bg-[#eaf3ee] hover:text-[#1f6b4f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1f6b4f]"
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
