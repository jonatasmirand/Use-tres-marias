"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Product } from "@/types/catalog";
import { useCart } from "@/context/CartContext";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const POPULAR_SEARCH_TERMS = [
  { label: "Vestidos", term: "vestido" },
  { label: "Linho Puro", term: "linho" },
  { label: "Alfaiataria", term: "alfaiataria" },
  { label: "Conjuntos", term: "conjunto" },
  { label: "Camisas & Blusas", term: "blusa" },
  { label: "Bermudas", term: "bermuda" },
  { label: "Verde Floresta", term: "verde" },
  { label: "Marsala", term: "marsala" },
  { label: "Novidades", term: "novidades" },
];

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Foco automático ao abrir e controle de teclado ESC
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Busca debounced na API
  const performSearch = useCallback(async (searchTerm: string) => {
    const trimmed = searchTerm.trim();
    if (!trimmed) {
      setResults([]);
      setIsLoading(false);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}&limit=12`);
      const data = await res.json();
      if (data.success && Array.isArray(data.products)) {
        setResults(data.products);
      } else {
        setResults([]);
      }
    } catch (err) {
      console.error("Erro ao buscar:", err);
      setResults([]);
    } finally {
      setIsLoading(false);
      setHasSearched(true);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 200);

    return () => clearTimeout(timer);
  }, [query, performSearch]);

  const handleSelectTerm = (term: string) => {
    setQuery(term);
    performSearch(term);
    inputRef.current?.focus();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;
    onClose();
    router.push(`/busca?q=${encodeURIComponent(trimmed)}`);
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, product.sizes?.[0]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Buscar produtos na loja"
      className="fixed inset-0 z-50 flex flex-col justify-start"
    >
      {/* Backdrop suave com desfoque */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
      />

      {/* Container Principal do Modal de Busca */}
      <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col bg-white shadow-2xl md:my-8 md:rounded-3xl border border-[#e6e7e4] overflow-hidden max-h-[92vh]">
        {/* Barra de Busca Superior */}
        <div className="border-b border-[#e6e7e4] p-4 sm:p-6 bg-white sticky top-0 z-20">
          <form onSubmit={handleFormSubmit} className="flex items-center gap-3">
            {/* Ícone de Lupa */}
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#eaf3ee] text-[#1f6b4f] shrink-0">
              <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </div>

            {/* Input de Busca */}
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="O que você procura hoje? (ex: vestido linho, alfaiataria, conjunto...)"
                className="w-full bg-transparent text-sm sm:text-base font-medium text-[#202522] placeholder-[#9ea7a2] focus:outline-none pr-8"
              />

              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setResults([]);
                    setHasSearched(false);
                    inputRef.current?.focus();
                  }}
                  aria-label="Limpar campo de busca"
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-xs font-bold text-[#777d78] hover:text-[#202522] p-1"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Botão Fechar */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar busca"
              className="flex size-10 items-center justify-center rounded-xl border border-[#e6e7e4] text-[#5f6863] transition hover:bg-[#fafbf9] hover:text-[#202522] shrink-0"
            >
              <svg className="size-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </form>

          {/* Sugestões Rápidas de Termos (Pills) */}
          <div className="mt-3.5 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="shrink-0 text-[11px] font-semibold text-[#777d78] uppercase tracking-wider">
              Populares:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
              {POPULAR_SEARCH_TERMS.map((item) => (
                <button
                  key={item.term}
                  type="button"
                  onClick={() => handleSelectTerm(item.term)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition cursor-pointer shrink-0 ${query.toLowerCase() === item.term.toLowerCase()
                      ? "bg-[#1f6b4f] text-white"
                      : "bg-[#faf8f3] text-[#5f6863] border border-[#e6e7e4] hover:border-[#1f6b4f] hover:text-[#1f6b4f]"
                    }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Corpo de Resultados / Estados */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-h-[280px]">
          {/* Carregando */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="size-8 animate-spin rounded-full border-2 border-[#1f6b4f] border-t-transparent mb-3" />
              <p className="text-xs text-[#777d78]">Buscando peças equivalentes...</p>
            </div>
          )}

          {/* Estado Inicial (Sem busca digitada) */}
          {!isLoading && !hasSearched && query.trim() === "" && (
            <div className="py-8 text-center">
              <p className="font-serif text-lg font-normal text-[#202522] mb-1">
                Explore a elegância da useTrêsMarias
              </p>
              <p className="text-xs text-[#777d78] max-w-md mx-auto mb-6">
                Digite palavras-chave como linho, vestidos, conjuntos, alfaiataria ou cores para encontrar a peça perfeita.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
                <button
                  type="button"
                  onClick={() => handleSelectTerm("vestidos")}
                  className="rounded-2xl border border-[#e6e7e4] p-3 text-left hover:border-[#1f6b4f] hover:bg-[#fafbf9] transition group"
                >
                  <span className="block text-xs font-bold text-[#202522] group-hover:text-[#1f6b4f]">
                    Vestidos
                  </span>
                  <span className="text-[11px] text-[#777d78]">Midi, Longos e Evasê</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectTerm("linho")}
                  className="rounded-2xl border border-[#e6e7e4] p-3 text-left hover:border-[#1f6b4f] hover:bg-[#fafbf9] transition group"
                >
                  <span className="block text-xs font-bold text-[#202522] group-hover:text-[#1f6b4f]">
                    Puro Linho
                  </span>
                  <span className="text-[11px] text-[#777d78]">Natural e fresco</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectTerm("alfaiataria")}
                  className="rounded-2xl border border-[#e6e7e4] p-3 text-left hover:border-[#1f6b4f] hover:bg-[#fafbf9] transition group"
                >
                  <span className="block text-xs font-bold text-[#202522] group-hover:text-[#1f6b4f]">
                    Alfaiataria
                  </span>
                  <span className="text-[11px] text-[#777d78]">Cortes estruturados</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectTerm("conjunto")}
                  className="rounded-2xl border border-[#e6e7e4] p-3 text-left hover:border-[#1f6b4f] hover:bg-[#fafbf9] transition group"
                >
                  <span className="block text-xs font-bold text-[#202522] group-hover:text-[#1f6b4f]">
                    Conjuntos
                  </span>
                  <span className="text-[11px] text-[#777d78]">Praticidade e estilo</span>
                </button>
              </div>
            </div>
          )}

          {/* Resultados Encontrados */}
          {!isLoading && hasSearched && results.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-[#5f6863]">
                  {results.length} {results.length === 1 ? "peça encontrada" : "peças encontradas"} para{" "}
                  <strong className="text-[#202522]">&quot;{query}&quot;</strong>
                </span>

                <Link
                  href={`/busca?q=${encodeURIComponent(query)}`}
                  onClick={onClose}
                  className="text-xs font-bold text-[#1f6b4f] hover:underline"
                >
                  Ver todos na página completa →
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {results.map((product) => {
                  const primaryImage =
                    product.images?.[0] ||
                    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80";

                  const formattedPrice = new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(product.price);

                  return (
                    <div
                      key={product.id}
                      className="group flex flex-col rounded-2xl border border-[#e6e7e4] bg-white p-3 transition hover:shadow-md hover:border-[#1f6b4f]/40"
                    >
                      <Link
                        href={`/produto/${product.slug}`}
                        onClick={onClose}
                        className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-[#fafbf9] mb-3"
                      >
                        <img
                          src={primaryImage}
                          alt={product.name}
                          className="size-full object-cover object-top transition duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                        {product.is_new && (
                          <span className="absolute top-2 left-2 rounded-full bg-[#1f6b4f] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-xs">
                            Novidade
                          </span>
                        )}
                      </Link>

                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between gap-1 text-[10px] text-[#777d78] uppercase tracking-wider mb-1">
                            <span>{product.category?.name || "Peça"}</span>
                            {product.sizes && product.sizes.length > 0 && (
                              <span>Tam: {product.sizes.join(", ")}</span>
                            )}
                          </div>

                          <Link
                            href={`/produto/${product.slug}`}
                            onClick={onClose}
                            className="font-serif text-sm font-semibold text-[#202522] line-clamp-1 hover:text-[#1f6b4f] transition"
                          >
                            {product.name}
                          </Link>

                          <div className="mt-1 flex items-baseline gap-1.5">
                            <span className="text-sm font-bold text-[#202522]">
                              {formattedPrice}
                            </span>
                            <span className="text-[10px] text-[#777d78]">
                              em até 6x
                            </span>
                          </div>
                        </div>

                        {/* Ações do Card */}
                        <div className="mt-3 flex items-center gap-2">
                          <Link
                            href={`/produto/${product.slug}`}
                            onClick={onClose}
                            className="flex-1 rounded-xl border border-[#e6e7e4] py-2 text-center text-xs font-semibold text-[#202522] transition hover:bg-[#fafbf9]"
                          >
                            Ver detalhes
                          </Link>

                          <button
                            type="button"
                            onClick={(e) => handleAddToCart(e, product)}
                            aria-label={`Adicionar ${product.name} à sacola`}
                            className="flex items-center justify-center rounded-xl bg-[#1f6b4f] p-2 text-white transition hover:bg-[#164d3a] shrink-0"
                            title="Adicionar à Sacola"
                          >
                            <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Estado Vazio (Sem resultados) */}
          {!isLoading && hasSearched && results.length === 0 && (
            <div className="py-12 text-center">
              <div className="flex size-14 items-center justify-center rounded-full bg-[#f4f5f2] text-xl text-[#777d78] mx-auto mb-3">
                🔍
              </div>
              <h3 className="font-serif text-base font-bold text-[#202522] mb-1">
                Nenhuma peça encontrada para &quot;{query}&quot;
              </h3>
              <p className="text-xs text-[#777d78] max-w-sm mx-auto mb-6">
                Não encontramos correspondências exatas. Experimente buscar por categorias ou tecidos:
              </p>

              <div className="flex flex-wrap items-center justify-center gap-2 max-w-md mx-auto">
                <button
                  type="button"
                  onClick={() => handleSelectTerm("vestidos")}
                  className="rounded-full bg-[#fafbf9] border border-[#e6e7e4] px-3.5 py-1.5 text-xs font-semibold text-[#1f6b4f] hover:bg-[#eaf3ee] transition"
                >
                  Ver Vestidos
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectTerm("linho")}
                  className="rounded-full bg-[#fafbf9] border border-[#e6e7e4] px-3.5 py-1.5 text-xs font-semibold text-[#1f6b4f] hover:bg-[#eaf3ee] transition"
                >
                  Peças em Linho
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectTerm("alfaiataria")}
                  className="rounded-full bg-[#fafbf9] border border-[#e6e7e4] px-3.5 py-1.5 text-xs font-semibold text-[#1f6b4f] hover:bg-[#eaf3ee] transition"
                >
                  Alfaiataria
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectTerm("conjuntos")}
                  className="rounded-full bg-[#fafbf9] border border-[#e6e7e4] px-3.5 py-1.5 text-xs font-semibold text-[#1f6b4f] hover:bg-[#eaf3ee] transition"
                >
                  Conjuntos
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
