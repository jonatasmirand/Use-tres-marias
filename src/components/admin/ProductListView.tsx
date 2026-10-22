"use client";

import { useState } from "react";
import Link from "next/link";
import { Product, Category, CATALOG_CATEGORIES } from "@/types/catalog";

interface ProductListViewProps {
  initialProducts: Product[];
  categories: Category[];
  initialCategorySlug?: string;
}

export default function ProductListView({
  initialProducts,
  categories,
  initialCategorySlug = "todos",
}: ProductListViewProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [activeTab, setActiveTab] = useState<string>(initialCategorySlug);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Filtragem pela aba ativa
  const filteredProducts = products.filter((p) => {
    if (activeTab === "todos") return true;
    return p.category?.slug.toLowerCase() === activeTab.toLowerCase();
  });

  // Contagem por categoria
  const counts: Record<string, number> = {
    todos: products.length,
  };
  CATALOG_CATEGORIES.forEach((cat) => {
    counts[cat.slug] = products.filter((p) => p.category?.slug.toLowerCase() === cat.slug).length;
  });

  async function handleDelete(productId: string, productName: string) {
    const confirmDelete = window.confirm(`Deseja realmente excluir a peça "${productName}"? Esta ação não pode ser desfeita.`);
    if (!confirmDelete) return;

    setDeletingId(productId);
    setFeedback(null);

    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: "DELETE",
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Erro ao excluir produto.");
      }

      setProducts((prev) => prev.filter((p) => p.id !== productId));
      setFeedback({ type: "success", message: `Peça "${productName}" excluída com sucesso.` });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro ao excluir produto.";
      setFeedback({ type: "error", message: msg });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-[1200px] space-y-6">
      {/* Cabeçalho da Gestão de Produtos */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#e6e7e4] pb-4">
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-[#202522] md:text-3xl">
            Catálogo de Produtos
          </h1>
          <p className="mt-1 text-xs text-[#5f6863]">
            Gerencie as peças separadas por tipo de roupa. Cada produto adicionado fica na sua respectiva aba.
          </p>
        </div>

        <Link
          href={`/admin/produtos/novo${activeTab !== "todos" ? `?categoria=${activeTab}` : ""}`}
          className="inline-flex items-center gap-2 rounded-xl bg-[#1f6b4f] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#18563f]"
        >
          <svg className="size-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span>+ Adicionar Produto</span>
        </Link>
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

      {/* Abas por Tipo de Roupa */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#e6e7e4] pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("todos")}
          className={`rounded-xl px-4 py-2 text-xs font-bold transition flex items-center gap-2 ${
            activeTab === "todos"
              ? "bg-[#1f6b4f] text-white shadow-xs"
              : "bg-white text-[#5f6863] border border-[#e6e7e4] hover:bg-[#fafbf9]"
          }`}
        >
          <span>Todas as Peças</span>
          <span
            className={`rounded-full px-1.5 py-0.2 text-[10px] ${
              activeTab === "todos" ? "bg-white/20 text-white" : "bg-[#eaf3ee] text-[#1f6b4f]"
            }`}
          >
            {counts.todos}
          </span>
        </button>

        {CATALOG_CATEGORIES.map((cat) => (
          <button
            key={cat.slug}
            type="button"
            onClick={() => setActiveTab(cat.slug)}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition flex items-center gap-2 ${
              activeTab === cat.slug
                ? "bg-[#1f6b4f] text-white shadow-xs"
                : "bg-white text-[#5f6863] border border-[#e6e7e4] hover:bg-[#fafbf9]"
            }`}
          >
            <span>{cat.label}</span>
            <span
              className={`rounded-full px-1.5 py-0.2 text-[10px] ${
                activeTab === cat.slug ? "bg-white/20 text-white" : "bg-[#eaf3ee] text-[#1f6b4f]"
              }`}
            >
              {counts[cat.slug] || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Lista / Tabela de Produtos */}
      <div className="rounded-2xl border border-[#e6e7e4] bg-white shadow-sm overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-[#777d78]">
            <p className="font-serif text-base text-[#202522]">Nenhum produto cadastrado nesta aba.</p>
            <p className="text-xs mt-1">Clique no botão &quot;Adicionar Produto&quot; para cadastrar uma nova peça aqui.</p>
            <div className="mt-4">
              <Link
                href={`/admin/produtos/novo${activeTab !== "todos" ? `?categoria=${activeTab}` : ""}`}
                className="inline-flex items-center gap-2 rounded-xl bg-[#1f6b4f] px-4 py-2 text-xs font-semibold text-white hover:bg-[#18563f]"
              >
                + Cadastrar Peça nesta Aba
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-[#f0f2f0]">
            {filteredProducts.map((p) => {
              const primaryImg = p.images?.[0] || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80";
              const formattedPrice = new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(p.price);

              return (
                <div
                  key={p.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 gap-4 hover:bg-[#fafbf9] transition"
                >
                  {/* Foto + Nome + Categoria */}
                  <div className="flex items-center gap-4">
                    <img
                      src={primaryImg}
                      alt={p.name}
                      className="size-16 rounded-xl object-cover border border-[#e6e7e4] shrink-0 bg-[#fafbf9]"
                    />

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-serif text-sm font-bold text-[#202522]">
                          {p.name}
                        </h3>

                        {p.is_new && (
                          <span className="rounded-md bg-[#eaf3ee] px-2 py-0.5 text-[10px] font-bold text-[#1f6b4f] uppercase tracking-wider">
                            Novidade
                          </span>
                        )}

                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            p.is_active ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {p.is_active ? "Ativo" : "Inativo"}
                        </span>
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-[#777d78]">
                        <span className="font-semibold text-[#1f6b4f] capitalize">
                          {p.category?.name || "Sem categoria"}
                        </span>
                        <span>•</span>
                        <span className="font-bold text-[#202522]">{formattedPrice}</span>
                        {p.sizes && p.sizes.length > 0 && (
                          <>
                            <span>•</span>
                            <span>Tam: {p.sizes.join(", ")}</span>
                          </>
                        )}
                        <span>•</span>
                        <span>{p.images.length} {p.images.length === 1 ? "foto" : "fotos"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Ações: Editar e Excluir */}
                  <div className="flex items-center gap-2 shrink-0 sm:self-center">
                    <Link
                      href={`/produto/${p.slug}`}
                      target="_blank"
                      className="rounded-lg border border-[#e6e7e4] px-2.5 py-1.5 text-xs text-[#5f6863] hover:text-[#1f6b4f] hover:border-[#1f6b4f]"
                      title="Ver na loja pública"
                    >
                      Loja ↗
                    </Link>

                    <Link
                      href={`/admin/produtos/${p.id}`}
                      className="rounded-lg border border-[#e6e7e4] bg-white px-3 py-1.5 text-xs font-semibold text-[#202522] hover:border-[#1f6b4f] hover:text-[#1f6b4f]"
                    >
                      Editar
                    </Link>

                    <button
                      type="button"
                      disabled={deletingId === p.id}
                      onClick={() => handleDelete(p.id, p.name)}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                    >
                      {deletingId === p.id ? "Excluindo..." : "Excluir"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
