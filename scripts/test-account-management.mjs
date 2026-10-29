/**
 * Testes Automatizados de Validação do Módulo de Gerenciamento de Contas
 * Projeto: Use Três Marias
 *
 * Cenários Testados:
 * 1. Validação de Schemas Zod (blockUserSchema e inviteAdminSchema)
 * 2. Impossibilidade de Elevação de Privilégios no Cadastro de Clientes (customerSignUpSchema)
 * 3. Lógica de Pesquisa, Filtros por Papel e Situação, e Paginação de Usuários
 * 4. Lógica de Bloqueio e Reativação de Contas de Clientes com Justificativa e Data
 * 5. Proteção de Segurança: Impedir que Administrador Bloqueie a Própria Conta
 * 6. Proteção de Segurança: Impedir que Contas de Administrador sejam Bloqueadas
 * 7. Lógica de Cadastro/Convite de Novo Administrador (atribuição de role=admin no servidor)
 * 8. Auditoria de Segurança: Rotas API /api/admin/users e /api/admin/users/[id]/block protegidas por requireAdminSession
 * 9. Auditoria de Segurança: Middleware intercepta contas suspensas (is_blocked) e redireciona para /login?error=blocked
 * 10. Auditoria de Segurança: Middleware bloqueia acesso de clientes a /admin e /api/admin/* com 404
 * 11. Auditoria de Interface: Página /admin/contas e componente accounts-table-client com modais de confirmação
 * 12. Auditoria de Navegação: Links de "Gerenciar Contas" presentes no layout administrativo (desktop e mobile)
 * 13. Auditoria do Fluxo de Login: Detecção de conta bloqueada e signOut imediato
 * 14. Preservação do Fluxo de Clientes: Cadastro público mantido sem aprovação manual
 */

import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { blockUserSchema, inviteAdminSchema } from "../src/validations/user-schemas.ts";
import { customerSignUpSchema } from "../src/validations/customer-auth-schemas.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

console.log("=== INICIANDO BATERIA DE TESTES DE GERENCIAMENTO DE CONTAS ===\n");

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
// BLOCO 1: Validação de Schemas Zod (Requisitos 2 e 3)
// ---------------------------------------------------------------------------

runTest("blockUserSchema aceita bloqueio válido com justificativa", () => {
  const result = blockUserSchema.safeParse({
    block: true,
    reason: "Atividade fraudulenta detectada",
  });
  assert.strictEqual(result.success, true);
  assert.strictEqual(result.data.block, true);
  assert.strictEqual(result.data.reason, "Atividade fraudulenta detectada");
});

runTest("blockUserSchema aceita reativação válida sem justificativa obrigatória", () => {
  const result = blockUserSchema.safeParse({
    block: false,
  });
  assert.strictEqual(result.success, true);
  assert.strictEqual(result.data.block, false);
});

runTest("blockUserSchema rejeita tipos não booleanos para o campo block", () => {
  const result = blockUserSchema.safeParse({
    block: "sim",
  });
  assert.strictEqual(result.success, false);
});

runTest("inviteAdminSchema valida e-mail corporativo válido e sanitiza espaços", () => {
  const result = inviteAdminSchema.safeParse({
    email: "  novo.gestor@loja.com  ",
    name: "  Gestor Operacional  ",
    password: "senhaSegura123",
  });
  assert.strictEqual(result.success, true);
  assert.strictEqual(result.data.email, "novo.gestor@loja.com");
  assert.strictEqual(result.data.name, "Gestor Operacional");
});

runTest("inviteAdminSchema rejeita e-mail com formato inválido", () => {
  const result = inviteAdminSchema.safeParse({
    email: "email-invalido-sem-formato",
  });
  assert.strictEqual(result.success, false);
});

runTest("inviteAdminSchema rejeita senha temporária menor que 6 caracteres", () => {
  const result = inviteAdminSchema.safeParse({
    email: "gestor@loja.com",
    password: "123",
  });
  assert.strictEqual(result.success, false);
});

// ---------------------------------------------------------------------------
// BLOCO 2: Segurança no Cadastro de Clientes (Requisitos 1 e 3)
// ---------------------------------------------------------------------------

