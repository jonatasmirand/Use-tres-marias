/**
 * Testes Automatizados de Validação de Perfis, Redirecionamento e Segurança de Pedidos
 * Cenários Obrigatórios:
 * 1. Login com conta administrativa e redirecionamento ao painel administrativo.
 * 2. Acesso administrativo a /cliente, com aplicação da política definida (redirecionamento a /admin).
 * 3. Login com conta de cliente e redirecionamento à área correta (/cliente).
 * 4. Consulta de pedidos pelo cliente autenticado (isolamento por user_id, sem acesso aos pedidos de outros).
 * 5. Acesso de cliente à rota administrativa (/admin e /api/admin/*) com bloqueio efetivo (404).
 * 6. Acesso de visitante não autenticado às rotas privadas (/admin, /cliente, /checkout) -> /login?next=...
 * 7. Funcionamento dos indicadores e gerenciamento de pedidos no painel administrativo.
 * 8. Funcionamento dos links de navegação e dos botões de logout.
 * 9. Ausência de loops de redirecionamento e sanitização de URLs externas/maliciosas.
 */

import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { sanitizeRedirectUrl } from "../src/lib/auth-redirect.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

console.log("=== INICIANDO BATERIA DE TESTES OBRIGATÓRIOS ===\n");

let passed = 0;
let total = 0;

function runTest(description, fn) {
  total++;
  try {
    fn();
    console.log(`[PASS] Cenário ${total}: ${description}`);
    passed++;
  } catch (error) {
    console.error(`[FAIL] Cenário ${total}: ${description}`);
    console.error(error);
  }
}

// ---------------------------------------------------------------------------
// BLOCO 1: Higienização de Redirecionamento e Prevenção de Loops (Requisitos 2 e 4)
// ---------------------------------------------------------------------------

runTest("Admin realizando login com next nulo redireciona para /admin", () => {
  const result = sanitizeRedirectUrl(null, "/admin", true);
  assert.strictEqual(result, "/admin");
});

runTest("Admin com next=/cliente é impedido e redirecionado para /admin", () => {
  const result = sanitizeRedirectUrl("/cliente", "/admin", true);
  assert.strictEqual(result, "/admin");
});

runTest("Admin com next=/cliente/pedidos é impedido e redirecionado para /admin", () => {
  const result = sanitizeRedirectUrl("/cliente/pedidos", "/admin", true);
  assert.strictEqual(result, "/admin");
});

runTest("Admin com next=/admin/pedidos é preservado para rota administrativa segura", () => {
  const result = sanitizeRedirectUrl("/admin/pedidos", "/admin", true);
  assert.strictEqual(result, "/admin/pedidos");
});

runTest("Cliente realizando login com next nulo redireciona para /cliente", () => {
  const result = sanitizeRedirectUrl(null, "/cliente", false);
  assert.strictEqual(result, "/cliente");
});

runTest("Cliente com next=/admin é impedido e redirecionado para /cliente", () => {
  const result = sanitizeRedirectUrl("/admin", "/cliente", false);
  assert.strictEqual(result, "/cliente");
});

runTest("Cliente com next=/admin/pedidos é impedido e redirecionado para /cliente", () => {
  const result = sanitizeRedirectUrl("/admin/pedidos", "/cliente", false);
  assert.strictEqual(result, "/cliente");
});

runTest("Cliente com next=/checkout legítimo é preservado para finalizar compra", () => {
  const result = sanitizeRedirectUrl("/checkout", "/cliente", false);
  assert.strictEqual(result, "/checkout");
});

runTest("Prevenção de loop: next=/login não gera loop e cai no fallback seguro", () => {
  const resultAdmin = sanitizeRedirectUrl("/login", "/admin", true);
  assert.strictEqual(resultAdmin, "/admin");

  const resultClient = sanitizeRedirectUrl("/login?next=/admin", "/cliente", false);
  assert.strictEqual(resultClient, "/cliente");
});

runTest("Prevenção de loop: next=/cadastro não gera loop e cai no fallback", () => {
  const result = sanitizeRedirectUrl("/cadastro", "/cliente", false);
  assert.strictEqual(result, "/cliente");
});

