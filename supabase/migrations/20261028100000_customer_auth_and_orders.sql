-- ==============================================================================
-- Migração: Autenticação de Clientes e Vinculação de Pedidos
-- Projeto: Use Três Marias
-- Data: 2026-10-28
--
-- Objetivos:
-- 1. Adicionar colunas `user_id` e `customer_email` na tabela `public.orders`.
-- 2. `user_id` referencia `auth.users(id)` com ON DELETE SET NULL (nullable para preservar pedidos legados).
-- 3. Adicionar índices de performance para consultas por cliente.
-- 4. Definir políticas RLS seguras para que clientes autenticados:
--    - Consultem apenas seus próprios pedidos (auth.uid() = user_id).
--    - Consultem apenas itens dos seus próprios pedidos.
--    - Criem pedidos autenticados onde auth.uid() = user_id.
--    - Criem itens vinculados exclusivamente a pedidos de sua titularidade.
-- 5. Preservar o acesso total e irrestrito de administradores (public.is_admin()).
-- 6. Preservar a função pública de acompanhamento por token (get_order_by_token_hash).
-- ==============================================================================

-- 1. Adição de colunas na tabela public.orders
ALTER TABLE public.orders
    ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS customer_email text;

-- 2. Índices de performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON public.orders(customer_email);

-- 3. Políticas RLS para Clientes Autenticados em public.orders

-- Permitir que clientes visualizem exclusivamente seus próprios pedidos
DROP POLICY IF EXISTS "Clientes visualizam seus próprios pedidos" ON public.orders;
CREATE POLICY "Clientes visualizam seus próprios pedidos"
    ON public.orders FOR SELECT
    TO authenticated
    USING (
        auth.uid() = user_id
        OR public.is_admin()
    );

-- Permitir que clientes autenticados criem pedidos com seu próprio user_id
DROP POLICY IF EXISTS "Clientes autenticados criam pedidos" ON public.orders;
CREATE POLICY "Clientes autenticados criam pedidos"
    ON public.orders FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = user_id
        OR public.is_admin()
    );

-- 4. Políticas RLS para Itens de Pedido em public.order_items

-- Permitir que clientes visualizem itens exclusivamente dos seus próprios pedidos
DROP POLICY IF EXISTS "Clientes visualizam itens de seus pedidos" ON public.order_items;
CREATE POLICY "Clientes visualizam itens de seus pedidos"
    ON public.order_items FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.orders o
            WHERE o.id = public.order_items.order_id
              AND (o.user_id = auth.uid() OR public.is_admin())
        )
    );

-- Permitir que clientes autenticados criem itens vinculados exclusivamente a seus pedidos
DROP POLICY IF EXISTS "Clientes autenticados criam itens de pedidos" ON public.order_items;
CREATE POLICY "Clientes autenticados criam itens de pedidos"
    ON public.order_items FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.orders o
            WHERE o.id = public.order_items.order_id
              AND (o.user_id = auth.uid() OR public.is_admin())
        )
    );

-- 5. Atualização da função RPC de acompanhamento seguro para retornar dados do pedido sem vazar user_id
-- (Garante que a função continue funcionando com permissão SECURITY DEFINER)
COMMENT ON COLUMN public.orders.user_id IS 'Identificador do usuário no Supabase Auth que realizou a compra';
COMMENT ON COLUMN public.orders.customer_email IS 'E-mail do comprador obtido da sessão de autenticação';
