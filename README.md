# Cadastro de Distribuidoras com Supabase

Este projeto é uma aplicação React + Vite + Tailwind CSS para cadastro de distribuidoras, com autenticação e banco de dados no Supabase.

## Funcionalidades

- Login e cadastro de usuários com e-mail e senha (Supabase Auth)
- Cadastro, edição, exclusão e listagem de distribuidoras (Supabase Database)
- Dados salvos no PostgreSQL do Supabase
- Interface responsiva e moderna

## Como configurar o Supabase

### 1. Criar o projeto no Supabase

1. Acesse [https://supabase.com](https://supabase.com) e faça login.
2. Clique em **"New project"**.
3. Escolha uma organização e dê o nome do projeto (ex: `cadastro-distribuidoras`).
4. Escolha uma região (recomendado: `South America (São Paulo)`).
5. Clique em **"Create new project"**.

### 2. Obter as credenciais do Supabase

1. No painel do projeto, clique em **"Project Settings"** (engrenagem no menu lateral).
2. Vá em **"API"**.
3. Copie:
   - **Project URL** → será a `VITE_SUPABASE_URL`
   - **anon public** → será a `VITE_SUPABASE_ANON_KEY`

### 3. Configurar as variáveis de ambiente

No projeto local, renomeie o arquivo `.env.example` para `.env` e preencha:

```env
VITE_SUPABASE_URL=https://abcdefgh12345678.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

No Netlify, vá em **Site settings > Environment variables** e adicione as mesmas variáveis.

### 4. Criar a tabela de distribuidoras

No painel do Supabase:

1. Vá em **"Table Editor"**
2. Clique em **"New table"**
3. Nomeie a tabela como `distributors`
4. Ative **"Enable Row Level Security (RLS)"**
5. Adicione as seguintes colunas:

| Nome | Tipo | Default | Primary |
|------|------|---------|---------|
| `id` | `uuid` | `gen_random_uuid()` | ✅ |
| `razao_social` | `text` | - | - |
| `nome_fantasia` | `text` | - | - |
| `cnpj` | `text` | - | - |
| `email` | `text` | - | - |
| `telefone` | `text` | - | - |
| `endereco` | `text` | - | - |
| `cidade` | `text` | - | - |
| `estado` | `text` | - | - |
| `cep` | `text` | - | - |
| `responsavel` | `text` | - | - |
| `user_id` | `uuid` | - | - |
| `created_at` | `timestamptz` | `now()` | - |
| `updated_at` | `timestamptz` | `now()` | - |

6. Clique em **"Save"**

### 5. Configurar as políticas RLS

Vá em **"Authentication > Policies"** ou clique na tabela `distributors` e depois em **"Policies"**. Crie as seguintes políticas:

#### Política de leitura (todos os usuários logados veem tudo)

```sql
CREATE POLICY "Usuarios logados podem visualizar todas as distribuidoras"
ON public.distributors
FOR SELECT
TO authenticated
USING (true);
```

#### Política de inserção

```sql
CREATE POLICY "Usuarios logados podem cadastrar distribuidoras"
ON public.distributors
FOR INSERT
TO authenticated
WITH CHECK (true);
```

#### Política de atualização

```sql
CREATE POLICY "Usuarios logados podem editar distribuidoras"
ON public.distributors
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);
```

#### Política de exclusão

```sql
CREATE POLICY "Usuarios logados podem excluir distribuidoras"
ON public.distributors
FOR DELETE
TO authenticated
USING (true);
```

## Como rodar o projeto localmente

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173` no navegador.

## Como fazer o deploy no Netlify

### Opção 1: Deploy manual

```bash
npm run build
```

Faça upload da pasta `dist` gerada no Netlify.

### Opção 2: Deploy com Git

1. Suba o projeto para um repositório Git (GitHub, GitLab ou Bitbucket).
2. No Netlify, clique em **"Add new site" > "Import an existing project"**.
3. Conecte o repositório.
4. Configure as variáveis de ambiente em **Site settings > Environment variables**.
5. O comando de build é `npm run build` e a pasta de publicação é `dist`.

## Tabela no Supabase

Os dados das distribuidoras são salvos na tabela `distributors`, com os seguintes campos:

- `id`
- `razao_social`
- `nome_fantasia`
- `cnpj`
- `email`
- `telefone`
- `endereco`
- `cidade`
- `estado`
- `cep`
- `responsavel`
- `user_id` (ID do usuário logado)
- `created_at`
- `updated_at`

## ⚠️ Erro comum: dados não são salvos

Se você consegue fazer login mas não salva os dados:

1. Verifique se a tabela `distributors` foi criada
2. Verifique se o RLS está ativado
3. Verifique se as políticas (policies) foram criadas corretamente
4. Abra o console do navegador (F12) e veja a mensagem de erro exata

Erros comuns:

- `42501` → permissão negada (RLS não configurado)
- `42P01` → tabela não encontrada
- `23505` → registro duplicado

## ⚠️ Tela em branco no Netlify

Se o site abre uma página completamente em branco:

1. **Verifique a URL correta**
   - A URL correta deve ser algo como `https://nomedosite.netlify.app/#/login`
   - Confirme se não houve erro de digitação

2. **Abra o console do navegador (F12 > Console)**
   - Erro de variável de ambiente → configure as variáveis no Netlify e faça novo deploy
   - Erro `Permission denied` → problema nas regras RLS
   - Erro `WebSocket` → normalmente não impede o funcionamento

3. **Verifique as variáveis de ambiente no Netlify**
   - Vá em **Site settings > Environment variables**
   - Confirme que `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` existem
   - Faça um novo deploy após adicionar/editar

4. **Limpe o cache e tente novamente**
   - Pressione `Ctrl + F5` (Windows) ou `Cmd + Shift + R` (Mac)

5. **Verifique o deploy no Netlify**
   - No painel do Netlify, vá em **Deploys**
   - Confirme que o último deploy foi bem-sucedido ("Published")
   - Clique no deploy e verifique o log de build

6. **Se aparecer erro com caminho antigo (ex: `/distribuidora18/assets/...`)**
   - O Netlify está servindo um `index.html` antigo
   - Vá em **Deploys > Trigger deploy > Clear cache and deploy site**
   - Se persistir, delete o site e crie um novo

## Observações

- O plano gratuito do Supabase inclui 500 MB de banco de dados, 2 GB de transferência e autenticação gratuita.
- A `anon key` é segura de expor no frontend. A segurança vem das políticas RLS.
- Nunca use a `service_role key` no frontend.

## Suporte

Documentação oficial:
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Supabase Database](https://supabase.com/docs/guides/database)
