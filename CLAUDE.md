# Regras do projeto

## Comentários

1. É proibido escrever comentário dentro do código (nenhum `//`, `/* */`, `{/* */}`, `#`, `<!-- -->`, docstring ou equivalente).
2. Todo comentário, explicação ou observação sobre o código deve ficar neste arquivo, na seção "Anotações".
3. O `.env` permanece no repositório, por decisão do usuário.

## Visão geral

Portal de notícias e vídeos (Media Spark Space) do projeto extensionista da Fatec. Front-end SPA gerado pelo Lovable, com back-end 100% Supabase (Postgres, Auth, Storage). Não há servidor próprio.

## Stack

- Vite 5 + React 18 + TypeScript (plugin SWC)
- Tailwind CSS 3 + shadcn/ui (Radix) em `src/components/ui`
- React Router 6, TanStack Query 5, react-hook-form + zod
- Supabase JS 2, editor rich text Tiptap, sanitização com DOMPurify, gráficos com Recharts
- Testes: Vitest (jsdom, Testing Library) e Playwright

## Comandos

- `npm install` instala dependências
- `npm run dev` sobe em http://localhost:8080 (porta fixada em `vite.config.ts`)
- `npm run build` build de produção; `npm run build:dev` build em modo development
- `npm run lint` ESLint
- `npm test` Vitest uma vez; `npm run test:watch` em modo watch
- Alias `@` aponta para `src`

## Estrutura

- `src/App.tsx` define as rotas
  - Portal (dentro de `PortalLayout`): `/`, `/artigo/:id`, `/video/:id`, `/categoria/:name`, `/busca`, `/sobre`, `/perfil`, `/configuracoes`
  - `/auth` login e cadastro
  - `/admin` protegido por `ProtectedAdmin`, com `AdminLayout` e subrotas `articles`, `videos`, `categories`, `authors`
- `src/hooks/useAuth.tsx` contexto de autenticação (`user`, `session`, `isAdmin`, `signOut`); `isAdmin` vem da tabela `user_roles`
- `src/integrations/supabase/client.ts` cliente Supabase; `types.ts` tipos do banco (desatualizado, ver Pendências)
- `src/components/portal` layout, cards e widgets do portal público (`HeroCarousel.tsx`, `SidebarWidget.tsx`)
- `src/components/admin` `ProtectedAdmin`, `RichTextEditor`, `AdminAuthors`
- `src/pages` páginas; `src/pages/admin` telas do painel
- `supabase/migrations` esquema do banco segundo o repositório (não é fiel ao banco real, ver abaixo)
- Cores: tokens HSL em `src/index.css`, expostos em `colors` do `tailwind.config.ts`

## Banco (Supabase)

- Projeto `portal-conteudo`; a URL está em `src/integrations/supabase/client.ts`. O banco é gerenciado pelo professor: alterações de esquema passam por ele.
- Tabelas: `profiles`, `user_roles` (enum `app_role`: admin, editor, user), `categories`, `articles`, `videos`
- O banco real diverge das migrations do repositório (confirmado pela REST):
  - `articles` não tem `views`; tem `published`, `image_url`, `author_name_manual`, `author_photo_url` e `group_authors`
  - `videos` também não tem `views`
- Migration `supabase/migrations/20260505000000_increment_article_views.sql`, pendente de aplicação pelo professor (SQL Editor ou `supabase db push`); não foi testada contra o banco. Ela:
  - adiciona `articles.views integer NOT NULL DEFAULT 0` (`IF NOT EXISTS`)
  - cria `increment_article_views(_article_id uuid)`
  - cria a função `update_articles_updated_at_column()` e recria o trigger `update_articles_updated_at` com `WHEN`, para que mudar só `views` não altere `updated_at`
- Bucket de storage público `media`; escrita só para admin
- RLS ativo em todas; leitura pública apenas de conteúdo com `status = 'published'`; escrita só admin via função `has_role`
- Trigger `handle_new_user` cria perfil e papel `user` no cadastro
- Para virar admin: inserir `(user_id, 'admin')` em `user_roles`
- Testar a API do Supabase: o `curl` do Git Bash falha em TLS com o Supabase; usar `Invoke-WebRequest` no PowerShell (com os headers `apikey` e `Authorization`).