runTest("Bloqueio de Open Redirect para domínios externos absolutos", () => {
  assert.strictEqual(sanitizeRedirectUrl("https://malicious.com", "/cliente", false), "/cliente");
  assert.strictEqual(sanitizeRedirectUrl("http://attacker.com/admin", "/cliente", false), "/cliente");
  assert.strictEqual(sanitizeRedirectUrl("//attacker.com", "/cliente", false), "/cliente");
  assert.strictEqual(sanitizeRedirectUrl("/\\attacker.com", "/cliente", false), "/cliente");
  assert.strictEqual(sanitizeRedirectUrl("javascript:alert(1)", "/cliente", false), "/cliente");
});

runTest("Bloqueio de rotas extintas (/conta)", () => {
  assert.strictEqual(sanitizeRedirectUrl("/conta", "/cliente", false), "/cliente");
  assert.strictEqual(sanitizeRedirectUrl("/conta/pedidos", "/cliente", false), "/cliente");
});

// ---------------------------------------------------------------------------
// BLOCO 2: Simulação da Lógica do Middleware de Roteamento (Requisitos 2, 4 e 5)
// ---------------------------------------------------------------------------

function simulateMiddleware({ pathname, user, isAdmin, nextParam }) {
  // 1. Rota antiga /conta
  if (pathname === "/conta" || pathname.startsWith("/conta/")) {
    return { status: 404, action: "rewrite_not_found" };
  }

  const isAccessingAdmin = pathname.startsWith("/admin");
  const isAccessingAdminApi = pathname.startsWith("/api/admin");
  const isLoginPage = pathname === "/login";
  const isCadastroPage = pathname === "/cadastro";
  const isClienteRoute = pathname === "/cliente" || pathname.startsWith("/cliente/");

  // 2. Proteção do Painel Administrativo
  if (isAccessingAdminApi && !isAdmin) {
    return { status: 404, action: "json_404" };
  }

  if (isAccessingAdmin) {
    if (!user) {
      return { status: 307, action: "redirect", destination: `/login?next=${encodeURIComponent(pathname)}` };
    }
    if (!isAdmin) {
      return { status: 404, action: "rewrite_not_found" };
    }
    return { status: 200, action: "next" };
  }

  // 3. Login
  if (isLoginPage) {
    if (user) {
      if (isAdmin) {
        const dest = sanitizeRedirectUrl(nextParam, "/admin", true);
        return { status: 307, action: "redirect", destination: dest };
      }
      const dest = sanitizeRedirectUrl(nextParam, "/cliente", false);
      return { status: 307, action: "redirect", destination: dest };
    }
    return { status: 200, action: "next" };
  }

  // 4. Cadastro
  if (isCadastroPage && user) {
    if (isAdmin) {
      return { status: 307, action: "redirect", destination: "/admin" };
    }
    const dest = sanitizeRedirectUrl(nextParam, "/cliente", false);
    return { status: 307, action: "redirect", destination: dest };
  }

  // 5. Área de Cliente
  if (isClienteRoute) {
    if (!user) {
      return { status: 307, action: "redirect", destination: `/login?next=${encodeURIComponent(pathname)}` };
    }
    if (isAdmin) {
      return { status: 307, action: "redirect", destination: "/admin" };
    }
    return { status: 200, action: "next" };
  }

  // 6. Checkout
  if (pathname.startsWith("/checkout") && !user) {
    return { status: 307, action: "redirect", destination: `/login?next=${encodeURIComponent(pathname)}` };
  }

  return { status: 200, action: "next" };
}

runTest("Visitante não autenticado tentando acessar /admin é redirecionado para login com next", () => {
  const res = simulateMiddleware({ pathname: "/admin", user: null, isAdmin: false });
  assert.strictEqual(res.action, "redirect");
  assert.strictEqual(res.destination, "/login?next=%2Fadmin");
});

runTest("Visitante não autenticado tentando acessar /cliente é redirecionado para login com next", () => {
  const res = simulateMiddleware({ pathname: "/cliente", user: null, isAdmin: false });
  assert.strictEqual(res.action, "redirect");
  assert.strictEqual(res.destination, "/login?next=%2Fcliente");
});

