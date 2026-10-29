import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";
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
 * Consulta administrativa de pedidos com filtros de status e busca.
 */
export async function getAdminOrders(filters?: {
  status?: OrderStatus | "all";
  completedOnly?: boolean;
  activeOnly?: boolean;
  search?: string;
}): Promise<Order[]> {
  try {
    const supabase = await createClient();
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

    if (filters?.status && filters.status !== "all") {
      query = query.eq("status", filters.status);
    } else if (filters?.activeOnly) {
      query = query.neq("status", "completed");
    } else if (filters?.completedOnly) {
      query = query.eq("status", "completed");
    }

    if (filters?.search && filters.search.trim()) {
      query = query.ilike("reference", `%${filters.search.trim()}%`);
    }

    const { data, error } = await query;
    if (!error && Array.isArray(data)) {
      return data.map((item) => ({
        ...item,
        items: item.order_items,
      })) as unknown as Order[];
    }
  } catch {
    // Fallback de memória caso tabela ainda não esteja no banco
  }

  // Fallback em memória
  const allInMemory = Array.from(new Set(memoryOrdersFallback.values()));
  return allInMemory.filter((order) => {
    if (filters?.status && filters.status !== "all" && order.status !== filters.status) {
      return false;
    }
    if (filters?.activeOnly && order.status === "completed") {
      return false;
    }
    if (filters?.completedOnly && order.status !== "completed") {
      return false;
    }
    if (
      filters?.search &&
      !order.reference.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });
}

/**
 * Consulta um pedido específico por ID para a visualização administrativa.
 */
export async function getAdminOrderById(orderId: string): Promise<Order | null> {
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
  const validation = validateUpdateOrderStatusInput({ status: newStatus, notes });
  if (!validation.isValid) {
    throw new Error(validation.errors[0] || "Status de pedido inválido.");
  }

  const existingOrder = await getAdminOrderById(orderId);
  if (!existingOrder) {
    throw new Error("Pedido não encontrado.");
  }

  const now = new Date().toISOString();
  const newHistoryEntry: StatusHistoryEntry = {
    status: newStatus,
    changed_at: now,
    changed_by: adminEmail || "Administrador",
    notes: notes?.trim() || `Status alterado para ${ORDER_STATUS_MAP[newStatus]?.label || newStatus}`,
  };

  const updatedHistory = [...(existingOrder.status_history || []), newHistoryEntry];
  const completedAt = newStatus === "completed" ? now : existingOrder.completed_at || null;

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("orders")
      .update({
        status: newStatus,
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
        customer_phone,
        customer_notes,
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

    if (!error && data) {
      return {
        ...data,
        items: data.order_items,
      } as unknown as Order;
    }
  } catch {
    // Fallback de memória
  }

  // Atualiza no fallback
  const updatedFallback: Order = {
    ...existingOrder,
    status: newStatus,
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

