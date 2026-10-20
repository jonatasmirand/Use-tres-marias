-- ==============================================================================
-- Migração Complementar: Seed das Seções de Coleções (3 Cards cada)
-- Novidades, Vestidos, Blusas, Bermudas, Conjuntos
-- ==============================================================================

DO $$
DECLARE
    v_page_id UUID;
BEGIN
    SELECT id INTO v_page_id FROM public.cms_pages WHERE slug = 'home' LIMIT 1;

    IF v_page_id IS NOT NULL THEN
        -- 1. Seção Novidades
        INSERT INTO public.cms_sections (
            page_id, stable_key, section_type, internal_title, position, is_active, status, draft_content, published_content, published_at
        )
        VALUES (
            v_page_id,
            'home-novidades',
            'novidades',
            'Seção Novidades - Três Peças',
            2,
            true,
            'published',
            '{
                "section_badge": "Coleção Exclusiva",
                "section_headline": "Novidades da Semana",
                "section_subheadline": "Lançamentos selecionados para compor produções elegantes e contemporâneas.",
                "view_all_text": "Ver Todas as Novidades",
                "view_all_url": "/#novidades",
                "cards": [
                    {
                        "id": "novidades-card-1",
                        "image_url": "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=700&h=700&q=80",
                        "alt_text": "Argolas Banhadas a Ouro 18k",
                        "title": "Argolas Banhadas 18k",
                        "description": "Design minimalista e atemporal com banho nobre de alta durabilidade.",
                        "button_text": "Ver Detalhes",
                        "button_url": "/#novidades",
                        "badge": "Lançamento",
                        "is_visible": true,
                        "position": 1
                    },
                    {
                        "id": "novidades-card-2",
                        "image_url": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=700&h=700&q=80",
                        "alt_text": "Colar Ponto de Luz Zircônia",
                        "title": "Colar Ponto de Luz",
                        "description": "Gargantilha delicada com zircônia cristal lapidada e fecho joalheiro.",
                        "button_text": "Ver Detalhes",
                        "button_url": "/#novidades",
                        "badge": "Mais Vendido",
                        "is_visible": true,
                        "position": 2
                    },
                    {
                        "id": "novidades-card-3",
                        "image_url": "https://images.unsplash.com/photo-1611591475816-16e6f5c889a7?auto=format&fit=crop&w=700&h=700&q=80",
                        "alt_text": "Pulseira Riviera Cravejada",
                        "title": "Pulseira Riviera",
                        "description": "Cravejada com pedras premium de brilho intenso para ocasiões marcantes.",
                        "button_text": "Ver Detalhes",
                        "button_url": "/#novidades",
                        "badge": "Exclusivo",
                        "is_visible": true,
                        "position": 3
                    }
                ]
            }'::jsonb,
            '{
                "section_badge": "Coleção Exclusiva",
                "section_headline": "Novidades da Semana",
                "section_subheadline": "Lançamentos selecionados para compor produções elegantes e contemporâneas.",
                "view_all_text": "Ver Todas as Novidades",
                "view_all_url": "/#novidades",
                "cards": [
                    {
                        "id": "novidades-card-1",
                        "image_url": "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=700&h=700&q=80",
                        "alt_text": "Argolas Banhadas a Ouro 18k",
                        "title": "Argolas Banhadas 18k",
                        "description": "Design minimalista e atemporal com banho nobre de alta durabilidade.",
                        "button_text": "Ver Detalhes",
                        "button_url": "/#novidades",
                        "badge": "Lançamento",
                        "is_visible": true,
                        "position": 1
                    },
                    {
                        "id": "novidades-card-2",
                        "image_url": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=700&h=700&q=80",
                        "alt_text": "Colar Ponto de Luz Zircônia",
                        "title": "Colar Ponto de Luz",
                        "description": "Gargantilha delicada com zircônia cristal lapidada e fecho joalheiro.",
                        "button_text": "Ver Detalhes",
                        "button_url": "/#novidades",
                        "badge": "Mais Vendido",
                        "is_visible": true,
                        "position": 2
                    },
                    {
                        "id": "novidades-card-3",
                        "image_url": "https://images.unsplash.com/photo-1611591475816-16e6f5c889a7?auto=format&fit=crop&w=700&h=700&q=80",
                        "alt_text": "Pulseira Riviera Cravejada",
                        "title": "Pulseira Riviera",
                        "description": "Cravejada com pedras premium de brilho intenso para ocasiões marcantes.",
                        "button_text": "Ver Detalhes",
                        "button_url": "/#novidades",
                        "badge": "Exclusivo",
                        "is_visible": true,
                        "position": 3
                    }
                ]
            }'::jsonb,
            now()
        )
        ON CONFLICT (page_id, stable_key) DO NOTHING;

        -- 2. Seção Vestidos
        INSERT INTO public.cms_sections (
            page_id, stable_key, section_type, internal_title, position, is_active, status, draft_content, published_content, published_at
        )
        VALUES (
            v_page_id,
            'home-vestidos',
            'vestidos',
            'Seção Vestidos - Três Peças',
            3,
            true,
            'published',
            '{
                "section_badge": "Alta Costura & Fluidez",
                "section_headline": "Vestidos Elegantes",
                "section_subheadline": "Modelagens sofisticadas com caimento impecável e tecidos nobres para ocasiões inesquecíveis.",
                "view_all_text": "Explorar Vestidos",
                "view_all_url": "/#vestidos",
                "cards": [
                    {
                        "id": "vestidos-card-1",
                        "image_url": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=700&h=700&q=80",
                        "alt_text": "Vestido Longo Seda Esmeralda",
                        "title": "Vestido Longo Esmeralda",
                        "description": "Fluidez incomparável com decote elegante e fenda sutil refinada.",
                        "button_text": "Ver Peça",
                        "button_url": "/#vestidos",
                        "badge": "Destaque",
                        "is_visible": true,
                        "position": 1
                    },
                    {
                        "id": "vestidos-card-2",
                        "image_url": "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=700&h=700&q=80",
                        "alt_text": "Vestido Midi Linho Cru",
                        "title": "Vestido Midi em Linho",
                        "description": "Frescor e elegância natural em fibra pura com abotoamento frontal.",
                        "button_text": "Ver Peça",
                        "button_url": "/#vestidos",
                        "badge": "Linha Natural",
                        "is_visible": true,
                        "position": 2
                    },
                    {
                        "id": "vestidos-card-3",
                        "image_url": "https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?auto=format&fit=crop&w=700&h=700&q=80",
                        "alt_text": "Vestido Cetim Champagne",
                        "title": "Vestido Cetim Champagne",
                        "description": "Toque acetinado suave com alças delicadas para eventos noturnos.",
                        "button_text": "Ver Peça",
                        "button_url": "/#vestidos",
                        "badge": "Noite",
                        "is_visible": true,
                        "position": 3
                    }
                ]
            }'::jsonb,
            '{
                "section_badge": "Alta Costura & Fluidez",
                "section_headline": "Vestidos Elegantes",
                "section_subheadline": "Modelagens sofisticadas com caimento impecável e tecidos nobres para ocasiões inesquecíveis.",
                "view_all_text": "Explorar Vestidos",
                "view_all_url": "/#vestidos",
                "cards": [
                    {
                        "id": "vestidos-card-1",
                        "image_url": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=700&h=700&q=80",
                        "alt_text": "Vestido Longo Seda Esmeralda",
                        "title": "Vestido Longo Esmeralda",
                        "description": "Fluidez incomparável com decote elegante e fenda sutil refinada.",
                        "button_text": "Ver Peça",
                        "button_url": "/#vestidos",
                        "badge": "Destaque",
                        "is_visible": true,
                        "position": 1
                    },
                    {
                        "id": "vestidos-card-2",
                        "image_url": "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=700&h=700&q=80",
                        "alt_text": "Vestido Midi Linho Cru",
                        "title": "Vestido Midi em Linho",
                        "description": "Frescor e elegância natural em fibra pura com abotoamento frontal.",
                        "button_text": "Ver Peça",
                        "button_url": "/#vestidos",
                        "badge": "Linha Natural",
                        "is_visible": true,
                        "position": 2
                    },
                    {
                        "id": "vestidos-card-3",
                        "image_url": "https://images.unsplash.com/photo-1568252542512-9fe8fe9c87bb?auto=format&fit=crop&w=700&h=700&q=80",
                        "alt_text": "Vestido Cetim Champagne",
                        "title": "Vestido Cetim Champagne",
                        "description": "Toque acetinado suave com alças delicadas para eventos noturnos.",
                        "button_text": "Ver Peça",
                        "button_url": "/#vestidos",
                        "badge": "Noite",
                        "is_visible": true,
                        "position": 3
                    }
                ]
            }'::jsonb,
            now()
        )
        ON CONFLICT (page_id, stable_key) DO NOTHING;

        -- 3. Seção Blusas
        INSERT INTO public.cms_sections (
            page_id, stable_key, section_type, internal_title, position, is_active, status, draft_content, published_content, published_at
        )
        VALUES (
            v_page_id,
            'home-blusas',
            'blusas',
            'Seção Blusas - Três Peças',
            4,
            true,
            'published',
            '{
                "section_badge": "Delicadeza & Versatilidade",
                "section_headline": "Blusas & Camisas",
                "section_subheadline": "Peças versáteis em tecidos leves que transitam com facilidade do dia de trabalho ao jantar especial.",
                "view_all_text": "Explorar Blusas",
                "view_all_url": "/#blusas",
                "cards": [
                    {
                        "id": "blusas-card-1",
                        "image_url": "https://images.unsplash.com/photo-1551163943-3f6a855d1153?auto=format&fit=crop&w=700&h=700&q=80",
                        "alt_text": "Camisa de Linho Alvo",
                        "title": "Camisa Linho Alvo",
                        "description": "Corte clássico estruturado com toque macio e acabamento premium.",
                        "button_text": "Ver Peça",
                        "button_url": "/#blusas",
                        "badge": "Essencial",
                        "is_visible": true,
                        "position": 1
                    },
                    {
                        "id": "blusas-card-2",
                        "image_url": "https://images.unsplash.com/photo-1589310243389-96a5483213a8?auto=format&fit=crop&w=700&h=700&q=80",
                        "alt_text": "Regata de Seda Dourada",
                        "title": "Regata Seda Dourada",
                        "description": "Alças finas e caimento leve que valorizam acessórios e semijoias.",
                        "button_text": "Ver Peça",
                        "button_url": "/#blusas",
                        "badge": "Festa",
                        "is_visible": true,
                        "position": 2
                    },
                    {
                        "id": "blusas-card-3",
                        "image_url": "https://images.unsplash.com/photo-1518049362265-d5b2a6467637?auto=format&fit=crop&w=700&h=700&q=80",
                        "alt_text": "Blusa Alfaiataria Manga Bufante",
                        "title": "Blusa Alfaiataria Bufante",
                        "description": "Detalhe volumétrico sutil nas mangas para um visual marcante.",
                        "button_text": "Ver Peça",
                        "button_url": "/#blusas",
                        "badge": "Tendência",
                        "is_visible": true,
                        "position": 3
                    }
                ]
            }'::jsonb,
            '{
                "section_badge": "Delicadeza & Versatilidade",
                "section_headline": "Blusas & Camisas",
                "section_subheadline": "Peças versáteis em tecidos leves que transitam com facilidade do dia de trabalho ao jantar especial.",
                "view_all_text": "Explorar Blusas",
                "view_all_url": "/#blusas",
                "cards": [
                    {
                        "id": "blusas-card-1",
                        "image_url": "https://images.unsplash.com/photo-1551163943-3f6a855d1153?auto=format&fit=crop&w=700&h=700&q=80",
                        "alt_text": "Camisa de Linho Alvo",
                        "title": "Camisa Linho Alvo",
                        "description": "Corte clássico estruturado com toque macio e acabamento premium.",
                        "button_text": "Ver Peça",
                        "button_url": "/#blusas",
                        "badge": "Essencial",
                        "is_visible": true,
                        "position": 1
                    },
                    {
                        "id": "blusas-card-2",
                        "image_url": "https://images.unsplash.com/photo-1589310243389-96a5483213a8?auto=format&fit=crop&w=700&h=700&q=80",
                        "alt_text": "Regata de Seda Dourada",
                        "title": "Regata Seda Dourada",
                        "description": "Alças finas e caimento leve que valorizam acessórios e semijoias.",
                        "button_text": "Ver Peça",
                        "button_url": "/#blusas",
                        "badge": "Festa",
                        "is_visible": true,
                        "position": 2
                    },
                    {
                        "id": "blusas-card-3",
                        "image_url": "https://images.unsplash.com/photo-1518049362265-d5b2a6467637?auto=format&fit=crop&w=700&h=700&q=80",
                        "alt_text": "Blusa Alfaiataria Manga Bufante",
                        "title": "Blusa Alfaiataria Bufante",
                        "description": "Detalhe volumétrico sutil nas mangas para um visual marcante.",
                        "button_text": "Ver Peça",
                        "button_url": "/#blusas",
                        "badge": "Tendência",
                        "is_visible": true,
                        "position": 3
                    }
                ]
            }'::jsonb,
            now()
        )
        ON CONFLICT (page_id, stable_key) DO NOTHING;

        -- 4. Seção Bermudas
        INSERT INTO public.cms_sections (
            page_id, stable_key, section_type, internal_title, position, is_active, status, draft_content, published_content, published_at
        )
        VALUES (
            v_page_id,
            'home-bermudas',
            'bermudas',
            'Seção Bermudas - Três Peças',
            5,
            true,
            'published',
            '{
                "section_badge": "Conforto Chic",
                "section_headline": "Bermudas & Shorts",
                "section_subheadline": "Cortes modernos e estruturados que proporcionam liberdade de movimento sem abrir mão da elegância.",
                "view_all_text": "Explorar Bermudas",
                "view_all_url": "/#bermudas",
                "cards": [
                    {
                        "id": "bermudas-card-1",
                        "image_url": "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&w=700&h=700&q=80",
                        "alt_text": "Bermuda Alfaiataria Cós Alto",
                        "title": "Bermuda Cós Alto Alfaiataria",
                        "description": "Modelagem impecável com pregas discretas e passantes elegantes.",
                        "button_text": "Ver Peça",
                        "button_url": "/#bermudas",
                        "badge": "Clássico",
                        "is_visible": true,
                        "position": 1
                    },
                    {
                        "id": "bermudas-card-2",
                        "image_url": "https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=700&h=700&q=80",
                        "alt_text": "Bermuda Linho Cru com Faixa",
                        "title": "Bermuda Linho Natural",
                        "description": "Acompanha faixa de amarração no mesmo tom para cintura marcada.",
                        "button_text": "Ver Peça",
                        "button_url": "/#bermudas",
                        "badge": "Casual Chic",
                        "is_visible": true,
                        "position": 2
                    },
                    {
                        "id": "bermudas-card-3",
                        "image_url": "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=700&h=700&q=80",
                        "alt_text": "Shorts Social Verde Oliva",
                        "title": "Shorts Social Oliva",
                        "description": "Bolsos funcionais com acabamento embutido e barra italiana dobrada.",
                        "button_text": "Ver Peça",
                        "button_url": "/#bermudas",
                        "badge": "Novo",
                        "is_visible": true,
                        "position": 3
                    }
                ]
            }'::jsonb,
            '{
                "section_badge": "Conforto Chic",
                "section_headline": "Bermudas & Shorts",
                "section_subheadline": "Cortes modernos e estruturados que proporcionam liberdade de movimento sem abrir mão da elegância.",
                "view_all_text": "Explorar Bermudas",
                "view_all_url": "/#bermudas",
                "cards": [
                    {
                        "id": "bermudas-card-1",
                        "image_url": "https://images.unsplash.com/photo-1506630448388-4e683c67ddb0?auto=format&fit=crop&w=700&h=700&q=80",
                        "alt_text": "Bermuda Alfaiataria Cós Alto",
                        "title": "Bermuda Cós Alto Alfaiataria",
                        "description": "Modelagem impecável com pregas discretas e passantes elegantes.",
                        "button_text": "Ver Peça",
                        "button_url": "/#bermudas",
                        "badge": "Clássico",
                        "is_visible": true,
                        "position": 1
                    },
                    {
                        "id": "bermudas-card-2",
                        "image_url": "https://images.unsplash.com/photo-1582533561751-ef6f6ab93a2e?auto=format&fit=crop&w=700&h=700&q=80",
                        "alt_text": "Bermuda Linho Cru com Faixa",
                        "title": "Bermuda Linho Natural",
                        "description": "Acompanha faixa de amarração no mesmo tom para cintura marcada.",
                        "button_text": "Ver Peça",
                        "button_url": "/#bermudas",
                        "badge": "Casual Chic",
                        "is_visible": true,
                        "position": 2
                    },
                    {
                        "id": "bermudas-card-3",
                        "image_url": "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=700&h=700&q=80",
                        "alt_text": "Shorts Social Verde Oliva",
                        "title": "Shorts Social Oliva",
                        "description": "Bolsos funcionais com acabamento embutido e barra italiana dobrada.",
                        "button_text": "Ver Peça",
                        "button_url": "/#bermudas",
                        "badge": "Novo",
                        "is_visible": true,
                        "position": 3
                    }
                ]
            }'::jsonb,
            now()
        )
        ON CONFLICT (page_id, stable_key) DO NOTHING;

        -- 5. Seção Conjuntos
        INSERT INTO public.cms_sections (
            page_id, stable_key, section_type, internal_title, position, is_active, status, draft_content, published_content, published_at
        )
        VALUES (
            v_page_id,
            'home-conjuntos',
            'conjuntos',
            'Seção Conjuntos - Três Peças',
            6,
            true,
            'published',
            '{
                "section_badge": "Harmonia Total",
                "section_headline": "Conjuntos Coordenados",
                "section_subheadline": "Combinações prontas e harmoniosas pensadas para você estar impecável com o mínimo de esforço.",
                "view_all_text": "Explorar Conjuntos",
                "view_all_url": "/#conjuntos",
                "cards": [
                    {
                        "id": "conjuntos-card-1",
                        "image_url": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&h=700&q=80",
                        "alt_text": "Conjunto Alfaiataria Off-White",
                        "title": "Conjunto Blazer & Bermuda Off",
                        "description": "A sofisticação do monocromático com corte moderno e botões forrados.",
                        "button_text": "Ver Conjunto",
                        "button_url": "/#conjuntos",
                        "badge": "Destaque",
                        "is_visible": true,
                        "position": 1
                    },
                    {
                        "id": "conjuntos-card-2",
                        "image_url": "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=700&h=700&q=80",
                        "alt_text": "Conjunto Cropped e Saia Terracota",
                        "title": "Conjunto Terracota Elegance",
                        "description": "Cor vibrante e terrosa perfeita para o clima brasileiro em tecido estruturado.",
                        "button_text": "Ver Conjunto",
                        "button_url": "/#conjuntos",
                        "badge": "Coleção Outono",
                        "is_visible": true,
                        "position": 2
                    },
                    {
                        "id": "conjuntos-card-3",
                        "image_url": "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=700&h=700&q=80",
                        "alt_text": "Conjunto Verde Sálvia Fresh",
                        "title": "Conjunto Sálvia em Linho",
                        "description": "Tons suaves com frescor absoluto para os dias ensolarados.",
                        "button_text": "Ver Conjunto",
                        "button_url": "/#conjuntos",
                        "badge": "Mais Vendido",
                        "is_visible": true,
                        "position": 3
                    }
                ]
            }'::jsonb,
            '{
                "section_badge": "Harmonia Total",
                "section_headline": "Conjuntos Coordenados",
                "section_subheadline": "Combinações prontas e harmoniosas pensadas para você estar impecável com o mínimo de esforço.",
                "view_all_text": "Explorar Conjuntos",
                "view_all_url": "/#conjuntos",
                "cards": [
                    {
                        "id": "conjuntos-card-1",
                        "image_url": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&h=700&q=80",
                        "alt_text": "Conjunto Alfaiataria Off-White",
                        "title": "Conjunto Blazer & Bermuda Off",
                        "description": "A sofisticação do monocromático com corte moderno e botões forrados.",
                        "button_text": "Ver Conjunto",
                        "button_url": "/#conjuntos",
                        "badge": "Destaque",
                        "is_visible": true,
                        "position": 1
                    },
                    {
                        "id": "conjuntos-card-2",
                        "image_url": "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=700&h=700&q=80",
                        "alt_text": "Conjunto Cropped e Saia Terracota",
                        "title": "Conjunto Terracota Elegance",
                        "description": "Cor vibrante e terrosa perfeita para o clima brasileiro em tecido estruturado.",
                        "button_text": "Ver Conjunto",
                        "button_url": "/#conjuntos",
                        "badge": "Coleção Outono",
                        "is_visible": true,
                        "position": 2
                    },
                    {
                        "id": "conjuntos-card-3",
                        "image_url": "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=700&h=700&q=80",
                        "alt_text": "Conjunto Verde Sálvia Fresh",
                        "title": "Conjunto Sálvia em Linho",
                        "description": "Tons suaves com frescor absoluto para os dias ensolarados.",
                        "button_text": "Ver Conjunto",
                        "button_url": "/#conjuntos",
                        "badge": "Mais Vendido",
                        "is_visible": true,
                        "position": 3
                    }
                ]
            }'::jsonb,
            now()
        )
        ON CONFLICT (page_id, stable_key) DO NOTHING;
    END IF;
END $$;