## Anotações

Comentários que existiam no código foram mantidos; a regra vale para código novo e para qualquer arquivo que for editado (remover os comentários do trecho tocado e registrar aqui o que for relevante). Contrastes citados foram calculados à mão a partir dos HSL de `index.css`, sem axe e sem navegador.

### Carrossel do hero (`HeroCarousel.tsx`)

- Recebe `recent` e `popular` de `Home.tsx`. Slides: BEM-VINDO (fixo, leva a `/sobre`), MAIS RECENTE (artigo mais recente) e DESTAQUE (maior `views`, diferente do mais recente e com `views > 0`). Os dois últimos só existem se houver artigo.
- O slide DESTAQUE mostra ao lado do badge "Mais acessado · N acessos" (ícone `Eye` com `aria-hidden`).
- O título (`h2`) é o link do slide, com `ArrowRight` `aria-hidden` no fim e sublinhado em hover e foco. Não há botão "Ler mais". O `h1` do portal é `sr-only`.
- Zoom da imagem do slide ativo (scale 1.1, 700ms) só com mouse sobre o carrossel (`pointerType === "mouse"`); `prefers-reduced-motion` desliga.
- Setas laterais (44px) e bolinhas (botões de 24px) centralizadas no rodapé, sempre visíveis. Com 1 slide: setas `disabled` e `aria-hidden`, uma bolinha não interativa, sem `aria-label` "1 de 1".
- Autoplay de 6s (`setApi` + `setInterval`), pausado por hover de mouse e por foco de teclado (`:focus-visible`), desligado com `prefers-reduced-motion`. `aria-live` é `off` rodando e `polite` parado. Slides inativos têm `aria-hidden` e link com `tabIndex=-1` (`inert` seria mais robusto, mas o tipo no React 18 atrapalha).
- Não há botão Pausar, por pedido do usuário. Isso deixa em aberto o critério WCAG 2.2.2 (mecanismo explícito de pausa); alternativa: desligar o autoplay.
- Slide com `min-h-[400px]` (não altura fixa) para título longo crescer em vez de cortar (1.4.4/1.4.10); conteúdo com `px-16 md:px-20 2xl:px-8` para título e anel de foco não ficarem sob as setas.
- Não testado em navegador.

### Sidebar e cores (`SidebarWidget.tsx`, `index.css`, `tailwind.config.ts`)

- Regra: cor nova de UI entra como token por função em `index.css` (`:root` e `.dark`) + `tailwind.config.ts`, não como classe de cor fixa.
- Tokens:
  - `badge`/`badge-foreground`: badge do hero, igual nos dois temas
  - `hero-overlay`: gradiente do hero
  - `count-1..4` (com `-foreground`): badge de contagem de categoria por faixa de quantidade, não por categoria. Faixas 0-3, 4-9, 10-19, 20+ (tabela `COUNT_BANDS`)
  - `rank-1..4`: cor do número no "Em Alta" por posição; da 4ª em diante repete `rank-4`
- As variáveis `count-*` e `rank-*` têm valor próprio em `:root` e `.dark` (copiado, sem `var()`, para não depender de onde `.dark` está).
- Hover dos links da sidebar: `text-accent` no escuro tinha contraste baixo, então no escuro usa `text-foreground`; nos dois temas há `underline` (não depende só de cor). Foco com `outline` na cor `foreground`.
- O nome da categoria vira slug da rota com `toLowerCase().normalize("NFD")` removendo acentos.
- Home: o "Em Alta" da sidebar lista os artigos de `novidades` (posições 2 a 5 por data), não por acessos.
- Pares aprovados (calculados à mão):

| Par | Claro | Escuro |
|---|---|---|
| badge / badge-foreground (HSL `0 74% 42%` com branco) | 6,41 | 6,41 |
| count-1 (texto sobre card) | 4,72 | 5,70 |
| count-2 | 11,81 | 6,25 |
| count-3 | 5,43 | 5,43 |
| count-4 | 8,62 | 8,62 |
| rank-1 | 12,37 | 14,86 |
| rank-2 (verde `142 72% 29%` no claro) | 5,07 | 5,40 |
| rank-3 | 6,41 | 8,58 |
| rank-4 | 4,72 | 5,70 |

