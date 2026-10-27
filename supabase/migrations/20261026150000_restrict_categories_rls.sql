-- ==============================================================================
-- Migração: Restrição da Leitura Pública de Categorias na RLS
-- Projeto: Use Três Marias
--
-- Contexto:
-- A migração 20261021150000_catalog_and_slider.sql continha a política
-- "Leitura pública de categorias" com a cláusula USING (true), permitindo
-- a leitura de categorias inativas por usuários anônimos via Supabase.
--
-- Esta migração incremental:
-- 1. Remove a política permissiva "Leitura pública de categorias" (USING true).
-- 2. Cria "Leitura pública de categorias ativas" com USING (is_active = true).
-- 3. Reafirma "Administradores gerenciam categorias" para ALL TO authenticated
--    com USING (public.is_admin()) e WITH CHECK (public.is_admin()).
--
-- Como políticas permissivas para SELECT são combinadas por OR no PostgreSQL,
-- a remoção da política antiga é essencial para que o filtro tenha eficácia.
-- ==============================================================================

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- 1. Remove políticas de leitura pública anteriores
DROP POLICY IF EXISTS "Leitura pública de categorias" ON public.categories;
DROP POLICY IF EXISTS "Leitura pública de categorias ativas" ON public.categories;

-- 2. Cria política de leitura pública restrita a categorias ativas
CREATE POLICY "Leitura pública de categorias ativas"
    ON public.categories FOR SELECT
    USING (is_active = true);

-- 3. Reafirma permissão completa para administradores
DROP POLICY IF EXISTS "Administradores gerenciam categorias" ON public.categories;
CREATE POLICY "Administradores gerenciam categorias"
    ON public.categories FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());
