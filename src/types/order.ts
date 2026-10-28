/**
 * Tipos e contratos do Sistema de Pedidos e Acompanhamento
 * Projeto Use Três Marias
 */

export type OrderStatus = "pending" | "in_progress" | "on_the_way" | "completed";

export interface OrderStatusInfo {
  status: OrderStatus;
  label: string;
  description: string;
  badgeClass: string;
  stepNumber: number;
}

export const ORDER_STATUS_MAP: Record<OrderStatus, OrderStatusInfo> = {
  pending: {
    status: "pending",
    label: "Pendente",
    description: "Pedido registrado com sucesso. Nossa equipe está aguardando a confirmação do pagamento para iniciar a separação.",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
    stepNumber: 1,
  },
  in_progress: {
    status: "in_progress",
    label: "Em andamento",
    description: "Pagamento confirmado! Suas peças estão sendo separadas, conferidas e embaladas com todo carinho.",
    badgeClass: "bg-blue-50 text-blue-800 border-blue-200",
    stepNumber: 2,
  },
  on_the_way: {
    status: "on_the_way",
    label: "A caminho",
    description: "Seu pacote foi despachado e está em rota de transporte a caminho do seu endereço.",
    badgeClass: "bg-purple-50 text-purple-800 border-purple-200",
    stepNumber: 3,
  },
  completed: {
    status: "completed",
    label: "Finalizado",
    description: "Pedido entregue e concluído com sucesso. Esperamos que você ame suas peças Três Marias!",
    badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
    stepNumber: 4,
  },
};

export interface StatusHistoryEntry {
  status: OrderStatus;
  changed_at: string;
  changed_by: string;
  notes?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string | null;
  name: string;
  size: string;
  price: number;
  quantity: number;
  subtotal: number;
  image_url?: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  reference: string;
  token_hash: string;
  tracking_token?: string | null;
  tracking_url?: string | null;
  status: OrderStatus;
  subtotal: number;
  frete: number;
  discount: number;
  total: number;
  customer_name?: string | null;
  customer_email?: string | null;
  customer_phone?: string | null;
  customer_notes?: string | null;
  user_id?: string | null;
  status_history: StatusHistoryEntry[];
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
  items?: OrderItem[];
}

/** Objeto público retornado para acompanhamento via token seguro (sem dados sensíveis) */
export interface PublicOrderTracking {
  reference: string;
  status: OrderStatus;
  subtotal: number;
  frete: number;
  discount: number;
  total: number;
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
  items: Array<{
    id: string;
    product_id?: string | null;
    name: string;
    size: string;
    price: number;
    quantity: number;
    subtotal: number;
    image_url?: string | null;
  }>;
  status_info: OrderStatusInfo;
}

/** Payload de criação de pedido a partir do carrinho */
export interface CreateOrderItemInput {
  product_id?: string | null;
  name: string;
  size?: string | null;
  price: number;
  quantity: number;
  image_url?: string | null;
}

export interface CreateOrderInput {
  items: CreateOrderItemInput[];
  customer_name?: string | null;
  customer_email?: string | null;
  customer_phone?: string | null;
  customer_notes?: string | null;
  user_id?: string | null;
  frete?: number;
  discount?: number;
}

export interface CreateOrderResponse {
  success: boolean;
  orderId: string;
  reference: string;
  trackingToken: string;
  trackingUrl: string;
  message: string;
}
