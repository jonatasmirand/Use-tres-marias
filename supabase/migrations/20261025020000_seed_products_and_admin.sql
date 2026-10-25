-- ==============================================================================
-- Script: Definir Administrador e Popular Produtos do Catálogo (Seed)
-- Projeto: Use Três Marias
-- Execute no SQL Editor do Supabase. Este script é idempotente.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. CONCEDER PAPEL DE ADMINISTRADOR A TODOS OS USUÁRIOS ATUAIS
-- ------------------------------------------------------------------------------
-- Atualiza o app_metadata para incluir "role": "admin"
-- Se quiser restringir a um e-mail específico, substitua por:
-- WHERE email = 'seu-email@dominio.com';
UPDATE auth.users
SET raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb;

-- ------------------------------------------------------------------------------
-- 2. GARANTIR QUE AS CATEGORIAS EXISTEM
-- ------------------------------------------------------------------------------
INSERT INTO public.categories (name, slug, is_active)
VALUES
    ('Vestidos',  'vestidos',  true),
    ('Blusas',    'blusas',    true),
    ('Bermudas',  'bermudas',  true),
    ('Conjuntos', 'conjuntos', true)
ON CONFLICT (slug) DO UPDATE
SET is_active = true;

-- ------------------------------------------------------------------------------
-- 3. INSERIR OS 10 PRODUTOS INICIAIS DO CATÁLOGO (COM UUIDS VÁLIDOS)
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    v_cat_vestidos  UUID;
    v_cat_blusas    UUID;
    v_cat_bermudas  UUID;
    v_cat_conjuntos UUID;
