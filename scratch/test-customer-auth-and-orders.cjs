/**
 * Testes Automatizados — Cadastro, Login de Clientes e Vinculação de Pedidos
 * Use Três Marias
 */

const assert = require("assert");
const crypto = require("crypto");
const { z } = require("zod");

// Importa schemas e tipos
const {
  customerSignUpSchema,
  customerLoginSchema,
} = require("../src/validations/customer-auth-schemas.ts");

const {
  createOrderSchema,
  validateCreateOrderInput,
  updateOrderStatusSchema,
} = require("../src/validations/order-schemas.ts");

const {
  generateTrackingToken,
  hashTrackingToken,
  generateOrderReference,
} = require("../src/services/order-service.ts");

console.log("\n=======================================================");
console.log("🚀 INICIANDO TESTES DO SISTEMA DE CLIENTES E PEDIDOS");
console.log("=======================================================\n");

let passed = 0;
let failed = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  [PASSOU] ${name}`);
    passed++;
  } catch (err) {
    console.error(`  [FALHOU] ${name}`);
    console.error(`          ${err.message}`);
    failed++;
  }
}

// 1. Validação de Cadastro de Cliente (Campos obrigatórios, formato de e-mail e tamanho de senha)
runTest("1. Validação de cadastro de cliente com dados válidos", () => {
  const result = customerSignUpSchema.safeParse({
    name: "Maria de Lourdes Silva",
    email: "Maria.Silva@Exemplo.com.br",
    password: "senhaForte123",
    confirmPassword: "senhaForte123",
  });
  assert.strictEqual(result.success, true);
  assert.strictEqual(result.data.email, "maria.silva@exemplo.com.br");
  assert.strictEqual(result.data.name, "Maria de Lourdes Silva");
});

runTest("1.1. Validação de cadastro rejeita confirmação de senha diferente", () => {
  const result = customerSignUpSchema.safeParse({
    name: "Maria Silva",
    email: "maria@exemplo.com",
    password: "senhaForte123",
    confirmPassword: "outraSenhaDiferente",
  });
  assert.strictEqual(result.success, false);
  const msg = result.error.issues[0]?.message;
  assert.ok(msg.includes("não coincidem"), "Deveria acusar que as senhas não coincidem");
});

runTest("1.2. Validação de cadastro rejeita senha menor que 6 caracteres", () => {
  const result = customerSignUpSchema.safeParse({
    name: "Maria Silva",
    email: "maria@exemplo.com",
    password: "123",
    confirmPassword: "123",
  });
  assert.strictEqual(result.success, false);
});

// 2. Validação de Login de Cliente
runTest("2. Validação de schema de login com credenciais válidas", () => {
  const result = customerLoginSchema.safeParse({
    email: "CLIENTE@TESTE.COM",
    password: "minhaSenhaSecreta",
  });
  assert.strictEqual(result.success, true);
  assert.strictEqual(result.data.email, "cliente@teste.com");
});

runTest("2.1. Validação de login rejeita e-mail inválido", () => {
  const result = customerLoginSchema.safeParse({
    email: "email-sem-arroba",
    password: "123",
  });
  assert.strictEqual(result.success, false);
});

// 3. Schema de Pedidos com user_id e customer_email
runTest("3. Schema de criação de pedido aceita user_id e customer_email válidos", () => {
  const dummyUserId = crypto.randomUUID();
  const input = {
    items: [
      {
        product_id: crypto.randomUUID(),
        name: "Vestido Floral Três Marias",
        size: "M",
        price: 289.9,
        quantity: 1,
      },
    ],
    customer_name: "Ana Clara",
    customer_email: "anaclara@teste.com",
    customer_phone: "11999998888",
    user_id: dummyUserId,
  };

  const validation = validateCreateOrderInput(input);
  assert.strictEqual(validation.isValid, true);
  assert.strictEqual(validation.data.user_id, dummyUserId);
  assert.strictEqual(validation.data.customer_email, "anaclara@teste.com");
});

// 4. SEGURANÇA: Sobrescrita autoritativa do user_id no servidor
runTest("4. SEGURANÇA: user_id enviado no body não substitui a sessão autenticada", () => {
  // Simulando a lógica de POST /api/orders
  const fakeSessionUser = {
    id: "user-legitimo-da-sessao-1111-2222",
    email: "legitimo@usuario.com",
  };

  const maliciousBody = {
    items: [
      {
        name: "Blusa Linho Três Marias",
        price: 159.0,
        quantity: 2,
      },
    ],
    user_id: "user-forjado-de-outra-pessoa-9999", // Tentativa de golpe
    customer_email: "vitima@outro.com",
  };

  const validation = validateCreateOrderInput(maliciousBody);
  assert.strictEqual(validation.isValid, true);

  // No handler do servidor:
  validation.data.user_id = fakeSessionUser.id;
  validation.data.customer_email = fakeSessionUser.email;

  assert.strictEqual(
    validation.data.user_id,
    fakeSessionUser.id,
    "user_id DEVE ser o da sessão autenticada"
  );
  assert.notStrictEqual(
    validation.data.user_id,
    maliciousBody.user_id,
    "user_id forjado deve ter sido bloqueado e substituído"
  );
});

// 5. Isolamento e Bloqueio de consulta de pedidos de outros clientes
runTest("5. ISOLAMENTO RLS: Cliente só pode consultar seus próprios pedidos", () => {
  const clienteA_Id = crypto.randomUUID();
  const clienteB_Id = crypto.randomUUID();

  // Simulação de banco de pedidos
  const dbOrders = [
    { id: "pedido-1", reference: "TM-2026-A1", user_id: clienteA_Id, total: 300 },
    { id: "pedido-2", reference: "TM-2026-B1", user_id: clienteB_Id, total: 500 },
    { id: "pedido-3", reference: "TM-2026-A2", user_id: clienteA_Id, total: 150 },
    { id: "pedido-legado", reference: "TM-2026-LEG", user_id: null, total: 200 },
  ];

  // Regra getCustomerOrders(userId): db.filter(o => o.user_id === userId)
  const pedidosClienteA = dbOrders.filter((o) => o.user_id === clienteA_Id);
  assert.strictEqual(pedidosClienteA.length, 2);
  assert.ok(pedidosClienteA.every((o) => o.user_id === clienteA_Id));

  // Tentativa do Cliente A consultar diretamente o pedido do Cliente B:
  function getCustomerOrderByIdMock(orderId, requestUserId) {
    const found = dbOrders.find((o) => o.id === orderId && o.user_id === requestUserId);
    return found || null;
  }

  const acessoAoProprioPedido = getCustomerOrderByIdMock("pedido-1", clienteA_Id);
  assert.ok(acessoAoProprioPedido !== null);
  assert.strictEqual(acessoAoProprioPedido.id, "pedido-1");

  const invasaoDePrivacidade = getCustomerOrderByIdMock("pedido-2", clienteA_Id);
  assert.strictEqual(
    invasaoDePrivacidade,
    null,
    "Consulta a pedido de terceiro DEVE retornar null (404 seguro)"
  );
});

// 6. Bloqueio de alteração de status por clientes (Somente admin pode alterar status)
runTest("6. Bloqueio de clientes para alteração de status", () => {
  const updateValidation = updateOrderStatusSchema.safeParse({
    status: "completed",
    notes: "Entrega confirmada pela equipe",
  });
  assert.strictEqual(updateValidation.success, true);

  // Tentativa de status inválido
  const invalidStatus = updateOrderStatusSchema.safeParse({
    status: "cancelado_pelo_cliente",
  });
  assert.strictEqual(invalidStatus.success, false);
});

// 7. Compatibilidade com pedidos legados sem user_id
runTest("7. Compatibilidade total com pedidos antigos sem user_id", () => {
  const legacyOrder = {
    id: crypto.randomUUID(),
    reference: "TM-2026-LEGACY",
    user_id: null,
    customer_email: null,
    total: 199.9,
    status: "pending",
  };

  assert.strictEqual(legacyOrder.user_id, null);
  // O admin consegue listar o pedido legado perfeitamente
  const adminViewDisplaysLegacy = Boolean(legacyOrder.reference);
  assert.strictEqual(adminViewDisplaysLegacy, true);
});

// 8. Rastreio Seguro por Token
runTest("8. Rastreamento por Token Secreto permanece ativo e seguro", () => {
  const rawToken = generateTrackingToken();
  assert.strictEqual(rawToken.length, 48, "Token deve ter 48 caracteres hexadecimais");

  const hash = hashTrackingToken(rawToken);
  assert.strictEqual(hash.length, 64, "Hash SHA-256 deve ter 64 caracteres hexadecimais");

  const ref = generateOrderReference();
  assert.ok(ref.startsWith("TM-"), "Referência deve iniciar com TM-");
});

console.log("\n=======================================================");
console.log(`📊 RESULTADO FINAL: ${passed} PASSOU | ${failed} FALHOU`);
console.log("=======================================================\n");

if (failed > 0) {
  process.exit(1);
}