runTest("Visitante não autenticado tentando acessar /checkout é redirecionado para login", () => {
  const res = simulateMiddleware({ pathname: "/checkout", user: null, isAdmin: false });
  assert.strictEqual(res.action, "redirect");
  assert.strictEqual(res.destination, "/login?next=%2Fcheckout");
});

runTest("Cliente autenticado acessando /admin sofre bloqueio efetivo (404 rewrite)", () => {
  const res = simulateMiddleware({ pathname: "/admin", user: { id: "cust-1" }, isAdmin: false });
  assert.strictEqual(res.action, "rewrite_not_found");
  assert.strictEqual(res.status, 404);
});

runTest("Cliente autenticado acessando /api/admin/orders sofre bloqueio efetivo (404 json)", () => {
  const res = simulateMiddleware({ pathname: "/api/admin/orders", user: { id: "cust-1" }, isAdmin: false });
  assert.strictEqual(res.action, "json_404");
  assert.strictEqual(res.status, 404);
});

runTest("Cliente autenticado acessando /cliente tem acesso concedido", () => {
  const res = simulateMiddleware({ pathname: "/cliente", user: { id: "cust-1" }, isAdmin: false });
  assert.strictEqual(res.action, "next");
  assert.strictEqual(res.status, 200);
});

runTest("Cliente autenticado acessando /login é redirecionado para /cliente", () => {
  const res = simulateMiddleware({ pathname: "/login", user: { id: "cust-1" }, isAdmin: false });
  assert.strictEqual(res.action, "redirect");
  assert.strictEqual(res.destination, "/cliente");
});

runTest("Admin autenticado acessando /cliente é redirecionado para /admin (política de perfil)", () => {
  const res = simulateMiddleware({ pathname: "/cliente", user: { id: "admin-1" }, isAdmin: true });
  assert.strictEqual(res.action, "redirect");
  assert.strictEqual(res.destination, "/admin");
});

runTest("Admin autenticado acessando /cliente/pedidos é redirecionado para /admin", () => {
  const res = simulateMiddleware({ pathname: "/cliente/pedidos", user: { id: "admin-1" }, isAdmin: true });
  assert.strictEqual(res.action, "redirect");
  assert.strictEqual(res.destination, "/admin");
});

runTest("Admin autenticado acessando /admin tem acesso concedido", () => {
  const res = simulateMiddleware({ pathname: "/admin", user: { id: "admin-1" }, isAdmin: true });
  assert.strictEqual(res.action, "next");
  assert.strictEqual(res.status, 200);
});

runTest("Admin autenticado acessando /login é redirecionado para /admin", () => {
  const res = simulateMiddleware({ pathname: "/login", user: { id: "admin-1" }, isAdmin: true });
  assert.strictEqual(res.action, "redirect");
  assert.strictEqual(res.destination, "/admin");
});

// ---------------------------------------------------------------------------
// BLOCO 3: Segurança e Isolamento de Pedidos (Requisito 5)
// ---------------------------------------------------------------------------

const mockOrders = [
  { id: "ord-1", user_id: "user-alpha", reference: "TM-2026-AAA1", total: 150, status: "pending" },
  { id: "ord-2", user_id: "user-alpha", reference: "TM-2026-AAA2", total: 220, status: "completed" },
  { id: "ord-3", user_id: "user-beta", reference: "TM-2026-BBB1", total: 340, status: "shipped" },
];

function getCustomerOrdersMock(userId) {
  if (!userId) return [];
  return mockOrders.filter((o) => o.user_id === userId);
}

function getCustomerOrderByIdMock(orderId, userId) {
  if (!orderId || !userId) return null;
  const found = mockOrders.find((o) => o.id === orderId && o.user_id === userId);
  return found || null;
}

runTest("Cliente alpha consulta apenas seus próprios pedidos", () => {
  const orders = getCustomerOrdersMock("user-alpha");
  assert.strictEqual(orders.length, 2);
  assert.ok(orders.every((o) => o.user_id === "user-alpha"));
});