- Hero: `--hero-overlay` é `222 47% 11%`; o título branco tem 7,97:1 no pior caso.
- Newsletter (`NewsletterWidget`):
  - foco `ring-2 ring-primary-foreground` com offset `primary`: 11,81 claro, 6,25 escuro
  - borda `/60`: 5,35 claro, 3,40 escuro
  - placeholder e parágrafo em `primary-foreground/90`: 9,89 claro, 5,43 escuro. O parágrafo em `/70` dava 4,00 no escuro e reprovava.
  - campo com `bg-transparent`
  - o `ring-accent` anterior era invisível

### Contagem de acessos

- A função `increment_article_views` é `SECURITY DEFINER`, incrementa de forma atômica só artigo `published` e tem `EXECUTE` apenas para `anon` e `authenticated`. Reversão manual: `DROP FUNCTION public.increment_article_views(uuid)` e recriar o trigger sem `WHEN`; `DROP FUNCTION public.update_articles_updated_at_column()` só depois de o trigger usar outra função; `DROP COLUMN views` só depois de o front parar de usá-la, em release separada. A função compartilhada `update_updated_at_column` não é tocada, para não arriscar `profiles`, `categories` e `videos`.
- `Article.tsx` chama o rpc ao carregar e deduplica só no navegador: `sessionStorage`, chave `viewed:<id>`, gravada antes do rpc e removida se ele falhar. Sem `sessionStorage`, conta sem deduplicar e avisa com `console.warn`. Falha do rpc vai só para `console.error` e não bloqueia a página.
- Limitação: não há rate limit no servidor; qualquer visitante pode chamar a função e inflar a contagem.
- "Em alta" de `Article.tsx` ordena por `views`; se a consulta falhar (coluna ausente), cai para `published_at desc`.
- `Home.tsx` não pede `views` na query principal: busca `id, views` à parte; se falhar, faz `console.error`, segue com `popular = null` e o carrossel fica sem o slide DESTAQUE até a migration ser aplicada.

### Pendências conhecidas

- `types.ts` está desatualizado em relação ao banco real (6 erros de `tsc`).
- `Home.tsx` tem 8 `any`.
- Cerca de 40 erros de lint pré-existentes.
- Comentários antigos ainda existem em outros arquivos (por exemplo `client.ts`, `App.tsx`, `index.css`, `tailwind.config.ts` e o JSX de `Home.tsx` abaixo do hero); remover ao editar cada um.
- `slate-900` ainda aparece no `HeroCarousel.tsx` nos botões das setas e no `ring-offset` do link; falta token por função. O `ring-offset-slate-900` fixo no foco do título do hero é praticamente igual ao token `hero-overlay`.
- O input da Newsletter não tem rótulo (`aria-label`) nem `autoComplete="email"` (WCAG 3.3.2 e 4.1.2, nível A, e 1.3.5).
- O botão "Assinar" da Newsletter não faz nada (sem `form`/`onSubmit`); decisão de produto.
- `client.ts` tem URL e chave publishable fixas e não lê o `.env` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`). A chave é a anon, pública por desenho; a segurança depende das políticas RLS.
- Última migration troca a policy de leitura do bucket `media` por `auth.role() = 'anon' IS NOT NULL`, que tende a ser sempre verdadeira; revisar antes de considerar o bucket restrito.
- `npm audit` acusou 59 vulnerabilidades (27 altas); não tratadas.
- Existem `bun.lock`, `bun.lockb` e `package-lock.json`; o `npm install` foi o usado.
- `SearchPage.tsx` e `Video.tsx` usam `views`, que não existe no banco até a migration; `AdminOverview`, `AdminArticles` e `AdminVideos` também leem `views`.
- `Index.tsx` (2 linhas) e `Dashboard.tsx` não aparecem em nenhuma rota.
- `AdminAuthors` existe duplicado: `pages/admin/AdminAuthors.tsx` (usado em `App.tsx`) e `components/admin/AdminAuthors.tsx`.
