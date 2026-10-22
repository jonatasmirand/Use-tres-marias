"use client";

import { useState } from "react";
import Link from "next/link";
import { Product } from "@/types/catalog";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const primaryImage = product.images?.[0] || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&q=80";
  const secondaryImage = product.images?.[1] || primaryImage;

  const formattedPrice = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(product.price);

  return (
    <article
      className="group relative flex flex-col w-full max-w-[340px] text-left transition-all"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Imagem do Produto */}
      <Link
        href={`/produto/${product.slug}`}
        aria-label={`Ver detalhes de ${product.name}`}
        className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-[#f4f5f2] border border-[#e6e7e4]"
      >
        <img
          src={isHovered && secondaryImage ? secondaryImage : primaryImage}
          alt={product.name}
          className="size-full object-cover object-top transition-all duration-500 ease-out group-hover:scale-105"
          loading="lazy"
        />

        {/* Badge de Novidade */}
        {product.is_new && (
          <span className="absolute top-3 left-3 z-10 rounded-full bg-[#1f6b4f] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
            Novidade
          </span>
        )}

        {/* Categoria sutil */}
        {product.category && (
          <span className="absolute bottom-3 left-3 z-10 rounded-md bg-white/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#202522] backdrop-blur-xs">
            {product.category.name}
          </span>
        )}
      </Link>

      {/* Detalhes do Produto */}
      <div className="mt-3 flex flex-col gap-1">
        <Link
          href={`/produto/${product.slug}`}
          className="font-serif text-base font-medium text-[#202522] transition group-hover:text-[#1f6b4f] line-clamp-1"
        >
          {product.name}
        </Link>

        {/* Tamanhos disponíveis */}
        {product.sizes && product.sizes.length > 0 && (
          <div className="flex flex-wrap gap-1 text-[11px] text-[#777d78]">
            <span>Tam:</span>
            {product.sizes.map((sz) => (
              <span key={sz} className="font-semibold text-[#5f6863]">
                {sz}
              </span>
            ))}
          </div>
        )}

        {/* Preço */}
        <div className="mt-1 flex items-baseline gap-2">
          <span className="font-sans text-base font-bold text-[#202522]">
            {formattedPrice}
          </span>
          <span className="text-[11px] text-[#777d78]">
            em até 6x sem juros
          </span>
        </div>
      </div>
    </article>
  );
}
