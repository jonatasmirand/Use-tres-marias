# 📬 Postman Collection - Use Três Marias

Esta pasta contém a **Collection** e o **Environment** configurados e prontos para teste e consumo da API REST do projeto **Use Três Marias**.

---

## 📁 Estrutura de Pastas e Subpastas

A coleção foi categorizada hierarquicamente para facilitar os testes de desenvolvimento e homologação:

```text
📦 Use Três Marias - API
 ├── 📁 01 - Produtos
 │    ├── 📁 Consultas (Público)
 │    │    ├── GET Listar Produtos Ativos
 │    │    ├── GET Buscar Produto por ID
 │    │    └── GET Buscar Produto Inexistente (404)
 │    └── 📁 Gerenciamento (Admin)
 │         ├── POST Criar Produto
 │         ├── PUT Atualizar Produto por ID
 │         └── DELETE Desativar / Excluir Produto
 ├── 📁 02 - Categorias
 │    ├── 📁 Consultas (Público)
 │    │    ├── GET Listar Categorias Ativas
 │    │    ├── GET Buscar Categoria por ID
 │    │    └── GET Buscar Categoria Inexistente (404)
 │    └── 📁 Gerenciamento (Admin)
 │         ├── POST Criar Categoria
 │         ├── PUT Atualizar Categoria por ID
 │         └── DELETE Excluir Categoria
 ├── 📁 03 - Autenticação & Usuários
 │    ├── 📁 Sessão & Tokens
 │    │    ├── POST Login Admin (E-mail e Senha)
 │    │    ├── GET Obter Dados do Usuário Logado
 │    │    └── POST Logout (Revogar Sessão)
 │    └── 📁 Gerenciamento de Contas
 │         ├── POST Criar Conta de Cliente (Sign Up)
 │         └── POST Solicitar Redefinição de Senha
 ├── 📁 04 - Checkout & Pedidos (Roadmap)
 │    ├── 📁 Carrinho & Frete
 │    │    ├── POST Calcular Frete e Prazos
 │    │    └── POST Criar Sessão de Checkout
 │    └── 📁 Pedidos
 │         ├── GET Listar Pedidos do Usuário
 │         └── GET Consultar Detalhes do Pedido por ID
 └── 📁 05 - Monitoramento & Saúde
      └── GET Health Check (Status do Servidor)
```

---

## ⚡ Recursos e Automações Embutidos

1. **Captura Automática de IDs**:
   - Ao executar `Listar Produtos Ativos`, o ID do primeiro produto retornado é salvo automaticamente na variável `{{product_id}}`.
   - Ao executar `Listar Categorias Ativas`, o ID da primeira categoria é salvo automaticamente na variável `{{category_id}}`.
2. **Autenticação Automática (`auth_token`)**:
   - Ao efetuar a requisição de **Login Admin**, o script de teste extrai o `access_token` JWT retornado pelo Supabase Auth e o armazena automaticamente na variável `{{auth_token}}`, que é propagada para todas as rotas protegidas que exigem Bearer token.
3. **Validação Automatizada de Testes**:
   - As requisições contêm scripts na aba **Tests** para validar status code HTTP (200, 404, etc.) e a integridade da estrutura dos dados retornados.

---

## 🚀 Como Importar no Postman

1. Abra o aplicativo **Postman**.
2. Clique no botão **Import** (canto superior esquerdo).
3. Selecione ou arraste os dois arquivos desta pasta:
   - `Use_Tres_Marias.postman_collection.json`
   - `Use_Tres_Marias.postman_environment.json`
4. No canto superior direito do Postman, selecione o ambiente **Use Três Marias - Local (Dev)**.
5. Inicie seu servidor Next.js localmente no terminal:
   ```bash
   npm run dev
   ```
6. Execute as requisições desejadas!