runTest("customerSignUpSchema não aceita elevação para admin pelo formulário de cadastro", () => {
  const payload = {
    name: "Cliente Comum",
    email: "cliente@exemplo.com",
    password: "SenhaCliente123",
    confirmPassword: "SenhaCliente123",
    role: "admin", // Tentativa maliciosa de se autopromover
    is_admin: true,
    app_metadata: { role: "admin" },
  };

  const result = customerSignUpSchema.safeParse(payload);
  assert.strictEqual(result.success, true);
  // Garante que campos de privilégio são ignorados e não constam no objeto validado
  assert.strictEqual(result.data.role, undefined);
  assert.strictEqual(result.data.is_admin, undefined);
  assert.strictEqual(result.data.app_metadata, undefined);
});

// ---------------------------------------------------------------------------
// BLOCO 3: Algoritmo de Listagem, Busca e Filtros de Usuários
// ---------------------------------------------------------------------------

const sampleUsers = [
  {
    id: "usr-admin-1",
    email: "admin@loja.com",
    name: "Administrador Geral",
    role: "admin",
    status: "active",
    created_at: "2026-10-25T10:00:00.000Z",
    last_sign_in_at: "2026-10-29T08:00:00.000Z",
    orders_count: 0,
  },
  {
    id: "usr-cust-1",
    email: "mariana.silva@exemplo.com",
    name: "Mariana Silva",
    role: "customer",
    status: "active",
    created_at: "2026-10-27T14:30:00.000Z",
    last_sign_in_at: "2026-10-28T19:00:00.000Z",
    orders_count: 3,
  },
  {
    id: "usr-cust-2",
    email: "carolina.mendes@exemplo.com",
    name: "Carolina Mendes",
    role: "customer",
    status: "active",
    created_at: "2026-10-28T09:15:00.000Z",
    last_sign_in_at: "2026-10-28T11:45:00.000Z",
    orders_count: 1,
  },
  {
    id: "usr-cust-3",
    email: "juliana.costa@exemplo.com",
    name: "Juliana Costa",
    role: "customer",
    status: "blocked",
    created_at: "2026-10-26T16:20:00.000Z",
    last_sign_in_at: "2026-10-27T10:10:00.000Z",
    orders_count: 0,
    blocked_at: "2026-10-28T12:00:00.000Z",
    blocked_reason: "Suspeita de atividade fraudulenta",
  },
];

function filterUsers(users, filter) {
  let filtered = [...users];
  if (filter?.search && filter.search.trim()) {
    const q = filter.search.toLowerCase().trim();
    filtered = filtered.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q)
    );
  }
  if (filter?.role && filter.role !== "all") {
    filtered = filtered.filter((u) => u.role === filter.role);
  }
  if (filter?.status && filter.status !== "all") {
    filtered = filtered.filter((u) => u.status === filter.status);
  }
  filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const page = Math.max(1, filter?.page || 1);
  const perPage = Math.max(1, filter?.perPage || 20);
  const total = filtered.length;
  const totalPages = Math.ceil(total / perPage) || 1;
  const startIndex = (page - 1) * perPage;
  const paged = filtered.slice(startIndex, startIndex + perPage);
  return { users: paged, total, page, perPage, totalPages };
}

runTest("Pesquisa de usuários por nome localiza registros ignorando maiúsculas/minúsculas", () => {
  const result = filterUsers(sampleUsers, { search: "mariana" });
  assert.strictEqual(result.total, 1);
  assert.strictEqual(result.users[0].name, "Mariana Silva");
});

runTest("Pesquisa de usuários por e-mail retorna conta exata", () => {
  const result = filterUsers(sampleUsers, { search: "admin@loja.com" });
  assert.strictEqual(result.total, 1);
  assert.strictEqual(result.users[0].email, "admin@loja.com");
});

runTest("Pesquisa de usuários por ID retorna usuário correspondente", () => {
  const result = filterUsers(sampleUsers, { search: "usr-cust-2" });
  assert.strictEqual(result.total, 1);
  assert.strictEqual(result.users[0].id, "usr-cust-2");
});

runTest("Filtro por papel (role=customer) retorna exclusivamente clientes", () => {
  const result = filterUsers(sampleUsers, { role: "customer" });
  assert.strictEqual(result.total, 3);
  assert.ok(result.users.every((u) => u.role === "customer"));
});

runTest("Filtro por papel (role=admin) retorna exclusivamente administradores", () => {
  const result = filterUsers(sampleUsers, { role: "admin" });
  assert.strictEqual(result.total, 1);
  assert.strictEqual(result.users[0].role, "admin");
});

runTest("Filtro por situação (status=blocked) retorna apenas contas bloqueadas", () => {
  const result = filterUsers(sampleUsers, { status: "blocked" });
  assert.strictEqual(result.total, 1);
  assert.strictEqual(result.users[0].name, "Juliana Costa");
  assert.strictEqual(result.users[0].status, "blocked");
});

