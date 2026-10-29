import { Suspense } from "react";
import { connection } from "next/server";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { getPublicOrderTracking } from "@/services/order-service";
import { OrderStatus } from "@/types/order";

type RouteContext = {
  params: Promise<{ token: string }>;
};

export async function generateMetadata({
  params,
}: RouteContext): Promise<Metadata> {
    await connection();
  const { token } = await params;
  const tracking = await getPublicOrderTracking(token);

  if (!tracking) {
    return {
      title: "Acompanhamento de Pedido | useTrêsMarias",
      description: "Consulte o status do seu pedido na Use Três Marias.",
    };
  }

  return {
    title: `Pedido ${tracking.reference} — Acompanhamento | useTrêsMarias`,
    description: `Acompanhe o andamento do pedido ${tracking.reference} na Use Três Marias. Status atual: ${tracking.status_info.label}.`,
  };
}

export default function OrderTrackingPage({
  params,
}: RouteContext) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#fcfaf7] flex flex-col justify-between">
          <Header />
          <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-24 flex flex-col items-center justify-center text-center">
            <div className="size-10 border-2 border-[#183428] border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-[#5f6863] text-sm font-medium">
              Carregando status do pedido...
            </p>
          </main>
          <Footer />
        </div>
      }
    >
      <OrderTrackingContent params={params} />
    </Suspense>
  );
}