BEGIN
    SELECT id INTO v_cat_vestidos  FROM public.categories WHERE slug = 'vestidos' LIMIT 1;
    SELECT id INTO v_cat_blusas    FROM public.categories WHERE slug = 'blusas' LIMIT 1;
    SELECT id INTO v_cat_bermudas  FROM public.categories WHERE slug = 'bermudas' LIMIT 1;
    SELECT id INTO v_cat_conjuntos FROM public.categories WHERE slug = 'conjuntos' LIMIT 1;

    -- VESTIDOS
    INSERT INTO public.products (name, slug, description, price, images, sizes, is_new, is_active, position, category_id)
    VALUES
    (
        'Vestido Midi Alfaiataria Marsala',
        'vestido-midi-alfaiataria-marsala',
        'Vestido midi estruturado em alfaiataria com decote quadrado, fenda sutil e caimento impecável para ocasiões marcantes.',
        389.90,
        ARRAY['https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=900&q=80'],
        ARRAY['PP', 'P', 'M', 'G'],
        true, true, 1, v_cat_vestidos
    )
    ON CONFLICT (slug) DO UPDATE SET
        category_id = EXCLUDED.category_id,
        price = EXCLUDED.price,
        images = EXCLUDED.images;

    INSERT INTO public.products (name, slug, description, price, images, sizes, is_new, is_active, position, category_id)
    VALUES
    (
        'Vestido Longo Linho Puro Cru',
        'vestido-longo-linho-puro-cru',
        'Confeccionado em puro linho leve, alças reguláveis e detalhe de botões frontais forrados no mesmo tecido.',
        449.00,
        ARRAY['https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80'],
        ARRAY['P', 'M', 'G'],
        false, true, 2, v_cat_vestidos
    )
    ON CONFLICT (slug) DO UPDATE SET
        category_id = EXCLUDED.category_id,
        price = EXCLUDED.price,
        images = EXCLUDED.images;

    INSERT INTO public.products (name, slug, description, price, images, sizes, is_new, is_active, position, category_id)
    VALUES
    (
        'Vestido Evasê Manga Bufante Verde Floresta',
        'vestido-evase-manga-bufante-verde-floresta',
        'Modelagem romântica com mangas bufantes sutis, elástico confortável nos punhos e decote em V sofisticado.',
        359.90,
        ARRAY['https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=80'],
        ARRAY['PP', 'P', 'M', 'G', 'GG'],
        true, true, 3, v_cat_vestidos
    )
    ON CONFLICT (slug) DO UPDATE SET
        category_id = EXCLUDED.category_id,
        price = EXCLUDED.price,
        images = EXCLUDED.images;

    -- BLUSAS
    INSERT INTO public.products (name, slug, description, price, images, sizes, is_new, is_active, position, category_id)
    VALUES
    (
        'Camisa de Linho Alvo com Amarração',
        'camisa-linho-alvo-com-amarracao',
        'Corte clássico estruturado com toque macio e acabamento premium. Possui faixa opcional para amarração frontal.',
        249.90,
        ARRAY['https://images.unsplash.com/photo-1551163943-3f6a855d1153?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=900&q=80'],
        ARRAY['P', 'M', 'G'],
        true, true, 1, v_cat_blusas
    )
    ON CONFLICT (slug) DO UPDATE SET
        category_id = EXCLUDED.category_id,
        price = EXCLUDED.price,
        images = EXCLUDED.images;

    INSERT INTO public.products (name, slug, description, price, images, sizes, is_new, is_active, position, category_id)
    VALUES
    (
        'Regata de Seda Dourada',
        'regata-seda-dourada',
        'Alças finas e caimento fluido que valorizam a silhueta, acessórios e semijoias finas.',
        189.00,
        ARRAY['https://images.unsplash.com/photo-1589310243389-96a5483213a8?auto=format&fit=crop&w=900&q=80'],
        ARRAY['PP', 'P', 'M', 'G'],
        false, true, 2, v_cat_blusas
    )
    ON CONFLICT (slug) DO UPDATE SET
        category_id = EXCLUDED.category_id,
        price = EXCLUDED.price,
        images = EXCLUDED.images;

    -- BERMUDAS
    INSERT INTO public.products (name, slug, description, price, images, sizes, is_new, is_active, position, category_id)
    VALUES
    (
        'Bermuda Alfaiataria Preta com Cinto Forrado',
        'bermuda-alfaiataria-preta-com-cinto-forrado',
        'Comprimento elegante meia-coxa, pregas frontais bem marcadas e cinto encapado no mesmo tom.',
        269.00,
        ARRAY['https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=900&q=80'],
        ARRAY['36', '38', '40', '42'],
        false, true, 1, v_cat_bermudas
    )
    ON CONFLICT (slug) DO UPDATE SET
        category_id = EXCLUDED.category_id,
        price = EXCLUDED.price,
        images = EXCLUDED.images;

    INSERT INTO public.products (name, slug, description, price, images, sizes, is_new, is_active, position, category_id)
    VALUES
    (
        'Bermuda Linho Natural Terracota',
        'bermuda-linho-natural-terracota',
        'Toque fresco de linho misto com cós elástico anatômico na parte posterior e bolsos faca funcionais.',
        239.00,
        ARRAY['https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=900&q=80'],
        ARRAY['P', 'M', 'G'],
        true, true, 2, v_cat_bermudas
    )
    ON CONFLICT (slug) DO UPDATE SET
        category_id = EXCLUDED.category_id,
        price = EXCLUDED.price,
        images = EXCLUDED.images;

    -- CONJUNTOS
    INSERT INTO public.products (name, slug, description, price, images, sizes, is_new, is_active, position, category_id)
    VALUES
    (
        'Conjunto Colete & Calça Risca de Giz Marinho',
        'conjunto-colete-calca-risca-de-giz-marinho',
        'Inspirado no estilo Três Marias: colete estruturado com botões nobres e calça pantalona de corte reto impecável.',
        529.00,
        ARRAY['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80'],
        ARRAY['PP', 'P', 'M', 'G'],
        true, true, 1, v_cat_conjuntos
    )
    ON CONFLICT (slug) DO UPDATE SET
        category_id = EXCLUDED.category_id,
        price = EXCLUDED.price,
        images = EXCLUDED.images;

    INSERT INTO public.products (name, slug, description, price, images, sizes, is_new, is_active, position, category_id)
    VALUES
    (
        'Conjunto Alfaiataria Burgundy Blazer Sem Manga & Saia',
        'conjunto-alfaiataria-burgundy-blazer-saia',
        'Sofisticação marcante em tom vinho profundo. Blazer alongado sem mangas com gola smoking e saia midi acetinada.',
        499.00,
        ARRAY['https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=80'],
        ARRAY['P', 'M', 'G'],
        true, true, 2, v_cat_conjuntos
    )
    ON CONFLICT (slug) DO UPDATE SET
        category_id = EXCLUDED.category_id,
        price = EXCLUDED.price,
        images = EXCLUDED.images;

    INSERT INTO public.products (name, slug, description, price, images, sizes, is_new, is_active, position, category_id)
    VALUES
    (
        'Conjunto Linho Off-White Cropped & Pantalona',
        'conjunto-linho-off-white-cropped-pantalona',
        'Elegância minimalista em linho cru. Perfeito para eventos especiais, almoços de domingo ou um dia comum com beleza.',
        469.00,
        ARRAY['https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80'],
        ARRAY['PP', 'P', 'M', 'G'],
        false, true, 3, v_cat_conjuntos
    )
    ON CONFLICT (slug) DO UPDATE SET
        category_id = EXCLUDED.category_id,
        price = EXCLUDED.price,
        images = EXCLUDED.images;
END $$;
