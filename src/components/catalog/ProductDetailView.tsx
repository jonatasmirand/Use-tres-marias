"use client";

import { useState } from "react";
import Link from "next/link";
import { Product } from "@/types/catalog";

interface ProductDetailViewProps {
  product: Product;
}

export default function ProductDetailView({ product }: ProductDetailViewProps) {
  const images = product.images.length > 0 ? product.images : [
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
  ];

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(
    product.sizes?.[0] || null
  );
  const [addedNotice, setAddedNotice] = useState(false);

  const formattedPrice = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(product.price);

  const installmentValue = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(product.price / 6);

  function handleAddToCart() {
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 3000);
  }

  const whatsappMessage = encodeURIComponent(
    `Olá! Gostei do ${product.name} (R$ ${product.price.toFixed(2)})${
      selectedSize ? ` no tamanho ${selectedSize}` : ""
    } na Use Três Marias e gostaria de mais informações.`
  );

  return (
    <div className="mx-auto max-w-[1240px] px-6 py-8 md:py-14">
      {/* Breadcrumb */}
      <nav aria-label="Navegação estrutural" className="mb-6 text-xs text-[#777d78]">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/" className="hover:text-[#1f6b4f] transition">
              Início
            </Link>
          </li>
          <li>/</li>
          {product.category && (
            <>
              <li>
                <Link
                  href={`/${product.category.slug}`}
                  className="hover:text-[#1f6b4f] transition capitalize"
                >
                  {product.category.name}
                </Link>
              </li>
              <li>/</li>
            </>
          )}
          <li className="font-semibold text-[#202522] line-clamp-1">{product.name}</li>
        </ol>
      </nav>

      <div className="grid gap-10 lg:grid-cols-12">
        {/* Galeria de Fotos (Desktop e Mobile) */}
        <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-4">
          {/* Miniaturas */}
          {images.length > 1 && (
            <div className="flex md:flex-col gap-2.5 overflow-x-auto md:overflow-y-auto max-h-[560px] shrink-0">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImage(idx)}
                  className={`size-16 sm:size-20 overflow-hidden rounded-lg border-2 transition ${
                    selectedImage === idx
                      ? "border-[#1f6b4f] shadow-sm"
                      : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt={`Foto ${idx + 1}`} className="size-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Imagem Principal */}
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-[#fafbf9] border border-[#e6e7e4]">
            <img
              src={images[selectedImage]}
              alt={product.name}
              className="size-full object-cover object-top"
            />
            {product.is_new && (
              <span className="absolute top-4 left-4 rounded-full bg-[#1f6b4f] px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-md">
                Novidade
              </span>
            )}
          </div>
        </div>

        {/* Informações de Compra e Detalhes */}
        <div className="lg:col-span-5 flex flex-col justify-start">
          {product.category && (
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1f6b4f] mb-1">
              {product.category.name}
            </span>
          )}

          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-normal text-[#202522] leading-tight">
            {product.name}
          </h1>

          <div className="mt-4 border-b border-[#e6e7e4] pb-5">
            <div className="flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-bold text-[#202522]">
                {formattedPrice}
              </span>
            </div>
            <p className="mt-1 text-xs text-[#777d78]">
              ou até <strong className="text-[#202522]">6x de {installmentValue}</strong> sem juros
            </p>
          </div>

          {/* Seletor de Tamanhos */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#202522]">
                  Tamanho: {selectedSize}
                </span>
                <span className="text-[11px] text-[#777d78]">Guia de Medidas</span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {product.sizes.map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => setSelectedSize(sz)}
                    className={`min-w-12 h-10 px-3 rounded-xl border text-xs font-bold transition ${
                      selectedSize === sz
                        ? "border-[#1f6b4f] bg-[#1f6b4f] text-white shadow-sm"
                        : "border-[#e6e7e4] bg-white text-[#202522] hover:border-[#1f6b4f]"
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="mt-8 flex flex-col gap-3">
            <button
              type="button"
              onClick={handleAddToCart}
              className="w-full rounded-xl bg-[#1f6b4f] py-3.5 text-xs font-bold uppercase tracking-widest text-white shadow-md transition hover:bg-[#18563f] hover:shadow-lg active:scale-[0.99]"
            >
              Adicionar à Sacola
            </button>

            <a
              href={`https://wa.me/5511999999999?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-center rounded-xl border border-[#d2e5db] bg-[#eaf3ee] py-3 text-xs font-bold uppercase tracking-widest text-[#1f6b4f] transition hover:bg-[#d8ecdf]"
            >
              Comprar pelo WhatsApp →
            </a>
          </div>

          {addedNotice && (
            <div className="mt-3 rounded-xl border border-[#d2e5db] bg-[#eaf3ee] p-3 text-center text-xs font-semibold text-[#1f6b4f] animate-fade-in">
              ✓ Produto adicionado à sua sacola de compras!
            </div>
          )}

          {/* Descrição */}
          {product.description && (
            <div className="mt-8 border-t border-[#e6e7e4] pt-6">
              <h2 className="font-serif text-base font-bold text-[#202522] mb-2">
                Detalhes & Caimento
              </h2>
              <p className="text-xs sm:text-sm leading-relaxed text-[#5f6863] whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {/* Garantias & Benefícios da Marca */}
          <div className="mt-8 rounded-xl bg-[#fafbf9] border border-[#e6e7e4] p-4 text-xs text-[#5f6863] space-y-2.5">
            <div className="flex items-center gap-2.5">
              <span className="text-[#1f6b4f] font-bold">✓</span>
              <span>Envio para todo o Brasil com código de rastreamento</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-[#1f6b4f] font-bold">✓</span>
              <span>Primeira troca grátis em até 7 dias após o recebimento</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-[#1f6b4f] font-bold">✓</span>
              <span>Peças exclusivas confeccionadas com acabamento de alfaiataria</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
