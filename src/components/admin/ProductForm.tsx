"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Product, Category, DEFAULT_SIZES, MAX_PRODUCT_IMAGES } from "@/types/catalog";

interface ProductFormProps {
  initialProduct?: Product;
  categories: Category[];
  defaultCategorySlug?: string;
}

export default function ProductForm({
  initialProduct,
  categories,
  defaultCategorySlug,
}: ProductFormProps) {
  const router = useRouter();

  const isEditing = Boolean(initialProduct);

  // Encontra a categoria inicial
  const matchedCat = defaultCategorySlug
    ? categories.find((c) => c.slug === defaultCategorySlug)
    : null;

  const [name, setName] = useState(initialProduct?.name || "");
  const [price, setPrice] = useState(
    initialProduct?.price ? String(initialProduct.price) : ""
  );
  const [description, setDescription] = useState(initialProduct?.description || "");
  const [categoryId, setCategoryId] = useState(
    initialProduct?.category_id || matchedCat?.id || categories[0]?.id || ""
  );
  const [images, setImages] = useState<string[]>(initialProduct?.images || []);
  const [sizes, setSizes] = useState<string[]>(
    initialProduct?.sizes && initialProduct.sizes.length > 0
      ? initialProduct.sizes
      : ["P", "M", "G"]
  );
  const [customSizeInput, setCustomSizeInput] = useState("");
  const [isNew, setIsNew] = useState(initialProduct?.is_new ?? true);
  const [isActive, setIsActive] = useState(initialProduct?.is_active ?? true);

  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Upload de fotos
  async function handleImageUpload(file: File) {
    if (images.length >= MAX_PRODUCT_IMAGES) {
      setFeedback({ type: "error", message: `Limite máximo de ${MAX_PRODUCT_IMAGES} fotos atingido.` });
      return;
    }

    setIsUploading(true);
    setFeedback(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Erro no upload da imagem.");
      }

      setImages((prev) => [...prev, json.data.url]);
      setFeedback({ type: "success", message: "Foto enviada com sucesso!" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Falha ao enviar foto.";
      setFeedback({ type: "error", message: msg });
    } finally {
      setIsUploading(false);
    }
  }

  function handleRemoveImage(idx: number) {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  }

  function handleMoveImage(from: number, direction: "left" | "right") {
    const to = direction === "left" ? from - 1 : from + 1;
    if (to < 0 || to >= images.length) return;
    const copy = [...images];
    const [item] = copy.splice(from, 1);
    copy.splice(to, 0, item);
    setImages(copy);
  }

  function toggleSize(sz: string) {
    if (sizes.includes(sz)) {
      setSizes(sizes.filter((s) => s !== sz));
    } else {
      setSizes([...sizes, sz]);
    }
  }

  function handleAddCustomSize() {
    const trimmed = customSizeInput.trim().toUpperCase();
    if (!trimmed) return;
    if (!sizes.includes(trimmed)) {
      setSizes([...sizes, trimmed]);
    }
    setCustomSizeInput("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);

    const numPrice = Number(price.replace(",", "."));
    if (!name.trim()) {
      setFeedback({ type: "error", message: "O nome do produto é obrigatório." });
      return;
    }
    if (!numPrice || numPrice <= 0) {
      setFeedback({ type: "error", message: "Informe um preço válido maior que zero." });
      return;
    }
    if (!categoryId) {
      setFeedback({ type: "error", message: "Selecione o tipo de roupa (categoria)." });
      return;
    }
    if (images.length === 0) {
      setFeedback({ type: "error", message: "Adicione pelo menos uma foto do produto." });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: name.trim(),
        price: numPrice,
        description: description.trim(),
        category_id: categoryId,
        images,
        sizes,
        is_new: isNew,
        is_active: isActive,
      };

      const url = isEditing && initialProduct
        ? `/api/admin/products/${initialProduct.id}`
        : "/api/admin/products";

      const res = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.errors ? json.errors.join(", ") : json.error || "Erro ao salvar produto.");
      }

      setFeedback({
        type: "success",
        message: isEditing ? "Produto atualizado com sucesso!" : "Produto cadastrado com sucesso!",
      });

      // Redireciona de volta para a lista da categoria selecionada
      const targetCat = categories.find((c) => c.id === categoryId);
      setTimeout(() => {
        router.push(`/admin/produtos${targetCat ? `?categoria=${targetCat.slug}` : ""}`);
        router.refresh();
      }, 800);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao processar produto.";
      setFeedback({ type: "error", message: msg });
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-[900px] space-y-6">
      {/* Topo com Título e Ações */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#e6e7e4] pb-4">
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-[#202522]">
            {isEditing && initialProduct ? `Editar: ${initialProduct.name}` : "Cadastrar Novo Produto"}
          </h1>
          <p className="mt-1 text-xs text-[#5f6863]">
            Preencha os detalhes, fotos e tamanhos da peça para exibir na vitrine e na página de catálogo.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/produtos"
            className="rounded-xl border border-[#e6e7e4] bg-white px-4 py-2 text-xs font-semibold text-[#5f6863] hover:bg-[#fafbf9]"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || isUploading}
            className="rounded-xl bg-[#1f6b4f] px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-[#18563f] disabled:opacity-60"
          >
            {isSubmitting ? "Salvando..." : isEditing ? "Salvar Alterações" : "Cadastrar Peça"}
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`flex items-start gap-2.5 rounded-xl p-3.5 text-xs ${
            feedback.type === "success"
              ? "border border-[#d2e5db] bg-[#eaf3ee] text-[#1f6b4f]"
              : "border border-red-200 bg-red-50 text-red-800"
          }`}
        >
          <span className="font-bold">{feedback.type === "success" ? "✓" : "⚠"}</span>
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Card 1: Fotos do Produto */}
      <div className="rounded-2xl border border-[#e6e7e4] bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-[#f0f2f0] pb-3">
          <div>
            <h2 className="font-serif text-base font-bold text-[#202522]">
              Fotos do Produto ({images.length}/{MAX_PRODUCT_IMAGES}) *
            </h2>
            <p className="text-[11px] text-[#777d78]">
              A primeira foto será a capa principal. A segunda foto aparece automaticamente ao passar o mouse na vitrine.
            </p>
          </div>

          <label className="cursor-pointer rounded-lg bg-[#eaf3ee] px-3 py-1.5 text-xs font-bold text-[#1f6b4f] hover:bg-[#d8ecdf] transition">
            {isUploading ? "Enviando foto..." : "+ Enviar Foto"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={isUploading || images.length >= MAX_PRODUCT_IMAGES}
              onChange={(e) => {
                if (e.target.files?.[0]) handleImageUpload(e.target.files[0]);
              }}
            />
          </label>
        </div>

        {images.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-[#e6e7e4] p-8 text-center text-[#777d78]">
            <p className="text-xs font-semibold text-[#202522]">Nenhuma foto adicionada ainda.</p>
            <p className="text-[11px] mt-1">Clique no botão acima para enviar fotos da peça do seu computador ou celular.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {images.map((img, idx) => (
              <div
                key={idx}
                className="group relative aspect-[3/4] rounded-xl overflow-hidden border border-[#e6e7e4] bg-[#fafbf9]"
              >
                <img src={img} alt={`Foto ${idx + 1}`} className="size-full object-cover" />

                {idx === 0 && (
                  <span className="absolute top-2 left-2 z-10 rounded-md bg-[#1f6b4f] px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                    Capa
                  </span>
                )}

                {/* Controles de Foto */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2 text-white">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="size-6 rounded-full bg-red-600 flex items-center justify-center text-xs hover:bg-red-700"
                      title="Excluir foto"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="flex justify-between text-xs">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveImage(idx, "left")}
                      className="size-7 rounded-md bg-white/30 flex items-center justify-center hover:bg-white/60 disabled:opacity-20"
                      title="Mover para esquerda"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      disabled={idx === images.length - 1}
                      onClick={() => handleMoveImage(idx, "right")}
                      className="size-7 rounded-md bg-white/30 flex items-center justify-center hover:bg-white/60 disabled:opacity-20"
                      title="Mover para direita"
                    >
                      →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Card 2: Dados Básicos e Categoria */}
      <div className="rounded-2xl border border-[#e6e7e4] bg-white p-6 shadow-sm space-y-5">
        <h2 className="font-serif text-base font-bold text-[#202522]">
          Informações da Peça
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#5f6863]">
              Tipo de Roupa (Aba / Categoria) *
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-xl border border-[#e6e7e4] bg-[#fafbf9] px-3.5 py-2.5 text-xs text-[#202522] focus:border-[#1f6b4f] focus:outline-none capitalize font-semibold"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#5f6863]">
              Preço de Venda (R$) *
            </label>
            <input
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Ex: 389,90"
              className="w-full rounded-xl border border-[#e6e7e4] bg-[#fafbf9] px-3.5 py-2 text-xs font-semibold text-[#202522] focus:border-[#1f6b4f] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#5f6863]">
            Nome do Produto *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Vestido Midi Alfaiataria Marsala"
            className="w-full rounded-xl border border-[#e6e7e4] bg-[#fafbf9] px-3.5 py-2 text-sm text-[#202522] focus:border-[#1f6b4f] focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-[#5f6863]">
            Descrição, Tecido e Caimento
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Confeccionado em alfaiataria premium com toque encorpado, modelagem reta e fenda sutil..."
            className="w-full rounded-xl border border-[#e6e7e4] bg-[#fafbf9] px-3.5 py-2 text-xs text-[#202522] focus:border-[#1f6b4f] focus:outline-none"
          />
        </div>

        {/* Seleção de Tamanhos */}
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#5f6863]">
            Tamanhos Disponíveis
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {DEFAULT_SIZES.map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => toggleSize(sz)}
                className={`min-w-10 h-8 px-2.5 rounded-lg border text-xs font-bold transition ${
                  sizes.includes(sz)
                    ? "border-[#1f6b4f] bg-[#1f6b4f] text-white"
                    : "border-[#e6e7e4] bg-[#fafbf9] text-[#5f6863] hover:border-[#1f6b4f]"
                }`}
              >
                {sz}
              </button>
            ))}

            {/* Tamanhos numéricos comuns para calças/bermudas */}
            {["36", "38", "40", "42", "44"].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => toggleSize(num)}
                className={`min-w-10 h-8 px-2.5 rounded-lg border text-xs font-bold transition ${
                  sizes.includes(num)
                    ? "border-[#1f6b4f] bg-[#1f6b4f] text-white"
                    : "border-[#e6e7e4] bg-[#fafbf9] text-[#5f6863] hover:border-[#1f6b4f]"
                }`}
              >
                {num}
              </button>
            ))}

            {/* Adicionar tamanho customizado */}
            <div className="flex items-center gap-1.5 ml-2">
              <input
                type="text"
                placeholder="Outro"
                value={customSizeInput}
                onChange={(e) => setCustomSizeInput(e.target.value)}
                className="w-16 h-8 rounded-lg border border-[#e6e7e4] px-2 text-xs uppercase"
              />
              <button
                type="button"
                onClick={handleAddCustomSize}
                className="h-8 px-2 rounded-lg bg-[#eaf3ee] text-[#1f6b4f] text-xs font-bold"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Status: Novidade e Ativo */}
        <div className="border-t border-[#f0f2f0] pt-4 grid gap-4 sm:grid-cols-2">
          <label className="flex items-center gap-3 p-3 rounded-xl border border-[#e6e7e4] bg-[#fafbf9] cursor-pointer hover:bg-white transition">
            <input
              type="checkbox"
              checked={isNew}
              onChange={(e) => setIsNew(e.target.checked)}
              className="size-4 accent-[#1f6b4f]"
            />
            <div>
              <p className="text-xs font-bold text-[#202522]">Marcar como Novidade</p>
              <p className="text-[11px] text-[#777d78]">
                Aparece na vitrine &quot;Novidades&quot; da Home e na página /novidades
              </p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 rounded-xl border border-[#e6e7e4] bg-[#fafbf9] cursor-pointer hover:bg-white transition">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="size-4 accent-[#1f6b4f]"
            />
            <div>
              <p className="text-xs font-bold text-[#202522]">Produto Ativo na Loja</p>
              <p className="text-[11px] text-[#777d78]">
                Visível para os clientes comprarem e navegarem
              </p>
            </div>
          </label>
        </div>
      </div>
    </form>
  );
}
