-- ==============================================================================
-- Migração: Atualização do Slide do Hero da Home (Coleção Primavera 2026)
-- Projeto: Use Três Marias
-- Execute no SQL Editor do Supabase se desejar persistir diretamente no banco.
-- ==============================================================================

UPDATE public.cms_sections
SET
  draft_content = jsonb_build_object(
    'interval_seconds', 6,
    'slides', jsonb_build_array(
      jsonb_build_object(
        'id', 'slide-primavera',
        'image_url', 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1800&q=85',
        'mobile_image_url', '',
        'alt_text', 'Coleção Primavera • 2026 – useTrêsMarias',
        'image_fit', 'cover',
        'eyebrow', 'Coleção Primavera • 2026',
        'title', 'Seu estilo.<br>Do seu jeito.',
        'description', 'Peças femininas pensadas para acompanhar todos os momentos — com leveza, personalidade e aquele toque especial das Três Marias.',
        'button_text', 'Conheça a coleção',
        'button_url', '/novidades'
      )
    )
  ),
  published_content = jsonb_build_object(
    'interval_seconds', 6,
    'slides', jsonb_build_array(
      jsonb_build_object(
        'id', 'slide-primavera',
        'image_url', 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1800&q=85',
        'mobile_image_url', '',
        'alt_text', 'Coleção Primavera • 2026 – useTrêsMarias',
        'image_fit', 'cover',
        'eyebrow', 'Coleção Primavera • 2026',
        'title', 'Seu estilo.<br>Do seu jeito.',
        'description', 'Peças femininas pensadas para acompanhar todos os momentos — com leveza, personalidade e aquele toque especial das Três Marias.',
        'button_text', 'Conheça a coleção',
        'button_url', '/novidades'
      )
    )
  ),
  updated_at = now(),
  published_at = now()
WHERE stable_key = 'home-hero';
