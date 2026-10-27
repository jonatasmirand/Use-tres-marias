"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useCart } from "@/context/CartContext";
import SearchModal from "@/components/search/SearchModal";

const navigationLinks = [
  { label: "Novidades", href: "/novidades" },
  { label: "Vestidos", href: "/vestidos" },
  { label: "Blusas", href: "/blusas" },
  { label: "Bermudas", href: "/bermudas" },
  { label: "Conjuntos", href: "/conjuntos" },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { openCart, totalCount } = useCart();

  return (
    <>
      {/* Header Principal */}
      <header className="sticky top-0 z-30 border-b border-[#e6e7e4] bg-white">
        <div className="mx-auto grid h-[82px] max-w-[1240px] grid-cols-[auto_1fr_auto] items-center gap-5 px-6 md:grid-cols-[1fr_auto_1fr]">
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

          {/* Logo da loja (lateral esquerda) */}
          <Link
            href="/"
            aria-label="Três Marias — página inicial"
            className="justify-self-center transition hover:opacity-90 md:justify-self-start"
            onClick={() => setIsMenuOpen(false)}
          >
            <Image
              src="/logo-tres-marias.png"
              alt="Três Marias"
              width={1024}
              height={240}
              priority
              className="h-9 w-auto md:h-14"
            />
          </Link>

          {/* Menu de Navegação Desktop (centralizado) */}
          <nav aria-label="Navegação principal" className="hidden md:block">
            <ul className="flex items-center justify-center gap-[26px]">
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

          {/* Botões de Ação à Direita (Busca, Conta e Carrinho/Favoritos) */}
          <div className="flex items-center justify-end gap-[18px]">
            <button
              type="button"
              aria-label="Buscar produtos"
              onClick={() => setIsSearchOpen(true)}
              className="relative p-1 text-[#202522] transition hover:text-[#1f6b4f] cursor-pointer"
            >
              <svg className="size-[20px]" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </button>

            <button
              type="button"
              aria-label="Abrir Sacola de Compras"
              onClick={openCart}
              className="relative p-1 text-[#202522] transition hover:text-[#1f6b4f] cursor-pointer"
            >
              <svg className="size-[21px]" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25c-.669 0-1.189-.578-1.119-1.243l1.263-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119.993z" />
              </svg>
              {totalCount > 0 && (
                <span className="absolute -top-1 -right-1 grid size-[18px] place-items-center rounded-full bg-[#1f6b4f] text-[10px] font-bold text-white shadow-sm transition-transform animate-scale-in">
                  {totalCount}
                </span>
              )}
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
              <li className="pt-2 mt-1 border-t border-[#e6e7e4]">
                <Link
                  href="/sobre"
                  className="block text-xs uppercase tracking-[0.06em] text-[#5f6863] py-1.5 transition hover:text-[#1f6b4f]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link
                  href="/contato"
                  className="block text-xs uppercase tracking-[0.06em] text-[#5f6863] py-1.5 transition hover:text-[#1f6b4f]"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Contato
                </Link>
              </li>
            </ul>
          </nav>
        )}
      </header>

      {/* Modal Interativo de Busca */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}
