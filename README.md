# Use Três Marias

E-commerce de semijoias desenvolvido com Next.js, React, TypeScript e Supabase.

## Objetivo

Construir uma plataforma de comércio eletrônico com catálogo de produtos, painel administrativo e, em uma fase posterior, carrinho, checkout e gerenciamento de pedidos.

## Tecnologias

- Next.js com App Router
- React
- TypeScript
- Tailwind CSS
- PostgreSQL com Supabase
- Git e GitHub

## Arquitetura

A aplicação utiliza uma arquitetura monolítica modular.

O frontend e a API REST compartilham o mesmo projeto Next.js, com separação entre páginas, endpoints, funcionalidades, serviços, validações e integrações externas.

## Escopo inicial

1. Preparação do ambiente e arquitetura.
2. Modelagem e configuração do banco de dados.
3. API REST de produtos e categorias.
4. Autenticação e autorização administrativa.
5. Catálogo e painel administrativo.
6. Testes e validações.

## Evolução futura

- Carrinho de compras.
- Checkout.
- Gestão de pedidos.
- Integração com pagamento.
- Controle de estoque.
- Gestão de entregas.

## Executar localmente

Instale as dependências:

```bash
npm install
```

Inicie o ambiente de desenvolvimento:

```bash
npm run dev
```

Acesse http://localhost:3000.

## Segurança

Credenciais e chaves privadas devem permanecer em variáveis de ambiente e nunca devem ser versionadas no Git.

## Status

Em desenvolvimento — etapa inicial de arquitetura e preparação do ambiente.