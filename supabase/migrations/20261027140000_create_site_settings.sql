-- ==============================================================================
-- Migração: Tabela de Configurações Globais do Site (Canais de Contato e Atendimento)
-- Projeto: Use Três Marias
-- Data: 2026-10-27
-- ==============================================================================

-- 1. Criação da Tabela site_settings
CREATE TABLE IF NOT EXISTS public.site_settings (
    key VARCHAR(50) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 2. Habilitação de Row Level Security (RLS)
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- 3. Política de Leitura Pública
-- Permite que visitantes da loja consultem os canais de contato, horários e redes sociais
DROP POLICY IF EXISTS "Leitura pública de configurações" ON public.site_settings;
CREATE POLICY "Leitura pública de configurações"
    ON public.site_settings
    FOR SELECT
    TO public
    USING (true);

-- 4. Política de Gerenciamento Administrativo
-- Somente administradores autenticados podem inserir ou atualizar configurações
DROP POLICY IF EXISTS "Administradores gerenciam configurações" ON public.site_settings;
CREATE POLICY "Administradores gerenciam configurações"
    ON public.site_settings
    FOR ALL
    TO authenticated
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

-- 5. Carga Inicial dos Canais de Contato Padrão
INSERT INTO public.site_settings (key, value)
VALUES (
    'contact_info',
    '{
        "whatsapp_number": "5511999999999",
        "whatsapp_formatted": "(11) 99999-9999",
        "instagram_handle": "usetresmarias",
        "email_address": "contato@usetresmarias.com.br",
        "business_hours": "Segunda a Sexta: 09h às 18h | Sábado: 09h às 13h",
        "whatsapp_group_url": "https://chat.whatsapp.com/invite/usetresmarias",
        "address_summary": "São Paulo - SP • Atendimento Online para todo o Brasil"
    }'::jsonb
)
ON CONFLICT (key) DO NOTHING;
