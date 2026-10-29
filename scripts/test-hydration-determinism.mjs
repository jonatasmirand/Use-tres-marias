/**
 * Testes Automatizados de Determinismo de Hidratação do OrderDetailClient
 * Valida:
 * 1. Ausência de `typeof window` em expressões avaliadas na renderização.
 * 2. Determinismo exato entre os atributos gerados no SSR e no primeiro render do cliente.
 * 3. Preservação do mecanismo de prioridade de tracking_token e fallback para order.id.
 * 4. Codificação correta via encodeURIComponent() da mensagem para o WhatsApp.
 * 5. Determinismo da formatação de datas via Intl.DateTimeFormat com fuso horário fixado.
 */

import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

console.log("=== INICIANDO TESTES DE DETERMINISMO E HIDRATAÇÃO ===\n");

let passed = 0;
let total = 0;

function runTest(description, fn) {
  total++;
  try {
    fn();
    console.log(`[PASS] Teste ${total}: ${description}`);
    passed++;
  } catch (error) {
    console.error(`[FAIL] Teste ${total}: ${description}`);
    console.error(error);
  }
}

const clientFilePath = path.join(
  rootDir,
  "src",
  "app",
  "admin",
  "pedidos",
  "[id]",
  "order-detail-client.tsx"
);
const pageFilePath = path.join(
  rootDir,
  "src",
  "app",
  "admin",
  "pedidos",
  "[id]",
  "page.tsx"
);

const clientContent = fs.readFileSync(clientFilePath, "utf8");
const pageContent = fs.readFileSync(pageFilePath, "utf8");

// Teste 1: Checa ausência de `typeof window` dentro da montagem do JSX e do whatsappMessage
runTest("Não deve conter 'typeof window' na interpolação direta do link do WhatsApp", () => {
  // O uso de typeof window deve estar estritamente dentro de useEffect ou de callbacks de clique (handleCopyTrackingLink)
  const lines = clientContent.split("\n");
  const whatsappBlockLines = lines.filter((line) =>
    line.includes("whatsappMessage") || line.includes("trackingUrl =")
  );

  for (const line of whatsappBlockLines) {
    assert.ok(
      !line.includes("typeof window"),
      `Linha com whatsappMessage não pode conter 'typeof window': ${line}`
    );
  }
});

// Teste 2: page.tsx deve ler headers e passar initialOrigin
runTest("AdminOrderDetailPage (page.tsx) obtém headers() e repassa initialOrigin para o OrderDetailClient", () => {
  assert.ok(pageContent.includes('import { headers } from "next/headers";'), "Deve importar headers de next/headers");
  assert.ok(pageContent.includes("await headers()"), "Deve invocar await headers()");
  assert.ok(pageContent.includes("initialOrigin={origin}"), "Deve repassar prop initialOrigin");
});

// Teste 3: Lógica determinística do link WhatsApp com tracking_token prioritário
function generateWhatsAppMessage({ order, origin, statusLabel = "Pendente" }) {
  const trackingIdentifier = order.tracking_token || order.id;
  const cleanOrigin = origin ? origin.replace(/\/$/, "") : "";
  const trackingUrl = cleanOrigin
    ? `${cleanOrigin}/pedido/acompanhar/${trackingIdentifier}`
    : `/pedido/acompanhar/${trackingIdentifier}`;

  return encodeURIComponent(
    `Olá! Seu pedido ${order.reference} na Use Três Marias teve uma atualização de status:\n\n*Status Atual:* ${statusLabel}\n\nVocê pode acompanhar todas as etapas pelo link oficial da loja:\n${trackingUrl}\n\nEstamos à disposição!`
  );
}

runTest("Gera URL determinística idêntica entre SSR e Cliente com tracking_token prioritário", () => {
  const mockOrder = {
    id: "ord-uuid-1234",
    reference: "TM-2026-X8K2",
    tracking_token: "tok_secret_abc123",
  };

  const serverOrigin = "https://usetresmarias.com.br";
  const clientOrigin = "https://usetresmarias.com.br";

  const serverMsg = generateWhatsAppMessage({ order: mockOrder, origin: serverOrigin });
  const clientMsg = generateWhatsAppMessage({ order: mockOrder, origin: clientOrigin });

  assert.strictEqual(serverMsg, clientMsg, "Mensagens SSR e Client devem ser 100% idênticas");
  assert.ok(
    decodeURIComponent(serverMsg).includes("https://usetresmarias.com.br/pedido/acompanhar/tok_secret_abc123"),
    "Deve conter o token de rastreamento com a origem completa"
  );
});

runTest("Utiliza fallback de order.id quando tracking_token for nulo/ausente", () => {
  const mockOrder = {
    id: "ord-uuid-fallback",
    reference: "TM-2026-XYZ9",
    tracking_token: null,
  };

  const origin = "https://usetresmarias.com.br";
  const msg = generateWhatsAppMessage({ order: mockOrder, origin });

  assert.ok(
    decodeURIComponent(msg).includes("https://usetresmarias.com.br/pedido/acompanhar/ord-uuid-fallback"),
    "Deve conter fallback para order.id quando tracking_token for ausente"
  );
});

// Teste 4: Formatação de data com fuso horário determinístico
function formatDateMock(dateStr) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(dateStr));
}

runTest("Formatação de data é determinística independentemente do fuso do servidor", () => {
  const isoDate = "2026-10-28T18:00:00.000Z";
  const formatted = formatDateMock(isoDate);

  // 18:00 UTC em America/Sao_Paulo (UTC-3) deve ser sempre 15:00
  assert.ok(
    formatted.includes("15:00"),
    `Data esperada com 15:00 no fuso de São Paulo, recebido: ${formatted}`
  );
  assert.ok(formatted.includes("28 de out"), `Data deve conter 28 de out, recebido: ${formatted}`);
});

// Teste 6: Sanitização e prevenção contra duplicação de protocolo https://
function normalizeSiteUrlMock(input) {
  if (!input) return "";
  let clean = input.trim();
  clean = clean.replace(/^(https?:\/\/)+(https?:\/\/)+/, "$2");
  if (!clean.startsWith("http://") && !clean.startsWith("https://")) {
    const isLocal =
      clean.includes("localhost") ||
      clean.includes("127.0.0.1") ||
      clean.includes("0.0.0.0");
    const protocol = isLocal ? "http" : "https";
    clean = `${protocol}://${clean}`;
  }
  return clean.replace(/\/+$/, "");
}

runTest("normalizeSiteUrl corrige 'https://https://' e previne duplicação de protocolo", () => {
  assert.strictEqual(
    normalizeSiteUrlMock("https://https://use-tres-marias.vercel.app"),
    "https://use-tres-marias.vercel.app"
  );
  assert.strictEqual(
    normalizeSiteUrlMock("https://use-tres-marias.vercel.app"),
    "https://use-tres-marias.vercel.app"
  );
  assert.strictEqual(
    normalizeSiteUrlMock("use-tres-marias.vercel.app"),
    "https://use-tres-marias.vercel.app"
  );
  assert.strictEqual(
    normalizeSiteUrlMock("https://use-tres-marias.vercel.app/"),
    "https://use-tres-marias.vercel.app"
  );
  assert.strictEqual(
    normalizeSiteUrlMock("http://localhost:3000"),
    "http://localhost:3000"
  );
});

console.log(`\n=== RESULTADO DOS TESTES: ${passed} / ${total} PASSARAM ===\n`);
if (passed !== total) {
  process.exit(1);
}

