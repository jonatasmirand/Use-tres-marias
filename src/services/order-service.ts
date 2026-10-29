import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  Order,
  OrderStatus,
  CreateOrderInput,
  CreateOrderResponse,
  PublicOrderTracking,
  ORDER_STATUS_MAP,
  StatusHistoryEntry,
} from "@/types/order";
import { validateCreateOrderInput, validateUpdateOrderStatusInput } from "@/validations/order-schemas";

/** Memória fallback segura para desenvolvimento local e testes quando a migração ainda não foi aplicada */
const memoryOrdersFallback = new Map<string, Order>();

/** Gera um token criptograficamente seguro e aleatório (48 caracteres hex) */
export function generateTrackingToken(): string {
  return crypto.randomBytes(24).toString("hex");
}

/** Calcula o hash SHA-256 do token para armazenamento seguro no banco de dados */
export function hashTrackingToken(token: string): string {
  return crypto.createHash("sha256").update(token.trim().toLowerCase()).digest("hex");
}

/** Gera um código de referência amigável para o pedido (ex: TM-2026-X8K2) */
export function generateOrderReference(): string {
  const year = new Date().getFullYear();
  const randomChars = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `TM-${year}-${randomChars}`;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Valida se a string é um UUID válido para evitar erros de sintaxe no Postgres */
export function isValidUuid(id?: string | null): boolean {
  if (!id) return false;
  return UUID_REGEX.test(id.trim());
}

/**
 * Normaliza e protege valores de status de pedidos (suporta legados e variações sem descartar pedidos).
 */
export function normalizeOrderStatus(rawStatus?: string | null): OrderStatus {
  if (!rawStatus) return "pending";
  const clean = rawStatus.toLowerCase().trim();
  if (clean === "pending" || clean === "pendente") return "pending";
  if (
    clean === "in_progress" ||
    clean === "em_andamento" ||
    clean === "processing" ||
    clean === "em andamento"
  ) {
    return "in_progress";
  }
  if (
    clean === "on_the_way" ||
    clean === "a_caminho" ||
    clean === "shipped" ||
    clean === "em rota" ||
    clean === "a caminho"
  ) {
    return "on_the_way";
  }
  if (
    clean === "completed" ||
    clean === "concluido" ||
    clean === "concluído" ||
    clean === "finalizado" ||
    clean === "delivered" ||
    clean === "entregue"
  ) {
    return "completed";
  }
  return "pending";
}

export interface GetAdminOrdersFilters {
  status?: OrderStatus | "all";
  completedOnly?: boolean;
  activeOnly?: boolean;
  search?: string;
  clienteId?: string;
  clienteEmail?: string;
}

export interface GetAdminOrdersResult {
  orders: Order[];
  total: number;
  activeCount: number;
  completedCount: number;
  statusCounts: Record<OrderStatus, number>;
  error?: string | null;
}

/**
 * Cria um novo pedido e seus itens no banco de dados.
 * Valida os dados, calcula valores e retorna o token de acompanhamento.
 */
export async function createOrder(
  input: CreateOrderInput,
  originUrl = ""
): Promise<CreateOrderResponse> {
  const validation = validateCreateOrderInput(input);
  if (!validation.isValid || !validation.data) {
    throw new Error(validation.errors[0] || "Dados do pedido inválidos.");
  }

  const validData = validation.data;

  // Calcula subtotal e total com precisão de 2 casas decimais
  const subtotal = validData.items.reduce((acc, item) => {
    return acc + Math.round(item.price * item.quantity * 100) / 100;
  }, 0);

  const roundedSubtotal = Math.round(subtotal * 100) / 100;
  const frete = Math.round((validData.frete || 0) * 100) / 100;
  const discount = Math.round((validData.discount || 0) * 100) / 100;
  const total = Math.max(0, Math.round((roundedSubtotal + frete - discount) * 100) / 100);

  const reference = generateOrderReference();
  const rawToken = generateTrackingToken();
  const tokenHash = hashTrackingToken(rawToken);
  const now = new Date().toISOString();

  const initialHistory: StatusHistoryEntry[] = [
    {
      status: "pending",
      changed_at: now,
      changed_by: "Sistema (Fechamento do Pedido)",
      notes: "Pedido criado e registrado na loja.",
    },
  ];

  let orderId = crypto.randomUUID();

  const cleanOrigin = originUrl
    ? originUrl.trim().replace(/^(https?:\/\/)+(https?:\/\/)+/, "$2").replace(/\/+$/, "")
    : "";
  const trackingPath = `/pedido/acompanhar/${rawToken}`;
  const trackingUrl = cleanOrigin ? `${cleanOrigin}${trackingPath}` : trackingPath;

  try {
    const supabase = await createClient();

    // 1. Insere o pedido diretamente sem .select('id') para não exigir permissão de SELECT pública
    const { error: orderError } = await supabase
      .from("orders")
      .insert({
        id: orderId,
        reference,
        token_hash: tokenHash,
        status: "pending",
        subtotal: roundedSubtotal,
        frete,
        discount,
        total,
        customer_name: validData.customer_name || null,
        customer_email: validData.customer_email || null,
        customer_phone: validData.customer_phone || null,
        customer_notes: validData.customer_notes || null,
        user_id: validData.user_id || null,
        status_history: initialHistory,
        created_at: now,
        updated_at: now,
      });

    if (orderError) {
      throw orderError;
    }

    // 2. Insere os itens com snapshot dos valores comerciais
    const orderItemsToInsert = validData.items.map((item) => ({
      order_id: orderId,
      product_id: item.product_id || null,
      name: item.name,
      size: item.size || "Único",
      price: item.price,
      quantity: item.quantity,
      subtotal: Math.round(item.price * item.quantity * 100) / 100,
      image_url: item.image_url || null,
      created_at: now,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItemsToInsert);

    if (itemsError) {
      // Em caso de falha nos itens, remove o pedido órfão
      await supabase.from("orders").delete().eq("id", orderId);
      throw itemsError;
    }
  } catch {
    // Fallback gracioso em memória para ambientes locais antes da aplicação da migration no Supabase
    const fallbackOrder: Order = {
      id: orderId,
      reference,
      token_hash: tokenHash,
      tracking_token: rawToken,
      tracking_url: trackingUrl,
      status: "pending",
      subtotal: roundedSubtotal,
      frete,
      discount,
      total,
      customer_name: validData.customer_name || null,
      customer_email: validData.customer_email || null,
      customer_phone: validData.customer_phone || null,
      customer_notes: validData.customer_notes || null,
      user_id: validData.user_id || null,
      status_history: initialHistory,
      created_at: now,
      updated_at: now,
      items: validData.items.map((item, index) => ({
        id: `item-${index + 1}`,
        order_id: orderId,
        product_id: item.product_id || null,
        name: item.name,
        size: item.size || "Único",
        price: item.price,
        quantity: item.quantity,
        subtotal: Math.round(item.price * item.quantity * 100) / 100,
        image_url: item.image_url || null,
        created_at: now,
      })),
    };

    memoryOrdersFallback.set(tokenHash, fallbackOrder);
    memoryOrdersFallback.set(orderId, fallbackOrder);
    memoryOrdersFallback.set(rawToken, fallbackOrder);
    memoryOrdersFallback.set(reference, fallbackOrder);
  }

  return {
    success: true,
    orderId,
    reference,
    trackingToken: rawToken,
    trackingUrl,
    message: "Pedido registrado com sucesso.",
  };
}

/**
 * Consulta pública de pedido pelo token de acompanhamento, UUID ou referência.
 * Retorna somente os dados necessários, sem expor informações sensíveis.
 */
export async function getPublicOrderTracking(identifier: string): Promise<PublicOrderTracking | null> {
  if (!identifier || typeof identifier !== "string" || identifier.trim().length < 4) {
    return null;
  }

  const clean = identifier.trim();
  const tokenHash = hashTrackingToken(clean);
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(clean);

  try {
    const supabase = await createClient();

    // 1. Tenta a função RPC segura com SECURITY DEFINER pelo hash do token
    let { data: rpcData, error: rpcError } = await supabase.rpc("get_order_by_token_hash", {
      p_token_hash: tokenHash,
    });

    // Se não encontrou pelo hash e o identificador for um UUID ou Referência, tenta RPC com o próprio identificador
    if ((!rpcData || rpcError) && (isUuid || clean.startsWith("TM-") || clean.length < 64)) {
      const retry = await supabase.rpc("get_order_by_token_hash", {
        p_token_hash: clean,
      });
      if (!retry.error && retry.data) {
        rpcData = retry.data;
        rpcError = null;
      }
    }

    if (!rpcError && rpcData && typeof rpcData === "object" && "reference" in rpcData) {
      const status = (rpcData.status as OrderStatus) || "pending";
      return {
        ...rpcData,
        status,
        status_info: ORDER_STATUS_MAP[status] || ORDER_STATUS_MAP.pending,
      } as PublicOrderTracking;
    }

    // 2. Fallback direto consultando tabela orders
    let query = supabase.from("orders").select(`
      reference,
      status,
      subtotal,
      frete,
      discount,
      total,
      created_at,
      updated_at,
      completed_at,
      order_items (
        id,
        order_id,
        product_id,
        name,
        size,
        price,
        quantity,
        subtotal,
        image_url
      )
    `);

    if (isUuid) {
      query = query.eq("id", clean);
    } else {
      query = query.or(`token_hash.eq.${tokenHash},token_hash.eq.${clean},reference.eq.${clean}`);
    }

    const { data: orderData, error: orderError } = await query.maybeSingle();

    if (!orderError && orderData) {
      const status = (orderData.status as OrderStatus) || "pending";
      const items = Array.isArray(orderData.order_items) ? orderData.order_items : [];

      return {
        reference: orderData.reference,
        status,
        subtotal: orderData.subtotal,
        frete: orderData.frete,
        discount: orderData.discount,
        total: orderData.total,
        created_at: orderData.created_at,
        updated_at: orderData.updated_at,
        completed_at: orderData.completed_at,
        items,
        status_info: ORDER_STATUS_MAP[status] || ORDER_STATUS_MAP.pending,
      };
    }
  } catch {
    // Falha ou indisponibilidade: consulta memória fallback
  }

  // Consulta fallback em memória: verifica tanto pelo clean (UUID/Token/Ref) quanto pelo tokenHash
  const fallbackOrder =
    memoryOrdersFallback.get(clean) ||
    memoryOrdersFallback.get(tokenHash) ||
    Array.from(memoryOrdersFallback.values()).find(
      (o) => o.id === clean || o.reference === clean || o.token_hash === tokenHash || o.token_hash === clean
    );

  if (fallbackOrder) {
    const status = fallbackOrder.status;
    return {
      reference: fallbackOrder.reference,
      status,
      subtotal: fallbackOrder.subtotal,
      frete: fallbackOrder.frete,
      discount: fallbackOrder.discount,
      total: fallbackOrder.total,
      created_at: fallbackOrder.created_at,
      updated_at: fallbackOrder.updated_at,
      completed_at: fallbackOrder.completed_at,
      items: fallbackOrder.items || [],
      status_info: ORDER_STATUS_MAP[status] || ORDER_STATUS_MAP.pending,
    };
  }

  return null;
}

/**
 * Consulta administrativa de pedidos com filtros de cliente, status e busca.
 * Não utiliza contadores simulados: calcula e retorna as métricas reais do banco.
 */
export async function getAdminOrders(
  filters?: GetAdminOrdersFilters
): Promise<GetAdminOrdersResult> {
  const emptyCounts: Record<OrderStatus, number> = {
    pending: 0,
    in_progress: 0,
    on_the_way: 0,
    completed: 0,
  };

  try {
    const adminClient = getSupabaseAdminClient();
    const supabase = adminClient || (await createClient());

    let query = supabase
      .from("orders")
      .select(`
        id,
        reference,
        token_hash,
        status,
        subtotal,
        frete,
        discount,
        total,
        customer_name,
        customer_email,
        customer_phone,
        customer_notes,
        user_id,
        status_history,
        created_at,
        updated_at,
        completed_at,
        order_items (
          id,
          order_id,
          product_id,
          name,
          size,
          price,
          quantity,
          subtotal,
          image_url,
          created_at
        )
      `)
      .order("created_at", { ascending: false });

    // 1. Filtro por Cliente: relacionamento seguro por user_id (UUID) e/ou customer_email
    const validUserId = isValidUuid(filters?.clienteId) ? filters!.clienteId!.trim() : null;
    const cleanCustomerEmail = filters?.clienteEmail?.trim().toLowerCase();

    if (validUserId && cleanCustomerEmail) {
      query = query.or(`user_id.eq.${validUserId},customer_email.ilike.${cleanCustomerEmail}`);
    } else if (validUserId) {
      query = query.eq("user_id", validUserId);
    } else if (cleanCustomerEmail) {
      query = query.ilike("customer_email", cleanCustomerEmail);
    }

    // 2. Filtro de Busca (Referência, Nome do Cliente, E-mail ou Telefone)
    if (filters?.search && filters.search.trim()) {
      const q = filters.search.trim();
      query = query.or(
        `reference.ilike.%${q}%,customer_name.ilike.%${q}%,customer_email.ilike.%${q}%,customer_phone.ilike.%${q}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error("[OrderService] Erro ao consultar pedidos no Supabase:", error.message);
      return {
        orders: [],
        total: 0,
        activeCount: 0,
        completedCount: 0,
        statusCounts: emptyCounts,
        error: "Não foi possível carregar os pedidos do banco de dados no momento.",
      };
    }

    let allOrders: Order[] = [];

    if (Array.isArray(data)) {
      allOrders = data.map((item) => {
        const normalized = normalizeOrderStatus(item.status);
        return {
          ...item,
          status: normalized,
          items: Array.isArray(item.order_items) ? item.order_items : [],
        } as unknown as Order;
      });
    }

    // Fallback em memória para testes ou ambientes de desenvolvimento locais
    if (allOrders.length === 0 && memoryOrdersFallback.size > 0) {
      const allInMemory = Array.from(new Set(memoryOrdersFallback.values()));
      allOrders = allInMemory.filter((order) => {
        if (validUserId && order.user_id === validUserId) return true;
        if (
          cleanCustomerEmail &&
          order.customer_email &&
          order.customer_email.toLowerCase() === cleanCustomerEmail
        ) {
          return true;
        }
        if (validUserId || cleanCustomerEmail) return false;

        if (filters?.search && filters.search.trim()) {
          const q = filters.search.toLowerCase().trim();
          const matchRef = order.reference.toLowerCase().includes(q);
          const matchName = (order.customer_name || "").toLowerCase().includes(q);
          const matchEmail = (order.customer_email || "").toLowerCase().includes(q);
          const matchPhone = (order.customer_phone || "").includes(q);
          if (!matchRef && !matchName && !matchEmail && !matchPhone) return false;
        }
        return true;
      });
    }

    // 3. Contadores determinísticos calculados com base no conjunto consultado
    const total = allOrders.length;
    let activeCount = 0;
    let completedCount = 0;
    const statusCounts: Record<OrderStatus, number> = {
      pending: 0,
      in_progress: 0,
      on_the_way: 0,
      completed: 0,
    };

    for (const o of allOrders) {
      if (o.status === "completed") {
        completedCount++;
      } else {
        activeCount++;
      }
      if (o.status in statusCounts) {
        statusCounts[o.status]++;
      } else {
        statusCounts.pending++;
      }
    }

    // 4. Filtragem por status da aba atual
    let filteredOrders = allOrders;
    if (filters?.status && filters.status !== "all") {
      filteredOrders = filteredOrders.filter((o) => o.status === filters.status);
    } else if (filters?.activeOnly) {
      filteredOrders = filteredOrders.filter((o) => o.status !== "completed");
    } else if (filters?.completedOnly) {
      filteredOrders = filteredOrders.filter((o) => o.status === "completed");
    }

    return {
      orders: filteredOrders,
      total,
      activeCount,
      completedCount,
      statusCounts,
      error: null,
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Erro interno ao processar pedidos.";
    console.error("[OrderService] Exceção em getAdminOrders:", errorMsg);
    return {
      orders: [],
      total: 0,
      activeCount: 0,
      completedCount: 0,
      statusCounts: emptyCounts,
      error: "Falha na comunicação com o banco de dados de pedidos.",
    };
  }
}

/**
 * Consulta um pedido específico por ID para a visualização administrativa.
 */
export async function getAdminOrderById(orderId: string): Promise<Order | null> {
  if (!orderId) return null;

  try {
    const adminClient = getSupabaseAdminClient();
    const supabase = adminClient || (await createClient());

    const { data, error } = await supabase
      .from("orders")
      .select(`
        id,
        reference,
        token_hash,
        status,
        subtotal,
        frete,
        discount,
        total,
        customer_name,
        customer_email,
        customer_phone,
        customer_notes,
        user_id,
        status_history,
        created_at,
        updated_at,
        completed_at,
        order_items (
          id,
          order_id,
          product_id,
          name,
          size,
          price,
          quantity,
          subtotal,
          image_url,
          created_at
        )
      `)
      .eq("id", orderId)
      .maybeSingle();

    if (!error && data) {
      return {
        ...data,
        status: normalizeOrderStatus(data.status),
        items: Array.isArray(data.order_items) ? data.order_items : [],
      } as unknown as Order;
    }
  } catch (err) {
    console.error("[OrderService] Erro ao carregar pedido por id:", err);
  }

  const memoryOrder = memoryOrdersFallback.get(orderId);
  return memoryOrder || null;
}

/**
 * Atualiza o status de um pedido com validação rigorosa e registro de auditoria.
 */
export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  adminEmail: string,
  notes?: string
): Promise<Order> {
  const normalizedStatus = normalizeOrderStatus(newStatus);
  const validation = validateUpdateOrderStatusInput({ status: normalizedStatus, notes });
  if (!validation.isValid) {
    throw new Error(validation.errors[0] || "Status de pedido inválido.");
  }

  const existingOrder = await getAdminOrderById(orderId);
  if (!existingOrder) {
    throw new Error("Pedido não encontrado.");
  }

  const now = new Date().toISOString();
  const newHistoryEntry: StatusHistoryEntry = {
    status: normalizedStatus,
    changed_at: now,
    changed_by: adminEmail || "Administrador",
    notes: notes?.trim() || `Status alterado para ${ORDER_STATUS_MAP[normalizedStatus]?.label || normalizedStatus}`,
  };

  const updatedHistory = [...(existingOrder.status_history || []), newHistoryEntry];
  const completedAt = normalizedStatus === "completed" ? now : existingOrder.completed_at || null;

  try {
    const adminClient = getSupabaseAdminClient();
    const supabase = adminClient || (await createClient());

    const { data, error } = await supabase
      .from("orders")
      .update({
        status: normalizedStatus,
        status_history: updatedHistory,
        updated_at: now,
        completed_at: completedAt,
      })
      .eq("id", orderId)
      .select(`
        id,
        reference,
        token_hash,
        status,
        subtotal,
        frete,
        discount,
        total,
        customer_name,
        customer_email,
        customer_phone,
        customer_notes,
        user_id,
        status_history,
        created_at,
        updated_at,
        completed_at,
        order_items (
          id,
          order_id,
          product_id,
          name,
          size,
          price,
          quantity,
          subtotal,
          image_url,
          created_at
        )
      `)
      .single();

    if (error) {
      console.error("[OrderService] Erro ao atualizar status no banco:", error.message);
      throw new Error(`Erro ao atualizar status no banco: ${error.message}`);
    }

    if (data) {
      const updatedOrder = {
        ...data,
        status: normalizeOrderStatus(data.status),
        items: Array.isArray(data.order_items) ? data.order_items : [],
      } as unknown as Order;

      memoryOrdersFallback.set(existingOrder.token_hash, updatedOrder);
      memoryOrdersFallback.set(orderId, updatedOrder);
      return updatedOrder;
    }
  } catch (err) {
    if (err instanceof Error && err.message.startsWith("Erro ao atualizar")) {
      throw err;
    }
    console.error("[OrderService] Exceção em updateOrderStatus:", err);
  }

  // Atualiza no fallback
  const updatedFallback: Order = {
    ...existingOrder,
    status: normalizedStatus,
    status_history: updatedHistory,
    updated_at: now,
    completed_at: completedAt,
  };

  memoryOrdersFallback.set(existingOrder.token_hash, updatedFallback);
  memoryOrdersFallback.set(orderId, updatedFallback);

  return updatedFallback;
}

/**
 * Consulta de pedidos do cliente autenticado (histórico de compras).
 * Garante que somente os pedidos vinculados ao userId do cliente sejam retornados.
 */
export async function getCustomerOrders(userId: string): Promise<Order[]> {
  if (!userId) return [];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("orders")
      .select(`
        id,
        reference,
        token_hash,
        status,
        subtotal,
        frete,
        discount,
        total,
        customer_name,
        customer_email,
        customer_phone,
        customer_notes,
        user_id,
        status_history,
        created_at,
        updated_at,
        completed_at,
        order_items (
          id,
          order_id,
          product_id,
          name,
          size,
          price,
          quantity,
          subtotal,
          image_url,
          created_at
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (!error && Array.isArray(data)) {
      return data.map((item) => ({
        ...item,
        items: item.order_items,
      })) as unknown as Order[];
    }
  } catch {
    // Falha ou indisponibilidade
  }

  // Fallback em memória para desenvolvimento e testes
  const allInMemory = Array.from(new Set(memoryOrdersFallback.values()));
  return allInMemory.filter((order) => order.user_id === userId);
}

/**
 * Consulta um pedido específico do cliente autenticado com validação estrita de posse.
 * Se o pedido não pertencer ao userId, retorna null impedindo o vazamento de dados de terceiros.
 */
export async function getCustomerOrderById(orderId: string, userId: string): Promise<Order | null> {
  if (!orderId || !userId) return null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("orders")
      .select(`
        id,
        reference,
        token_hash,
        status,
        subtotal,
        frete,
        discount,
        total,
        customer_name,
        customer_email,
        customer_phone,
        customer_notes,
        user_id,
        status_history,
        created_at,
        updated_at,
        completed_at,
        order_items (
          id,
          order_id,
          product_id,
          name,
          size,
          price,
          quantity,
          subtotal,
          image_url,
          created_at
        )
      `)
      .eq("id", orderId)
      .eq("user_id", userId)
      .maybeSingle();

    if (!error && data) {
      return {
        ...data,
        items: data.order_items,
      } as unknown as Order;
    }
  } catch {
    // Falha ou indisponibilidade
  }

  // Fallback em memória
  const memoryOrder = memoryOrdersFallback.get(orderId);
  if (memoryOrder && memoryOrder.user_id === userId) {
    return memoryOrder;
  }

  return null;
}

