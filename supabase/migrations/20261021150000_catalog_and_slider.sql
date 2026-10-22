-- ==============================================================================
-- Migração: Catálogo por categoria + Carrossel institucional no Hero
-- Projeto: Use Três Marias
-- Execute no SQL Editor do Supabase. O script é idempotente (pode rodar 2x).
-- ==============================================================================

-- 1. Novos campos no catálogo de produtos
ALTER TABLE public.products
    ADD COLUMN IF NOT EXISTS images   TEXT[]  NOT NULL DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS sizes    TEXT[]  NOT NULL DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS is_new   BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS position INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_products_category_position
    ON public.products(category_id, position);

CREATE INDEX IF NOT EXISTS idx_products_is_new
    ON public.products(is_new) WHERE is_new = true;

-- 2. Categorias (tipos de roupa) usadas no menu e no painel
INSERT INTO public.categories (name, slug, is_active)
SELECT v.name, v.slug, true
FROM (VALUES
    ('Vestidos',  'vestidos'),
    ('Blusas',    'blusas'),
    ('Bermudas',  'bermudas'),
    ('Conjuntos', 'conjuntos')
) AS v(name, slug)
WHERE NOT EXISTS (
    SELECT 1 FROM public.categories c WHERE c.slug = v.slug
);

-- 3. Políticas de acesso (leitura pública / escrita somente admin autenticado)
ALTER TABLE public.products   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Leitura pública de produtos ativos" ON public.products;
CREATE POLICY "Leitura pública de produtos ativos"
    ON public.products FOR SELECT
    USING (is_active = true);

DROP POLICY IF EXISTS "Administradores gerenciam produtos" ON public.products;
CREATE POLICY "Administradores gerenciam produtos"
    ON public.products FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Leitura pública de categorias" ON public.categories;
CREATE POLICY "Leitura pública de categorias"
    ON public.categories FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Administradores gerenciam categorias" ON public.categories;
CREATE POLICY "Administradores gerenciam categorias"
    ON public.categories FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 4. Seções da Home: desativa as vitrines que saíram da página inicial
UPDATE public.cms_sections
SET is_active = false, updated_at = now()
WHERE stable_key IN ('home-vestidos', 'home-blusas', 'home-bermudas');