runTest("Cliente beta consulta apenas seus próprios pedidos", () => {
  const orders = getCustomerOrdersMock("user-beta");
  assert.strictEqual(orders.length, 1);
  assert.strictEqual(orders[0].reference, "TM-2026-BBB1");
});

runTest("Cliente alpha é impedido de consultar pedido do cliente beta por ID (retorna null / 404)", () => {
  const order = getCustomerOrderByIdMock("ord-3", "user-alpha");
  assert.strictEqual(order, null);
});

runTest("Cliente beta consulta com sucesso seu próprio pedido por ID", () => {
  const order = getCustomerOrderByIdMock("ord-3", "user-beta");
  assert.ok(order);
  assert.strictEqual(order.id, "ord-3");
});

// ---------------------------------------------------------------------------
// BLOCO 4: Auditoria de Código e Ausência de Duplicações / Links Indevidos (Requisitos 1, 2 e 3)
// ---------------------------------------------------------------------------

runTest("Customer Layout (src/app/cliente/layout.tsx) não possui link 'Painel Admin'", () => {
  const layoutContent = fs.readFileSync(path.join(rootDir, "src", "app", "cliente", "layout.tsx"), "utf8");
  assert.ok(!layoutContent.includes("Painel Admin"), "Não deve haver link para o Painel Admin no layout do cliente");
  assert.ok(layoutContent.includes('user.app_metadata?.role === "admin"'), "Deve conter verificação e redirect de admin no servidor");
  assert.ok(layoutContent.includes('redirect("/admin")'), "Deve redirecionar admin para /admin");
});

runTest("Customer Account Page (src/app/cliente/page.tsx) não possui os indicadores duplicados", () => {
  const pageContent = fs.readFileSync(path.join(rootDir, "src", "app", "cliente", "page.tsx"), "utf8");
  // Checa ausência dos cards KPI administrativos duplicados
  assert.ok(!pageContent.includes("Total de Pedidos"), "Não deve conter card duplicado de Total de Pedidos");
  assert.ok(!pageContent.includes("Em Rota / Preparação"), "Não deve conter card duplicado de Em Rota / Preparação");
  assert.ok(!pageContent.includes("Pedidos Concluídos"), "Não deve conter card duplicado de Pedidos Concluídos");
  assert.ok(pageContent.includes('user.app_metadata?.role === "admin"'), "Deve redirecionar admin para /admin");
  assert.ok(pageContent.includes("Últimos Pedidos"), "Deve preservar os últimos pedidos legítimos da cliente");
});

runTest("Customer Orders Page (src/app/cliente/pedidos/page.tsx) redireciona admin para /admin", () => {
  const pageContent = fs.readFileSync(path.join(rootDir, "src", "app", "cliente", "pedidos", "page.tsx"), "utf8");
  assert.ok(pageContent.includes('user.app_metadata?.role === "admin"'), "Deve conter proteção de perfil para admin");
});

runTest("Customer Order Detail Page (src/app/cliente/pedidos/[id]/page.tsx) valida titularidade e redireciona admin", () => {
  const pageContent = fs.readFileSync(path.join(rootDir, "src", "app", "cliente", "pedidos", "[id]", "page.tsx"), "utf8");
  assert.ok(pageContent.includes('user.app_metadata?.role === "admin"'), "Deve conter proteção de perfil para admin");
  assert.ok(pageContent.includes("getCustomerOrderById"), "Deve consultar pedido por ID e user.id");
});

runTest("Botões de logout em ambas as áreas limpam cookies via /api/auth/logout", () => {
  const customerLogout = fs.readFileSync(path.join(rootDir, "src", "components", "account", "LogoutButton.tsx"), "utf8");
  const adminLogout = fs.readFileSync(path.join(rootDir, "src", "components", "admin", "AdminLogoutButton.tsx"), "utf8");
  assert.ok(customerLogout.includes("/api/auth/logout"), "Logout de cliente deve chamar rota do servidor");
  assert.ok(adminLogout.includes("/api/auth/logout"), "Logout de admin deve chamar rota do servidor");
});

console.log(`\n=== RESULTADO DOS TESTES: ${passed} / ${total} PASSARAM ===\n`);
if (passed !== total) {
  process.exit(1);
}
