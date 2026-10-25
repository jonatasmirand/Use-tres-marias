-- ==============================================================================
-- Migração: Endurecimento de segurança (RLS restrito ao papel "admin")
-- Projeto: Use Três Marias
-- Execute no SQL Editor do Supabase. O script é idempotente (pode rodar 2x).
--
-- Antes: qualquer usuário autenticado podia escrever em produtos, categorias,
-- páginas, seções e imagens. Agora somente quem tem app_metadata.role = 'admin'.
-- ==============================================================================

-- 1. Função auxiliar: o usuário da requisição é administrador?
--    app_metadata só pode ser alterado pelo service_role (o usuário não consegue
--    editar o próprio papel), por isso é seguro usá-lo nas políticas.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SET search_path = ''
AS $$
  SELECT coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

-- 2. Produtos
DROP POLICY IF EXISTS "Administradores gerenciam produtos" ON public.products;
CREATE POLICY "Administradores gerenciam produtos"
    ON public.products FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 3. Categorias
DROP POLICY IF EXISTS "Administradores gerenciam categorias" ON public.categories;
CREATE POLICY "Administradores gerenciam categorias"
    ON public.categories FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 4. Páginas do CMS
DROP POLICY IF EXISTS "Administradores gerenciam páginas" ON public.cms_pages;
CREATE POLICY "Administradores gerenciam páginas"
    ON public.cms_pages FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 5. Seções do CMS
DROP POLICY IF EXISTS "Administradores gerenciam seções" ON public.cms_sections;
CREATE POLICY "Administradores gerenciam seções"
    ON public.cms_sections FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 6. Storage (bucket cms-media): escrita somente para admin
DROP POLICY IF EXISTS "Administradores podem fazer upload no CMS" ON storage.objects;
CREATE POLICY "Administradores podem fazer upload no CMS"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'cms-media' AND public.is_admin());

DROP POLICY IF EXISTS "Administradores podem gerenciar imagens do CMS" ON storage.objects;
CREATE POLICY "Administradores podem gerenciar imagens do CMS"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'cms-media' AND public.is_admin())
    WITH CHECK (bucket_id = 'cms-media' AND public.is_admin());

DROP POLICY IF EXISTS "Administradores podem remover imagens do CMS" ON storage.objects;
CREATE POLICY "Administradores podem remover imagens do CMS"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'cms-media' AND public.is_admin());

-- 7. Bucket: remove SVG dos tipos aceitos (SVG pode conter scripts)
UPDATE storage.buckets
SET allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp']
WHERE id = 'cms-media';