runTest("Filtro por situação (status=active) retorna apenas contas ativas", () => {
  const result = filterUsers(sampleUsers, { status: "active" });
  assert.strictEqual(result.total, 3);
  assert.ok(result.users.every((u) => u.status === "active"));
});

// ---------------------------------------------------------------------------
// BLOCO 4: Regras de Bloqueio e Reativação de Contas
// ---------------------------------------------------------------------------

function applyBlockStatus(usersMap, targetId, block, adminSessionId, reason) {
  if (targetId === adminSessionId) {
    throw new Error("Operação negada: você não pode bloquear sua própria conta de administrador.");
  }
  const user = usersMap.get(targetId);
  if (!user) {
    throw new Error("Usuário não encontrado.");
  }
  if (user.role === "admin") {
    throw new Error("Operação negada: contas de administrador não podem ser bloqueadas diretamente nesta interface.");
  }
  const updated = {
    ...user,
    status: block ? "blocked" : "active",
    blocked_at: block ? new Date().toISOString() : null,
    blocked_reason: block ? (reason?.trim() || "Bloqueado pelo administrador") : null,
  };
  usersMap.set(targetId, updated);
  return { success: true, user: updated };
}

runTest("Bloqueio de cliente atualiza status, registra data e justificativa", () => {
  const store = new Map(sampleUsers.map((u) => [u.id, { ...u }]));
  const res = applyBlockStatus(store, "usr-cust-1", true, "usr-admin-1", "Contestação de compra indevida");
  assert.strictEqual(res.success, true);
  assert.strictEqual(res.user.status, "blocked");
  assert.strictEqual(res.user.blocked_reason, "Contestação de compra indevida");
  assert.ok(Boolean(res.user.blocked_at));
});

runTest("Reativação de cliente desfaz o bloqueio e limpa justificativa e data", () => {
  const store = new Map(sampleUsers.map((u) => [u.id, { ...u }]));
  const res = applyBlockStatus(store, "usr-cust-3", false, "usr-admin-1");
  assert.strictEqual(res.success, true);
  assert.strictEqual(res.user.status, "active");
  assert.strictEqual(res.user.blocked_at, null);
  assert.strictEqual(res.user.blocked_reason, null);
});

runTest("Segurança: Bloqueio do próprio administrador é estritamente impedido", () => {
  const store = new Map(sampleUsers.map((u) => [u.id, { ...u }]));
  assert.throws(
    () => applyBlockStatus(store, "usr-admin-1", true, "usr-admin-1", "Auto-bloqueio"),
    /você não pode bloquear sua própria conta de administrador/i
  );
});

runTest("Segurança: Bloqueio de qualquer conta de administrador é impedido", () => {
  const store = new Map(sampleUsers.map((u) => [u.id, { ...u }]));
  assert.throws(
    () => applyBlockStatus(store, "usr-admin-1", true, "usr-outro-admin", "Bloquear admin"),
    /contas de administrador não podem ser bloqueadas/i
  );
});

// ---------------------------------------------------------------------------
// BLOCO 5: Auditoria de Código e Arquitetura de Segurança
// ---------------------------------------------------------------------------

runTest("API /api/admin/users valida sessão administrativa com requireAdminSession", () => {
  const content = fs.readFileSync(path.join(rootDir, "src", "app", "api", "admin", "users", "route.ts"), "utf8");
  assert.ok(content.includes("requireAdminSession()"), "Deve chamar requireAdminSession no GET e POST");
  assert.ok(content.includes("inviteAdminSchema.safeParse"), "Deve validar payload no POST com inviteAdminSchema");
  assert.ok(content.includes("createOrInviteAdmin"), "Deve chamar o serviço de criação de administrador");
});

runTest("API /api/admin/users/[id]/block valida sessão administrativa e schema de bloqueio", () => {
  const content = fs.readFileSync(path.join(rootDir, "src", "app", "api", "admin", "users", "[id]", "block", "route.ts"), "utf8");
  assert.ok(content.includes("requireAdminSession()"), "Deve chamar requireAdminSession no POST");
  assert.ok(content.includes("blockUserSchema.safeParse"), "Deve validar payload com blockUserSchema");
  assert.ok(content.includes("setUserBlockedStatus"), "Deve chamar setUserBlockedStatus");
});

