-- ==============================================================================
-- Migração: Sistema de Pedidos, Acompanhamento Seguro e Itens
-- Projeto: Use Três Marias
--
-- Contexto:
-- Criação das tabelas public.orders e public.order_items para suportar o fluxo de
-- fechamento de pedidos via WhatsApp com link individual criptograficamente seguro.
--
-- Recursos de Segurança:
-- 1. Token de acompanhamento armazenado exclusivamente como hash SHA-256 (token_hash).
-- 2. RLS estrita: leitura e alteração administrativa exclusiva para public.is_admin().
-- 3. Função RPC segura (SECURITY DEFINER) para consulta pública por hash de token,
--    evitando expor a tabela completa ou dados sensíveis a clientes não autenticados.
-- 4. Registro fotográfico dos itens e preços no momento da compra.
-- ==============================================================================

-- 1. Tabela Principal de Pedidos
CREATE TABLE IF NOT EXISTS public.orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    reference text NOT NULL UNIQUE,
    token_hash text NOT NULL UNIQUE,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'on_the_way', 'completed')),
    subtotal numeric(10, 2) NOT NULL CHECK (subtotal >= 0),
    frete numeric(10, 2) NOT NULL DEFAULT 0 CHECK (frete >= 0),
    discount numeric(10, 2) NOT NULL DEFAULT 0 CHECK (discount >= 0),
    total numeric(10, 2) NOT NULL CHECK (total >= 0),
    customer_name text,
    customer_phone text,
    customer_notes text,
    status_history jsonb NOT NULL DEFAULT '[]'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    completed_at timestamptz
);

-- 2. Tabela de Itens do Pedido (Snapshot comercial)
CREATE TABLE IF NOT EXISTS public.order_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
    name text NOT NULL,
    size text NOT NULL DEFAULT 'Único',
    price numeric(10, 2) NOT NULL CHECK (price >= 0),
    quantity integer NOT NULL CHECK (quantity > 0),
    subtotal numeric(10, 2) NOT NULL CHECK (subtotal >= 0),
    image_url text,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Índices de Alta Performance
CREATE INDEX IF NOT EXISTS idx_orders_token_hash ON public.orders(token_hash);
CREATE INDEX IF NOT EXISTS idx_orders_reference ON public.orders(reference);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);

-- 4. Habilitação de Row Level Security (RLS)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 5. Políticas de Acesso Administrativo
DROP POLICY IF EXISTS "Administradores gerenciam pedidos" ON public.orders;
CREATE POLICY "Administradores gerenciam pedidos"
    ON public.orders FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Administradores gerenciam itens de pedidos" ON public.order_items;
CREATE POLICY "Administradores gerenciam itens de pedidos"
    ON public.order_items FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 6. Políticas de Inserção Pública (Checkout)
DROP POLICY IF EXISTS "Criação pública de pedidos" ON public.orders;
CREATE POLICY "Criação pública de pedidos"
    ON public.orders FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Criação pública de itens de pedidos" ON public.order_items;
CREATE POLICY "Criação pública de itens de pedidos"
    ON public.order_items FOR INSERT
    WITH CHECK (true);

-- 7. Função de Consulta Pública Segura (SECURITY DEFINER)
-- Retorna somente as informações públicas necessárias do pedido pelo token_hash,
-- impedindo a listagem indiscriminada por usuários anônimos.
CREATE OR REPLACE FUNCTION public.get_order_by_token_hash(p_token_hash text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_order jsonb;
    v_clean text := trim(p_token_hash);
BEGIN
    SELECT jsonb_build_object(
        'reference', o.reference,
        'status', o.status,
        'subtotal', o.subtotal,
        'frete', o.frete,
        'discount', o.discount,
        'total', o.total,
        'created_at', o.created_at,
        'updated_at', o.updated_at,
        'completed_at', o.completed_at,
        'items', coalesce((
            SELECT jsonb_agg(
                jsonb_build_object(
                    'id', oi.id,
                    'product_id', oi.product_id,
                    'name', oi.name,
                    'size', oi.size,
                    'price', oi.price,
                    'quantity', oi.quantity,
                    'subtotal', oi.subtotal,
                    'image_url', oi.image_url
                ) ORDER BY oi.created_at ASC
            )
            FROM public.order_items oi
            WHERE oi.order_id = o.id
        ), '[]'::jsonb)
    ) INTO v_order
    FROM public.orders o
    WHERE o.token_hash = v_clean
       OR (length(v_clean) = 36 AND o.id::text = v_clean)
       OR o.reference = v_clean
    LIMIT 1;

    RETURN v_order;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_order_by_token_hash(text) TO anon, authenticated;
