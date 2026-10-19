-- ==============================================================================
-- Migração: Criação das tabelas do CMS (Páginas, Seções e Storage de Mídia)
-- Projeto: Use Três Marias
-- ==============================================================================

-- 1. Tabela de Páginas do CMS
CREATE TABLE IF NOT EXISTS public.cms_pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Tabela de Seções do CMS
CREATE TABLE IF NOT EXISTS public.cms_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    page_id UUID NOT NULL REFERENCES public.cms_pages(id) ON DELETE CASCADE,
    stable_key VARCHAR(100) NOT NULL,
    section_type VARCHAR(50) NOT NULL,
    internal_title VARCHAR(255) NOT NULL,
    position INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT true,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    draft_content JSONB NOT NULL DEFAULT '{}'::jsonb,
    published_content JSONB DEFAULT NULL,
    published_at TIMESTAMPTZ DEFAULT NULL,
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_cms_sections_page_stable_key UNIQUE (page_id, stable_key)
);

-- Índices para performance de consulta
CREATE INDEX IF NOT EXISTS idx_cms_sections_lookup 
    ON public.cms_sections(page_id, position, is_active, status);

CREATE INDEX IF NOT EXISTS idx_cms_pages_slug 
    ON public.cms_pages(slug) WHERE is_active = true;

-- 3. Habilitação de RLS (Row Level Security)
ALTER TABLE public.cms_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_sections ENABLE ROW LEVEL SECURITY;

-- Políticas para cms_pages
DROP POLICY IF EXISTS "Leitura pública de páginas ativas" ON public.cms_pages;
CREATE POLICY "Leitura pública de páginas ativas"
    ON public.cms_pages
    FOR SELECT
    USING (is_active = true);

DROP POLICY IF EXISTS "Administradores gerenciam páginas" ON public.cms_pages;
CREATE POLICY "Administradores gerenciam páginas"
    ON public.cms_pages
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Políticas para cms_sections
DROP POLICY IF EXISTS "Leitura pública de seções publicadas" ON public.cms_sections;
CREATE POLICY "Leitura pública de seções publicadas"
    ON public.cms_sections
    FOR SELECT
    USING (is_active = true AND status = 'published' AND published_content IS NOT NULL);

DROP POLICY IF EXISTS "Administradores gerenciam seções" ON public.cms_sections;
CREATE POLICY "Administradores gerenciam seções"
    ON public.cms_sections
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 4. Criação do Bucket de Mídia para Imagens do CMS
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'cms-media',
    'cms-media',
    true,
    5242880, -- Limite de 5MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];

-- Políticas de acesso ao Storage para cms-media
DROP POLICY IF EXISTS "Acesso público às imagens do CMS" ON storage.objects;
CREATE POLICY "Acesso público às imagens do CMS"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'cms-media');

DROP POLICY IF EXISTS "Administradores podem fazer upload no CMS" ON storage.objects;
CREATE POLICY "Administradores podem fazer upload no CMS"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'cms-media');

DROP POLICY IF EXISTS "Administradores podem gerenciar imagens do CMS" ON storage.objects;
CREATE POLICY "Administradores podem gerenciar imagens do CMS"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (bucket_id = 'cms-media');

DROP POLICY IF EXISTS "Administradores podem remover imagens do CMS" ON storage.objects;
CREATE POLICY "Administradores podem remover imagens do CMS"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (bucket_id = 'cms-media');

-- 5. Seed Inicial: Página Home e Seção Hero Padrão
DO $$
DECLARE
    v_page_id UUID;
BEGIN
    -- Inserir página Home se não existir
    INSERT INTO public.cms_pages (slug, title, is_active)
    VALUES ('home', 'Página Inicial', true)
    ON CONFLICT (slug) DO UPDATE SET is_active = true
    RETURNING id INTO v_page_id;

    -- Inserir ou atualizar Seção Hero com dados iniciais elegantes da marca
    INSERT INTO public.cms_sections (
        page_id,
        stable_key,
        section_type,
        internal_title,
        position,
        is_active,
        status,
        draft_content,
        published_content,
        published_at
    )
    VALUES (
        v_page_id,
        'home-hero',
        'hero',
        'Hero Principal - Lançamento e Destaque',
        1,
        true,
        'published',
        '{
            "desktop_image_url": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1920&q=80",
            "mobile_image_url": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=768&q=80",
            "alt_text": "Coleção exclusiva de semijoias finas Use Três Marias",
            "title": "Elegância atemporal para realçar a sua essência",
            "description": "Descubra semijoias exclusivas criadas com design contemporâneo e acabamento refinado de alta joalheria.",
            "button_text": "Explorar Novidades",
            "button_url": "/#novidades",
            "content_alignment": "left",
            "image_position": "background",
            "overlay_opacity": 30
        }'::jsonb,
        '{
            "desktop_image_url": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1920&q=80",
            "mobile_image_url": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=768&q=80",
            "alt_text": "Coleção exclusiva de semijoias finas Use Três Marias",
            "title": "Elegância atemporal para realçar a sua essência",
            "description": "Descubra semijoias exclusivas criadas com design contemporâneo e acabamento refinado de alta joalheria.",
            "button_text": "Explorar Novidades",
            "button_url": "/#novidades",
            "content_alignment": "left",
            "image_position": "background",
            "overlay_opacity": 30
        }'::jsonb,
        now()
    )
    ON CONFLICT (page_id, stable_key) DO NOTHING;
END $$;