async function OrderTrackingContent({ params }: RouteContext) {
  // Impede a pré-renderização estática deste conteúdo.
  // O horário atual e os dados do pedido serão avaliados na requisição.
  await connection();

  const { token } = await params;
  const tracking = await getPublicOrderTracking(token);

  if (!tracking) {
    return (
      <>
        <Header />
        <main className="flex-1 bg-[#fbf9f6] py-16 px-6">
          <div className="mx-auto max-w-[540px] text-center bg-white rounded-3xl p-8 sm:p-12 border border-[#e6e7e4] shadow-sm">
            <div className="size-16 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center text-2xl mx-auto mb-4">
              🔍
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#202522] mb-3">
              Pedido não encontrado
            </h1>

            <p className="text-[14px] text-[#5f6863] leading-relaxed mb-6">
              Não encontramos nenhum pedido com esse link de acompanhamento.
              Verifique se o endereço foi digitado corretamente ou entre em
              contato com nossa equipe.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/contato"
                className="w-full sm:w-auto px-6 py-3 bg-[#183428] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition hover:bg-[#10241b]"
              >
                Falar com Atendimento
              </Link>

              <Link
                href="/"
                className="w-full sm:w-auto px-6 py-3 border border-[#e6e7e4] text-[#202522] text-xs font-semibold uppercase tracking-wider rounded-xl transition hover:bg-[#fafbf9]"
              >
                Voltar à Loja
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const statusInfo = tracking.status_info;
  const currentStep = statusInfo.stepNumber;

  const stepsList: Array<{
    status: OrderStatus;
    label: string;
    step: number;
  }> = [
    { status: "pending", label: "Pendente", step: 1 },
    { status: "in_progress", label: "Em andamento", step: 2 },
    { status: "on_the_way", label: "A caminho", step: 3 },
    { status: "completed", label: "Finalizado", step: 4 },
  ];

  const formattedCreatedDate = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(tracking.created_at));

  const formattedUpdatedDate = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(tracking.updated_at));

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);

  const whatsappSupportUrl = `https://wa.me/5511999999999?text=${encodeURIComponent(
    `Olá, equipe useTrêsMarias! Gostaria de falar sobre o meu pedido ${tracking.reference}.`
  )}`;

  return (
    <>
      <Header />

      <main className="flex-1 bg-[#fcfbf9] py-10 sm:py-16 px-4 sm:px-6">
        <div className="mx-auto max-w-[840px] space-y-6 sm:space-y-8">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e8dfd3] shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#7a857f]">
                  Acompanhamento de Compra
                </span>
              </div>

              <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#182620]">
                Pedido {tracking.reference}
              </h1>

              <p className="text-xs text-[#7a857f] mt-1">
                Registrado em {formattedCreatedDate}
              </p>
            </div>

            <div className="sm:text-right flex flex-col sm:items-end gap-1">
              <span
                className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold border ${statusInfo.badgeClass}`}
              >
                <span className="size-2 rounded-full bg-current animate-pulse" />
                <span>{statusInfo.label}</span>
              </span>

              <span className="text-[11px] text-[#7a857f]">
                Última atualização: {formattedUpdatedDate}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e8dfd3] shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-[0.15em] text-[#7a857f] mb-6 sm:mb-8 text-center sm:text-left">
              Progresso do seu Pedido
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-2 relative">
              {stepsList.map((s) => {
                const isPassed = s.step < currentStep;
                const isCurrent = s.step === currentStep;

                return (
                  <div
                    key={s.status}
                    className="flex flex-col items-center text-center relative z-10"
                  >
                    <div
                      className={`size-11 sm:size-12 rounded-full flex items-center justify-center font-bold text-sm transition-all shadow-xs mb-3 ${
                        isCurrent
                          ? "bg-[#183428] text-white ring-4 ring-[#183428]/15"
                          : isPassed
                          ? "bg-[#eaf3ee] text-[#1f6b4f] border border-[#b2d3c2]"
                          : "bg-[#f4f5f2] text-[#8e9892] border border-[#e2e4e0]"
                      }`}
                    >
                      {isPassed ? (
                        <svg
                          className="size-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          viewBox="0 0 24 24"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <span>{s.step}</span>
                      )}
                    </div>

                    <span
                      className={`text-xs font-semibold ${
                        isCurrent
                          ? "text-[#183428] font-bold"
                          : isPassed
                          ? "text-[#202522]"
                          : "text-[#8e9892]"
                      }`}
                    >
                      {s.label}
                    </span>

                    {isCurrent && (
                      <span className="mt-1 text-[10px] uppercase font-bold tracking-wider text-[#1f6b4f] bg-[#eaf3ee] px-2 py-0.5 rounded-full">
                        Etapa Atual
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-8 rounded-2xl bg-[#faf7f2] border border-[#e8dfd3] p-5 sm:p-6 text-center sm:text-left flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div className="size-10 rounded-xl bg-white border border-[#e8dfd3] text-lg flex items-center justify-center shrink-0 text-[#183428]">
                💬
              </div>

              <div className="flex-1 space-y-1">
                <h3 className="font-serif text-base font-bold text-[#182620]">
                  O que significa este status?
                </h3>

                <p className="text-[13px] sm:text-[14px] leading-relaxed text-[#4a544e]">
                  {statusInfo.description}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e8dfd3] shadow-sm">
            <h2 className="font-serif text-xl font-bold text-[#182620] mb-6">
              Itens do Pedido ({tracking.items.length})
            </h2>

            <div className="divide-y divide-[#f0f2f0]">
              {tracking.items.map((item) => (
                <div
                  key={item.id}
                  className="py-4.5 flex items-center gap-4"
                >
                  {item.image_url ? (
                    <div className="size-18 sm:size-20 rounded-xl overflow-hidden bg-[#fafbf9] border border-[#e6e7e4] shrink-0 relative">
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        fill
                        className="object-cover object-top"
                        sizes="80px"
                      />
                    </div>
                  ) : (
                    <div className="size-18 sm:size-20 rounded-xl bg-[#fafbf9] border border-[#e6e7e4] flex items-center justify-center text-xs text-[#7a857f] shrink-0">
                      Sem foto
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-[#182620] truncate">
                      {item.name}
                    </h3>

                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] font-semibold text-[#5f6863] bg-[#fafbf9] border border-[#e6e7e4] px-2 py-0.5 rounded-md">
                        Tam: {item.size}
                      </span>

                      <span className="text-xs text-[#7a857f]">
                        Qtd: {item.quantity}
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-[#182620]">
                      {formatCurrency(item.subtotal)}
                    </p>

                    {item.quantity > 1 && (
                      <p className="text-[11px] text-[#7a857f]">
                        {formatCurrency(item.price)} cada
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-[#e8dfd3] space-y-2">
              <div className="flex justify-between text-xs text-[#5f6863]">
                <span>Subtotal dos itens</span>
                <span className="font-semibold text-[#182620]">
                  {formatCurrency(tracking.subtotal)}
                </span>
              </div>

              {tracking.frete > 0 && (
                <div className="flex justify-between text-xs text-[#5f6863]">
                  <span>Frete</span>
                  <span className="font-semibold text-[#182620]">
                    {formatCurrency(tracking.frete)}
                  </span>
                </div>
              )}

              {tracking.discount > 0 && (
                <div className="flex justify-between text-xs text-emerald-700">
                  <span>Desconto aplicado</span>
                  <span className="font-semibold">
                    -{formatCurrency(tracking.discount)}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-base font-bold text-[#182620] pt-2 border-t border-[#f0f2f0]">
                <span>Total</span>
                <span>{formatCurrency(tracking.total)}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#183428] text-white rounded-3xl p-6 sm:p-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-md">
            <div className="space-y-1 max-w-md">
              <h3 className="font-serif text-xl sm:text-2xl font-light">
                Precisa de ajuda com este pedido?
              </h3>

              <p className="text-xs sm:text-[13px] text-[#b8c9c0] leading-relaxed">
                Nossa equipe está disponível para tirar dúvidas sobre o envio,
                pagamento ou atualização do seu endereço pelo WhatsApp.
              </p>
            </div>

            <a
              href={whatsappSupportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-sm hover:shadow-md shrink-0 flex items-center gap-2"
            >
              <span>Falar no WhatsApp</span>
              <span>→</span>
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}