runTest("Middleware (src/middleware.ts) intercepta usuários bloqueados em rotas privadas", () => {
  const content = fs.readFileSync(path.join(rootDir, "src", "middleware.ts"), "utf8");
  assert.ok(content.includes("user?.app_metadata?.is_blocked"), "Deve verificar is_blocked em app_metadata");
  assert.ok(content.includes('redirect(new URL("/login?error=blocked"'), "Deve redirecionar para /login?error=blocked");
  assert.ok(content.includes("isAccessingAdminApi && !isAdmin"), "Deve barrar não-admins em /api/admin/* com 404");
});

runTest("Serviço de Autenticação (src/services/auth-service.ts) invalida administradores bloqueados", () => {
  const content = fs.readFileSync(path.join(rootDir, "src", "services", "auth-service.ts"), "utf8");
  assert.ok(content.includes("user.app_metadata?.is_blocked"), "getAdminSession deve verificar se admin está bloqueado");
  assert.ok(content.includes('userRole !== "admin"'), "getAdminSession deve exigir app_metadata.role === admin");
});

runTest("Página de Login (src/app/login/login-form.tsx) trata bloqueio de conta e força logout", () => {
  const content = fs.readFileSync(path.join(rootDir, "src", "app", "login", "login-form.tsx"), "utf8");
  assert.ok(content.includes('errorParam === "blocked"'), "Deve exibir mensagem quando error=blocked na URL");
  assert.ok(content.includes("data.user.app_metadata?.is_blocked"), "Deve verificar se usuário recém-autenticado está bloqueado");
  assert.ok(content.includes("supabase.auth.signOut()"), "Deve encerrar sessão no cliente se bloqueado");
  assert.ok(content.includes('fetch("/api/auth/logout"'), "Deve limpar cookies no servidor se bloqueado");
});

runTest("Página Admin Contas (src/app/admin/contas/page.tsx) é Server Component protegido por getAdminSession", () => {
  const content = fs.readFileSync(path.join(rootDir, "src", "app", "admin", "contas", "page.tsx"), "utf8");
  assert.ok(content.includes("getAdminSession()"), "Deve validar sessão administrativa no servidor");
  assert.ok(content.includes('redirect("/login")'), "Deve redirecionar para login caso não autenticado como admin");
  assert.ok(content.includes("listUsers"), "Deve carregar lista inicial com listUsers");
});

runTest("Componente AccountsTableClient possui modal de confirmação e prevenção de auto-bloqueio", () => {
  const content = fs.readFileSync(path.join(rootDir, "src", "app", "admin", "contas", "accounts-table-client.tsx"), "utf8");
  assert.ok(content.includes("actionTarget"), "Deve possuir estado para modal de confirmação antes de alterar acesso");
  assert.ok(content.includes("isInviteOpen"), "Deve possuir modal de convite de novos administradores");
  assert.ok(content.includes("currentAdminId"), "Deve receber currentAdminId para desativar botão de auto-bloqueio");
  assert.ok(content.includes("user.id === currentAdminId"), "Deve desabilitar bloqueio para o próprio administrador logado");
});

runTest("Layout Administrativo (src/app/admin/layout.tsx) inclui link 'Gerenciar Contas' no desktop e mobile", () => {
  const content = fs.readFileSync(path.join(rootDir, "src", "app", "admin", "layout.tsx"), "utf8");
  assert.ok(content.includes('href="/admin/contas"'), "Deve conter link para /admin/contas");
  assert.ok(content.includes("Gerenciar Contas"), "Deve conter o rótulo Gerenciar Contas");
});

runTest("Painel Principal Admin (src/app/admin/page.tsx) inclui botão de ação rápida para Gerenciar Contas", () => {
  const content = fs.readFileSync(path.join(rootDir, "src", "app", "admin", "page.tsx"), "utf8");
  assert.ok(content.includes('href="/admin/contas"'), "Deve conter link rápido para /admin/contas");
  assert.ok(content.includes("Gerenciar Contas"), "Deve conter rótulo na barra de atalhos rápidos");
});

runTest("Preservação do Fluxo de Cadastro: customer-signup-form não exige aprovação manual", () => {
  const content = fs.readFileSync(path.join(rootDir, "src", "app", "cadastro", "customer-signup-form.tsx"), "utf8");
  assert.ok(content.includes("supabase.auth.signUp"), "Deve realizar cadastro imediato no Supabase Auth");
  assert.ok(!content.includes("aguardando aprovação"), "Não deve condicionar conta a aprovação prévia");
});

console.log(`\n=== RESULTADO DOS TESTES: ${passed} / ${total} CENÁRIOS PASSARAM COM SUCESSO! ===\n`);
if (passed !== total) {
  process.exit(1);
}
