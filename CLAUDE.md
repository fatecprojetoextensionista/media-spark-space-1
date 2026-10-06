# Regras do projeto

## Comentários

1. É proibido escrever comentário dentro do código (nenhum `//`, `/* */`, `{/* */}`, `#`, `<!-- -->`, docstring ou equivalente).
2. Todo comentário, explicação ou observação sobre o código deve ficar neste arquivo, na seção "Anotações".
3. O `.env` permanece no repositório, por decisão do usuário.

## Visão geral

Portal de notícias e vídeos (Media Spark Space) do projeto extensionista da Fatec Carapicuíba (DMD), com a marca TechIn. Front-end SPA gerado pelo Lovable, com back-end 100% Supabase (Postgres, Auth, Storage). Não há servidor próprio. A identidade visual segue o manual `src/assets/slide1..10.png` (resumo em "Manual de identidade visual").

## Stack

- Vite 5 + React 18 + TypeScript (plugin SWC)
- Tailwind CSS 3 + shadcn/ui (Radix) em `src/components/ui`; fontes Domine (títulos) e Epilogue (corpo); modo claro e escuro com `next-themes` (classe `dark`)
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
- `src/components/portal` layout, cards e widgets do portal público (`PortalLayout.tsx`, `ArticleCard.tsx` com `CoverArt`, `HeroCarousel.tsx`, `SidebarWidget.tsx`)
- `src/components/admin` `ProtectedAdmin`, `RichTextEditor`, `AdminAuthors`, `ArticlePreview`
- `src/components/ThemeToggle.tsx` botão claro/escuro (portal e admin); `src/components/ui/badge.tsx` com variantes `chip`, `draft`, `autor`, `desenvolvedor`
- `apresentacao/` mockups HTML estáticos (claro e escuro) usados para aprovação da turma; fora do app
- `src/pages` páginas; `src/pages/admin` telas do painel
- `supabase/migrations` esquema do banco segundo o repositório (não é fiel ao banco real, ver abaixo)
- Cores: tokens HSL em `src/index.css`, expostos em `colors` do `tailwind.config.ts`

## Banco (Supabase)

- Projeto `portal-conteudo`; a URL está em `src/integrations/supabase/client.ts`. O banco é gerenciado pelo professor: alterações de esquema passam por ele.
- Tabelas: `profiles`, `user_roles` (enum `app_role`: admin, editor, user), `categories`, `articles`, `videos`
- O banco real diverge das migrations do repositório (confirmado pela REST):
  - `articles` não tem `views`; tem `published`, `image_url`, `author_name_manual`, `author_photo_url` e `group_authors`
  - `videos` também não tem `views`
- Migration `supabase/migrations/20260505000000_increment_article_views.sql` (SQL Editor ou `supabase db push`). Em 06/10/2026 a Home passou a mostrar "N acessos", o que indica que a coluna `views` e a função existem no banco, mas a aplicação não foi confirmada com o professor; o script nunca foi validado por mim contra o banco. Ela:
  - adiciona `articles.views integer NOT NULL DEFAULT 0` (`IF NOT EXISTS`)
  - cria `increment_article_views(_article_id uuid)`
  - cria a função `update_articles_updated_at_column()` e recria o trigger `update_articles_updated_at` com `WHEN`, para que mudar só `views` não altere `updated_at`
- Bucket de storage público `media`; escrita só para admin
- RLS ativo em todas; leitura pública apenas de conteúdo com `status = 'published'`; escrita só admin via função `has_role`
- Trigger `handle_new_user` cria perfil e papel `user` no cadastro
- Para virar admin: inserir `(user_id, 'admin')` em `user_roles`
- Testar a API do Supabase: o `curl` do Git Bash falha em TLS com o Supabase; usar `Invoke-WebRequest` no PowerShell (com os headers `apikey` e `Authorization`).
- Abrir `/artigo/:id` em qualquer navegador (inclusive automatizado) chama `increment_article_views` no banco de produção e soma um acesso real. Em 06/10/2026 os testes automáticos inflaram a contagem de alguns artigos; para zerar: `UPDATE articles SET views = 0;` (ou por `slug`). Não abrir páginas de artigo em testes automáticos.

## Anotações

Comentários que existiam no código foram mantidos; a regra vale para código novo e para qualquer arquivo que for editado (remover os comentários do trecho tocado e registrar aqui o que for relevante). Contrastes citados foram calculados à mão a partir dos HSL de `index.css`, sem axe e sem navegador.

### Resumo das mudanças de 06/10/2026

- Identidade e tema: o manual de identidade do TechIn foi aplicado ao app. Modo claro novo (paleta, fontes Domine e Epilogue, cabeçalho, rodapé, cartões, sidebar) e modo escuro completo, com alternador (`next-themes`, padrão = tema do sistema, escolha salva em `techin-theme`). Mockups aprovados pela turma em `apresentacao/`. Detalhes em "Manual de identidade visual", "Identidade do modo claro", "Identidade do modo escuro" e "Alternador de tema".
- Home: layout do mockup claro; "Em Alta" ordenado por acessos (com desempate por data) e igual na página de artigo; Newsletter fora da Home por decisão do usuário (decisão adiada); carrossel mantido como estava, só os badges foram padronizados (pílula `chip` com losango).
- Contador de acessos: já implementado (`increment_article_views`); o ranking de "Em Alta" e o slide DESTAQUE dependem dele. Ver "Contagem de acessos".
- Admin: edição de autores (`update` com `.select()`); abas Editar/Visualizar artigo com `ArticlePreview`; ícones de editar (verde) e apagar (vermelho) por token; badges de status e de papel padronizados; barra lateral fixa na altura da janela com o rodapé preso embaixo; botão de tema no admin.
- Login (`Auth.tsx`): botão "Voltar para a home" e `autoComplete` nos campos.
- Página de artigo: "Em Alta" com o mesmo componente e regra da Home; "Sugestões de Leitura" aparecem no fim do artigo no celular ("Categorias" seguem ocultas lá).
- Acessibilidade: auditorias WCAG 2.2 AA da Home e do modo escuro (por leitura de código, sem axe) com correções em várias páginas; link "Pular para o conteúdo", título de aba por rota, `Switch` nas Configurações, rótulos e nomes acessíveis em botões só de ícone.
- Logo: colorida no claro e branca no escuro (`logo-white.png`, gerada a partir de `TechIn logo.png`); a colorida usa `h-[46px]` no cabeçalho para ficar do mesmo tamanho visual da branca.
- Processo: o trabalho foi dividido entre agentes (tokens, componentes, auditoria, revisão). Verificações reais rodadas: `vite build` passa, `vitest` (1 teste) passa, lint sem aumento (32 erros e 11 avisos, todos pré-existentes), `tsc` só com os erros de `types.ts`. Páginas do portal vistas em Chrome real nos dois temas, exceto artigo e vídeo.
- Ambiente: algo fora dos comandos desta sessão regravou `package.json` com `"packageManager": "yarn@..."` várias vezes; o projeto usa npm. Antes de commitar, conferir `git diff package.json` e reverter com `git checkout -- package.json`. Rodar as ferramentas direto (`node node_modules/vite/bin/vite.js build`, `node node_modules/eslint/bin/eslint.js ...`) não evitou o problema.
- Nada foi commitado nesta sessão.

### Manual de identidade visual (TechIn)

- Fonte: `src/assets/slide1..10.png` (Tópicos Especiais em Mídias Digitais, DMD Fatec Carapicuíba). Diretrizes: o TechIn é uma plataforma pública e interativa, projeto extensionista, que traduz conceitos de tecnologia para linguagem acessível e promove inclusão digital. Missão: conectar a comunidade acadêmica à sociedade com conteúdos digitais imersivos e acessíveis. Visão: ser referência em educação tecnológica e mídias interativas na região de Carapicuíba.
- Logotipo (slides 4 a 6): símbolo de losangos/paralelogramos em gradiente ciano para roxo para azul-escuro, mais o texto "TechIn" (a letra I com serifa). Grade em unidades `u`: símbolo 16u x 10u, texto 27u de largura e 6u de altura. Versões: centralizada (símbolo sobre o texto), linear (símbolo ao lado do texto) e monocromática (preta sobre claro, branca sobre `#2A2A35`). O símbolo também vale sozinho em colorido, negativo e monocromático. Usos incorretos mostrados: recolorir só parte do símbolo, achatar ou esticar, usar o gradiente dessaturado e girar.
- Paleta (slide 7): `#2A2A35` (cor primária; o texto do slide diz `#3a3a3b`, mas a cor desenhada é `#2A2A35`, e o RGB 58-58-59 se repete em todos os cartões), roxo `#644795`, azul `#3CBFF0`, azul claro `#90DAF6`, cinza-lilás `#898198` e branco `#FFFFFF`. A divisão exata entre paleta primária e secundária não está clara no slide.
- Elementos e iconografia (slide 8): ícones sólidos de geometria limpa (envelope, pino de localização, usuário, sino, cadeado, balão, alfinete, casa, imagem, coração, globo, documento, losango, marcador, sacola), na cor `#2A2A35`; manter alinhamento em grade e proporção de preenchimento ao criar novos. Motivo gráfico: losangos (contorno branco e preenchimento em gradiente), usado nas capas, nos cartões sem imagem (`CoverArt`) e nos badges.
- Fontes (slide 9): Domine para títulos; Epilogue para subtítulos e parágrafos.
- Mockups (slide 10): cartões de visita, tablet com o portal, papelaria, perfil de rede social, panfleto e caderno, todos com a logo e o gradiente.
- No app: tokens e fontes seguem esse manual; as cores derivadas que não estão nele (fundos escuros, roxo claro para texto no escuro, texto secundário, tons de chip e de papel) estão listadas em "Proposta de identidade e modo escuro" e em "Identidade do modo escuro". Ainda não aplicados: ícones sólidos do slide 8 (o app usa lucide, que é de traço), escolha entre a logo linear e a centralizada por contexto, e favicon.

### Carrossel do hero (`HeroCarousel.tsx`)

- Recebe `recent` e `popular` de `Home.tsx`. Slides: BEM-VINDO (fixo, leva a `/sobre`), MAIS RECENTE (artigo mais recente) e DESTAQUE (maior `views`, diferente do mais recente e com `views > 0`). Os dois últimos só existem se houver artigo.
- Badges no estilo do mockup claro: pílula `bg-chip`/`text-chip-foreground` (7,86:1, independe da foto de fundo) com losango em gradiente `brand-blue`→`primary` (`aria-hidden`) antes do rótulo; o "Mais acessado" é outra pílula do mesmo token. O token `badge` não é mais usado aqui. Fora isso, o carrossel não mudou a pedido do usuário.
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

### Identidade do modo claro (`index.css`, `tailwind.config.ts`, `index.html`)

- Fonte da verdade: `apresentacao/home-modo-claro.html`. O `:root` é o modo claro; o `.dark` foi migrado depois (ver "Identidade do modo escuro"). A coluna "Escuro" da tabela de count/rank abaixo é da paleta antiga e não vale mais; os valores atuais do escuro estão em "Identidade do modo escuro".
- Fontes: Domine (títulos `h1`-`h3`, via `@apply font-serif`) e Epilogue (corpo, `font-sans`). O `@import` do CSS foi trocado por `<link>` com `preconnect` em `index.html` (evita bloqueio de renderização). `tailwind.config.ts` define `sans` e `serif` com fallback.
- Tokens do claro (hex de origem entre parênteses): `background`/`card`/`popover` branco; `foreground` (`#2A2A35`); `secondary` e `muted` (`#F3F2F7`); `muted-foreground` (`#5B5768`); `border` (`#E3E1EB`, só divisor decorativo); `input` (`#898198`, borda de campo, componente 3:1); `primary`, `accent` e `ring` (`#644795`) com foreground branco.
- `accent` é igual a `primary` de propósito: no código ele é usado como cor de texto de link e como fundo de botão com texto branco, e `#3CBFF0` falha nos dois papéis (2,12:1 sobre branco; texto branco sobre ele também falha). Consequência: `hover:bg-accent` do shadcn (menus, ghost) vira roxo cheio com texto branco, não mais cinza claro. Se isso incomodar, trocar nos componentes por `hover:bg-secondary`.
- Tokens novos: `chip`/`chip-foreground` (`#ECE6F5`/`#4F3780`), `brand-blue` (`#3CBFF0`) e `brand-blue-soft` (`#90DAF6`) só decorativos (nunca texto sobre claro), `topbar` e `footer` (com `-foreground`, `#2A2A35`/`#E9E7F0`), `hero-gradient` (gradiente branco para `#F3F2F7`, usado como `bg-hero-gradient`). Os mesmos nomes têm valor em `.dark` (equivalentes escuros) para não ficarem indefinidos.
- `sidebar-*` do claro realinhados à paleta (fundo `#2A2A35`; foco azul `#3CBFF0`, 6,69:1 sobre o fundo). `count-3`, `count-4`, `badge` e `hero-overlay` não mudaram.
- `--radius` continua 0.5rem; o mockup usa 14px, então os componentes do portal usam `rounded-[14px]` explícito. `destructive` claro (`0 84% 60%` com texto quase branco) tem cerca de 3,8:1 e já era assim; revisar.
- Contrastes novos (calculados à mão, sem axe):

| Par | Razão | Critério |
|---|---|---|
| foreground / background | 14,18 | texto 4,5 |
| foreground / muted (`#F3F2F7`) | 12,73 | texto 4,5 |
| muted-foreground / background | 6,98 | texto 4,5 |
| muted-foreground / muted | 6,27 | texto 4,5 |
| primary (e accent) como texto / background | 7,30 | texto 4,5 |
| primary como texto / muted | 6,56 | texto 4,5 |
| primary-foreground branco / primary | 7,30 | texto 4,5 |
| input `#898198` / background | 3,71 | componente 3 |
| input / muted | 3,33 | componente 3 |
| ring `#644795` / background | 7,30 | componente 3 |
| chip-foreground / chip | 7,86 | texto 4,5 |
| chip-foreground / background | 9,59 | texto 4,5 |
| foreground / brand-blue | 6,69 | texto 4,5 |
| brand-blue / background | 2,12 | reprova, só decorativo |
| border / background | 1,29 | decorativo, não é o limite do campo |
| topbar-foreground / topbar | 11,59 | texto 4,5 |

- Pares count/rank refeitos (claro; o escuro não mudou):

| Par | Claro | Escuro |
|---|---|---|
| badge / badge-foreground | 6,41 | 6,41 |
| count-1 (muted-foreground sobre branco) | 6,98 | 5,70 |
| count-2 (branco sobre `#644795`) | 7,30 | 6,25 |
| count-3 | 5,43 | 5,43 |
| count-4 | 8,62 | 8,62 |
| rank-1 (`#644795` sobre branco) | 7,30 | 14,86 |
| rank-2 (verde `142 72% 29%`) | 5,08 sobre branco, 4,56 sobre `#F3F2F7` | 5,40 |
| rank-3 | 6,41 sobre branco, 5,76 sobre `#F3F2F7` | 8,58 |
| rank-4 (muted-foreground) | 6,98 | 5,70 |

- Hex para HSL arredondado: `foreground` usa `18.6%` de luminosidade e `muted-foreground` `37.5%` para reproduzir o hex original. `rank-2` sobre `#F3F2F7` (4,56) tem folga de 0,06; não escurecer o fundo sem refazer.
- Não testado em navegador.

### Sidebar, hover e Newsletter (`SidebarWidget.tsx`, `NewsletterWidget`)

- Hover dos links da sidebar: `text-accent` no escuro tinha contraste baixo, então no escuro usa `text-foreground`; nos dois temas há `underline` (não depende só de cor). Foco com `outline` na cor `foreground`.
- O nome da categoria vira slug da rota com `toLowerCase().normalize("NFD")` removendo acentos.
- Home: o "Em Alta" da sidebar lista os 4 artigos com mais acessos (`views > 0`). Sem a coluna `views` no banco, ou sem nenhum acesso, cai para `novidades` (posições 2 a 5 por data).
- Pares count/rank: ver tabela em "Identidade do modo claro".
- Hero: `--hero-overlay` é `222 47% 11%`; o título branco tem 7,97:1 no pior caso (carrossel não alterado nesta etapa).
- Newsletter e demais widgets foram refeitos na etapa "Home no modo claro" abaixo; os valores antigos de borda `/60` e `/90` deixaram de valer.

### Home no modo claro (`PortalLayout.tsx`, `ArticleCard.tsx`, `SidebarWidget.tsx`, `Home.tsx`)

- Fiel a `apresentacao/home-modo-claro.html`. Largura útil `max-w-[1200px]` com `px-4 sm:px-6`. `--radius` mantido em 0.5rem (mudar para 14px afetaria shadcn, admin e Auth); os componentes do portal usam `rounded-[14px]`, `rounded-[10px]` e `rounded-[22px]` explícitos.
- `PortalLayout`: topbar `bg-topbar`, cabeçalho sticky, nav em `ul/li` com `aria-current="page"` e sublinhado em gradiente azul para roxo no item ativo, menu mobile com `aria-expanded`, `aria-controls` e rótulo. Foi removido o botão "Pesquisar" (duplicava a lupa, mesma rota); o botão de tema entrou depois (ver "Alternador de tema"). Rodapé em três colunas com `bg-footer`; usa `logo-white.png`. Foco sobre fundo escuro usa `outline-brand-blue` (6,69:1 sobre `#2A2A35`); sobre claro, `outline-ring`.
- `ArticleCard`: o cartão deixou de ser um `Link` único; o título é o link, esticado com `after:absolute after:inset-0`. A imagem de capa virou decorativa (`alt=""`), porque o título já nomeia o cartão. Foco do cartão com `has-[:focus-visible]`. Meta no formato "Autor · data" (era "Por autor"). Hover sobe 3px só com `motion-safe`.
- `CoverArt` (exportado de `ArticleCard.tsx`): arte SVG com losangos usada quando falta capa (cartões e vídeos; a variante `hero` existe mas o carrossel não a usa). Cores via tokens (`topbar`, `primary`, `brand-blue`, `brand-blue-soft`, `input`), formas escolhidas por hash do slug entre 5 composições do mockup. O vídeo sem miniatura deixou de usar `/placeholder.svg`.
- `SidebarWidget`: listas semânticas, ranking e contagens em `chip`/`primary` como no mockup. Por isso os tokens `count-1..4` e `rank-1..4` e `COUNT_BANDS` ficaram sem uso no claro (continuam em `index.css` para o escuro). "Em Alta" ganhou `views` opcional ("Categoria · N acessos", só quando vem de `views`). Estados de carregando (`loading`) e vazio nos dois widgets.
- Newsletter: **fora da Home por decisão do usuário**; o componente `NewsletterWidget` continua em `SidebarWidget.tsx`, pronto e sem uso. Decisão em aberto para o futuro: se a Newsletter entra na Home (e onde), o que o botão "Assinar" faz (hoje nada) e onde os e-mails são guardados (exige tabela ou serviço no banco do professor). Para reativar, importar `NewsletterWidget` em `Home.tsx` e renderizar na `aside` depois de `CategoriesWidget`. O componente foi refeito com `<label>` `sr-only`, `autoComplete="email"`, `form` com `preventDefault`; o botão continua sem ação (decisão de produto). Fundo `linear-gradient(135deg, topbar 0%, primary 130%)`; pior ponto do gradiente `#57407F`.
- Contrastes novos (calculados à mão):

| Par | Razão |
|---|---|
| branco / pior ponto do gradiente da Newsletter | 8,59 |
| parágrafo `topbar-foreground` (`#E9E7F0`) / pior ponto | 7,02 |
| placeholder `topbar-foreground` / campo (fundo +8% branco) | 5,68 |
| texto digitado branco / campo | 6,95 |
| borda branca / gradiente | 8,59 (componente 3) |
| foco `brand-blue-soft` / gradiente | 5,54 (componente 3) |
| botão `foreground` / `brand-blue` | 6,69 (o pedido era `#1D1D26` = 7,88; não existe token, e 6,69 passa) |
| `brand-blue` (foco) / `topbar` | 6,69 |

- `Home.tsx`: cabeçalhos de seção com traço em gradiente (`SectionHead`), `CategorySection`, `ArticleGrid` e `VideoCard` locais; `slate-*` trocado por tokens; estado `loading` com mensagem "Carregando…". Os `any` foram mantidos (8). Erros da consulta ao Supabase continuam sem estado de erro visível (a Home ignora o `error` das consultas, exceto `views`).
- Cartões de vídeo, cartões de artigo e Newsletter não foram testados em navegador.
- Auditoria WCAG 2.2 AA da Home (leitura de código, sem axe nem navegador):
  - `PortalLayout` ganhou link "Pular para o conteúdo" (2.4.1, visível só no foco; `main` com `id="conteudo"` e `tabIndex={-1}`) e título da aba por rota (2.4.2): nome do item de menu ativo + " - TechIn", senão o título padrão. Páginas de artigo, vídeo e categoria ainda ficam com o título padrão (não há `document.title` nelas); definir em cada página.
  - `index.css` (`@layer base`): `html { scroll-padding-top: 6rem }`, para o cabeçalho sticky não cobrir por inteiro o elemento focado (2.4.11).
  - Widgets da sidebar: títulos passaram de `h3` para `h2` (pares das seções `h2` da Home); "Em Alta" virou `ol` (o número é `aria-hidden`, a lista ordenada passa a posição); a contagem de categoria ganhou "artigo(s)" em `sr-only`.
  - `VideoCard`: link com prefixo `sr-only` "Vídeo: ", porque o ícone de play é decorativo e era o único sinal do tipo de conteúdo.
  - Pontos aceitos: `has-[:focus-visible]` no cartão exige Chrome 105, Safari 15.4 ou Firefox 121 (sem suporte, o link esticado fica sem foco visível); `aside` dentro de `main` e links da topbar fora de landmark são avisos de boa prática, não critério; botões "Ver mais" e links do rodapé têm menos de 24px de altura mas passam pela exceção de espaçamento do 2.5.8; ações de editar e apagar: `action-delete` 3,78:1 sobre branco e 3,40:1 sobre `secondary` (ícone, mínimo 3), `action-edit` 5,08 e 4,56.
  - Pendente: o botão "Assinar" não dá retorno (4.1.3 / 3.3); três `role="status"` "Carregando…" ao mesmo tempo na Home; foco não é movido após troca de rota; lucide-react 0.462 pode não pôr `aria-hidden` nos ícones sem rótulo (os botões têm `aria-label`, então o nome está correto).

### Contagem de acessos

- A função `increment_article_views` é `SECURITY DEFINER`, incrementa de forma atômica só artigo `published` e tem `EXECUTE` apenas para `anon` e `authenticated`. Reversão manual: `DROP FUNCTION public.increment_article_views(uuid)` e recriar o trigger sem `WHEN`; `DROP FUNCTION public.update_articles_updated_at_column()` só depois de o trigger usar outra função; `DROP COLUMN views` só depois de o front parar de usá-la, em release separada. A função compartilhada `update_updated_at_column` não é tocada, para não arriscar `profiles`, `categories` e `videos`.
- `Article.tsx` chama o rpc ao carregar e deduplica só no navegador: `sessionStorage`, chave `viewed:<id>`, gravada antes do rpc e removida se ele falhar. Sem `sessionStorage`, conta sem deduplicar e avisa com `console.warn`. Falha do rpc vai só para `console.error` e não bloqueia a página.
- Limitação: não há rate limit no servidor; qualquer visitante pode chamar a função e inflar a contagem.
- "Em Alta" de `Article.tsx` usa o mesmo `TrendingWidget` da Home e a mesma regra: até 4 artigos publicados com `views > 0` por `views` desc. Se a consulta falhar (coluna ausente, `console.error`) ou ninguém tiver acesso, cai para os publicados por `published_at desc` nas posições 2 a 5 (pula o mais recente, como o `novidades` da Home), sem "N acessos". A regra está duplicada em `Home.tsx` (que ordena em memória) e `Article.tsx` (que consulta no banco); não foi extraída porque a Home deriva o ranking da mesma consulta que alimenta o hero. Na página de artigo o widget é `h2` e os demais títulos laterais ainda são `h3`; "Sugestões de Leitura" vem antes do `h1` no DOM.
- `Home.tsx` não pede `views` na query principal: busca `id, views` à parte; se falhar, faz `console.error`, segue com `popular = null` e o carrossel fica sem o slide DESTAQUE até a migration ser aplicada.

### Edição de autores (`pages/admin/AdminAuthors.tsx`)

- Botão de lápis na coluna Ações carrega o autor no formulário (estado `editingId`); o mesmo formulário faz `insert` (novo) ou `update` (edição), com botão "Cancelar edição". Excluir o autor em edição limpa o formulário.
- O `update` usa `.select()` e acusa erro se nenhuma linha voltar: o Supabase não reporta erro quando o RLS bloqueia o update, só devolve zero linhas. Se isso aparecer, falta policy de `UPDATE` para admin em `authors` (banco do professor).
- Não testado em navegador nem contra o banco. Os comentários do arquivo foram removidos. Os `any` e o aviso de `useEffect` já existiam.

### Visualização do artigo no admin (`ArticlePreview.tsx`, `AdminArticles.tsx`)

- O modal de artigo tem abas "Editar artigo" e "Visualizar artigo". A prévia (`components/admin/ArticlePreview.tsx`) repete só a coluna central de `Article.tsx` (categoria, título, data, resumo, capa, conteúdo, autor), sem as sidebars. Duplica a marcação de `Article.tsx`: mudou o layout lá, mudar aqui.
- A prévia sanitiza o conteúdo com DOMPurify (depois de tirar `<style>`, como a página real); `Article.tsx` só tira `<style>` e não usa DOMPurify, então a página pública aceita HTML com script. Vale tratar à parte.
- Sem data de publicação, a prévia mostra "Data definida ao publicar". O `<style>` é removido pelo DOMPurify (`FORBID_TAGS`), não por regex, para o CSS do artigo não vazar para o painel; o título da prévia é `h2` por estar dentro do Dialog. A prévia usa a largura do modal, não a da página.
- Não testado em navegador. O erro de `tsc` em `AdminArticles.tsx` (`setItems`) já existia, por causa do `types.ts` desatualizado.

### Proposta de identidade e modo escuro (`apresentacao/`)

- `apresentacao/home-modo-claro.html` e `home-modo-escuro.html`: mockups estáticos e independentes da home, só para aprovação da turma. Não fazem parte do app (nada em `src`), com logo embutida em base64. As fontes (Domine e Epilogue) vêm do Google Fonts; sem internet cai para Georgia e system-ui. Conteúdo de exemplo.
- Base: o manual de identidade do TechIn (`src/assets/slide1..10.png`). Paleta: `#2A2A35` (primária), `#644795` (roxo), `#3CBFF0` (azul), `#90DAF6`, `#898198`, `#FFFFFF`. O texto do slide 7 diz `#3a3a3b` para a primária, mas a cor desenhada é `#2A2A35` (RGB 58-58-59 se repete em todos os cartões, parece cópia); usei a cor desenhada. Fontes do manual: Domine (títulos) e Epilogue (subtítulos e parágrafos); o modo claro do app já usa as duas (antes Playfair Display e Inter).
- Cores derivadas (não estão no manual): `#1D1D26` e `#23232D` (fundos escuros), `#15151C` (topo e rodapé no escuro), `#B79CE8` (roxo claro para texto e links no escuro, porque `#644795` sobre `#2A2A35` dá só 1,94:1), `#F3F2F7` (fundo alternativo claro), `#5B5768` (texto secundário claro), `#B9B4C6` (texto secundário escuro), tons de chip.
- Contrastes calculados à mão (sem axe): texto/fundo 14,18 claro e 15,15 escuro; secundário 6,98 e 8,29; link roxo 7,30 e 7,11; botão branco/roxo 7,30; botão `#1D1D26`/`#3CBFF0` 7,88. `#3CBFF0` só aparece como texto no escuro (6,69 sobre `#2A2A35`). Bordas de campo `#898198` (3,71 no claro, 3,82 no escuro).
- Logo: no claro, a versão colorida (`logo.png`); no escuro e no rodapé, a monocromática branca (negativa do slide 5), gerada de `TechIn logo.png`. A logo colorida tem "In" escuro, que some no fundo escuro.
- Carrossel do mockup sem autoplay (evita o WCAG 2.2.2). Não há alternância automática de tema: o botão do cabeçalho abre o outro arquivo.

### Identidade do modo escuro (`index.css`, bloco `.dark`)

- Fonte da verdade: `:root` de `apresentacao/home-modo-escuro.html`. Só o `.dark` mudou; o `:root` e os `.tsx` não foram tocados. Todo token do `:root` tem valor próprio no `.dark`, sem `var()` cruzado. Ativação do tema: ver "Alternador de tema".
- Mapeamento (hex de origem e HSL gravado):
  - `background` `#1D1D26` (`240 13.4% 13.1%`); `card`/`popover` `#2A2A35` (`240 11.6% 18.6%`); `secondary`/`muted` `#23232D` (`240 12.5% 15.7%`); `foreground` `#F4F3F8` (`252 26.3% 96.3%`); `muted-foreground` `#B9B4C6` (`256.7 13.6% 74.1%`)
  - `primary` `#B79CE8` (`261.3 62.3% 76.1%`) com `primary-foreground` `#1D1D26`. É texto de link e fundo de botão ao mesmo tempo, como no claro. O roxo `#644795` não serve de texto (1,94:1 sobre o card).
  - `accent` e `brand-blue` `#3CBFF0` (`196.3 85.7% 58.8%`) com `accent-foreground` `#1D1D26`; `ring` e `brand-blue-soft` `#90DAF6` (`196.5 85% 76.5%`). Como no claro, `hover:bg-accent` do shadcn vira cheio (agora azul com texto escuro).
  - `border` `#3D3B4B` (`247.5 11.9% 26.3%`, só decorativa); `input` `#898198` (`261 10% 55%`, borda de campo)
  - `chip` `#3A3352` (`253.5 23.3% 26.1%`), `chip-foreground` `#D2C2F2` (`260 82.8% 88.6%`); `topbar`/`footer` `#15151C` (`240 14.3% 9.6%`) com `#D9D6E3` (`253.8 19.7% 87.1%`)
  - `destructive` e `action-delete` mudaram de `0 62% 30%`/`0 84% 60%` para `0 91% 71%` (`#F87171`): o vermelho escuro antigo não servia de texto. `destructive-foreground` passou a `#1D1D26` (botão destrutivo claro com texto escuro). `action-edit` `142 70% 50%`. `success` `142 70% 50%` com foreground `#1D1D26`. `highlight`, `badge` e `hero-overlay` iguais ao claro (já eram legíveis nos dois fundos).
  - `count-1` fundo card, texto `muted-foreground`; `count-2` fundo `primary` com texto `#1D1D26`; `count-3` e `count-4` iguais ao claro. `rank-1` roxo claro, `rank-2` verde `142 70% 50%`, `rank-3` âmbar `38 92% 55%`, `rank-4` `muted-foreground`. No escuro `rank-3` é âmbar e no claro é vermelho, porque o vermelho `badge` escuro some no fundo.
  - `sidebar-*`: fundo `topbar`, primário roxo claro com texto `#1D1D26`, item ativo `#2A2A35`, anel `#90DAF6`.
  - `hero-gradient`: `#23232D` para `#1D1D26`.
- Contrastes: a tabela abaixo foi calculada à mão pelo agente de design e depois reconferida por script direto do `index.css` (32 pares, 0 falhas; algumas razões diferem por décimos, por exemplo `count-3` 5,44 e `count-4` 8,63; valem as do script). Sem axe e sem navegador:

| Par | Razão | Critério |
|---|---|---|
| foreground / background | 15,13 | texto 4,5 |
| foreground / card | 12,84 | texto 4,5 |
| foreground / secondary | 14,09 | texto 4,5 |
| muted-foreground / card | 7,02 | texto 4,5 |
| muted-foreground / background | 8,28 | texto 4,5 |
| muted-foreground / secondary | 7,71 | texto 4,5 |
| primary texto / background | 7,11 | texto 4,5 |
| primary texto / card | 6,03 | texto 4,5 |
| primary texto / secondary | 6,62 | texto 4,5 |
| primary-foreground / primary | 7,11 | texto 4,5 |
| accent-foreground / accent | 7,87 | texto 4,5 |
| accent texto / card | 6,68 | texto 4,5 |
| chip-foreground / chip | 7,18 | texto 4,5 |
| chip-foreground / card | 8,60 | texto 4,5 |
| destructive texto / card | 5,12 | texto 4,5 |
| destructive texto / background | 6,04 | texto 4,5 |
| destructive-foreground / destructive | 6,04 | texto 4,5 |
| action-edit / card | 7,55 | ícone 3 |
| action-edit / background | 8,89 | ícone 3 |
| action-delete / card | 5,12 | ícone 3 |
| action-delete / background | 6,04 | ícone 3 |
| rank-1 / card | 6,03 | texto 4,5 |
| rank-2 / card | 7,55 | texto 4,5 |
| rank-3 / card | 7,13 | texto 4,5 |
| rank-4 / card | 7,02 | texto 4,5 |
| count-1 (muted-foreground / card) | 7,02 | texto 4,5 |
| count-2 (`#1D1D26` / primary) | 7,11 | texto 4,5 |
| count-3 (`220 30% 12%` / `142 72% 38%`) | 5,17 | texto 4,5 |
| count-4 (`220 30% 12%` / `38 92% 55%`) | 8,20 | texto 4,5 |
| badge (branco / `0 74% 42%`) | 6,41 | texto 4,5 (valor herdado) |
| ring / background | 10,78 | componente 3 |
| ring / card | 9,14 | componente 3 |
| input / card | 3,82 | componente 3 |
| input / background | 4,50 | componente 3 |
| input / secondary | 4,19 | componente 3 |
| topbar-foreground / topbar | 12,70 | texto 4,5 |
| sidebar-primary / sidebar-background | 7,73 | texto e componente |
| border / card | 1,30 | decorativa, não é limite de campo |

- Nenhum par reprovou, então só `destructive` e `action-delete` foram alterados em relação à proposta da etapa anterior (o antigo `0 84% 60%` dava 4,51 sobre o card, no limite). `count-3` e `count-4` dão 5,44 e 8,63 pelo script (os 5,17 e 8,20 da tabela eram cálculo à mão impreciso); ambos passam.
- Não validado: contraste de `destructive/5` e `/30` sobre fundo (Settings), `text-success` em hover com opacidade e as sombras do mockup (`--shadow` não virou token).
- Não testado em navegador.

### Ícones de ação (editar e apagar)

- Tokens por função `action-edit` (verde, `142 72% 29%` no claro, 5,08:1 sobre branco; `142 70% 50%` no escuro) e `action-delete` (vermelho `0 84% 60%` nos dois temas, 3,78:1 sobre branco e 4,51:1 sobre o card escuro; ícone é componente, mínimo 3:1). Classes `text-action-edit` e `text-action-delete`; hover com `bg-secondary`, não `bg-accent`, porque `accent` virou roxo cheio.
- Aplicados nos botões de lápis e lixeira de `AdminArticles`, `AdminVideos`, `AdminCategories`, `AdminAuthors` e `Profile` (lixeira). O lápis no título do formulário de `AdminAuthors` é decorativo e não mudou. Os botões ganharam `aria-label` com o nome do item.
- Contrastes calculados à mão, sem axe; não testado em navegador.

- Desempate do "Em Alta": `views` desc e, em empate, `published_at` desc, igual na Home (que herda a ordem da consulta por data) e em `Article.tsx` (`.order("views").order("published_at")`). Sem isso, artigos empatados apareciam em ordem diferente nas duas telas. A regra continua duplicada entre as duas telas.

### Alternador de tema (`App.tsx`, `ThemeToggle.tsx`, `PortalLayout.tsx`, `AdminLayout.tsx`)

- `ThemeProvider` de `next-themes` em `App.tsx` (envolve tudo, inclusive o `Sonner`, que já usava `useTheme`): `attribute="class"`, `defaultTheme="system"`, `enableSystem`, `storageKey="techin-theme"`. Sem escolha salva, o tema segue o sistema; a escolha manual vai para `localStorage` (`light` ou `dark`) e vale nas visitas seguintes. A lib trata falha de `localStorage` com `try/catch` (conferido no bundle) e injeta um script que aplica a classe antes da pintura. Sem escolha salva a classe no `html` é a do sistema; o script usa a chave `techin-theme`.
- `src/components/ThemeToggle.tsx`: botão "pill" como no mockup (sol/lua do lucide, texto "Modo escuro"/"Modo claro" mostrando o destino, `aria-label` "Trocar para modo escuro/claro", 40px de altura, foco com `outline-ring`). Só renderiza depois de montar (`useEffect`), com um `span` de 40px no lugar, para não haver diferença de texto entre servidor e cliente. O rótulo visível está contido no `aria-label` (2.5.3).
- Portal: no cabeçalho a partir de 640px; abaixo disso, dentro do menu mobile (largura total). Admin: no rodapé da barra lateral, acima de "Sair". `Auth` fica fora do `PortalLayout` e não tem alternador (segue o tema salvo ou o do sistema).
- Logo: claro usa `logo.png`; escuro usa `logo-white.png`, trocadas por CSS (`dark:hidden` e `hidden dark:block`, sem flash). No rodapé (escuro nos dois temas, `#2A2A35` e `#15151C`) passou a usar `logo-white.png` em vez do símbolo; o símbolo sozinho ficava pobre ao lado do texto. `logo-symbol-white.png` ficou sem uso. No admin, `logo-C7WwK5gX.png` no claro e `logo-white.png` no escuro.
- Cores fixas trocadas por token:
  - rodapé: títulos, hover dos links e filete usavam `primary-foreground` como "branco"; no escuro isso vira `#1D1D26` e sumia sobre o rodapé. Agora `footer-foreground`
  - `Category.tsx`: círculo de play `text-white` sobre `accent` (branco sobre `#3CBFF0` dá 2,12) passou a `text-accent-foreground`
  - `Video.tsx`: `text-slate-800` virou `text-foreground/90` e a descrição ganhou `dark:prose-invert`
  - `Profile.tsx`: ícone do LinkedIn `text-blue-600` virou `text-primary`
  - botões ghost "Voltar para a home" (`Auth`) e "Cancelar" (`Profile`): `hover:bg-secondary hover:text-foreground` em vez do hover `accent`
- Conferido sem mudança: `Article.tsx` e `SearchPage.tsx` (`bg-accent/10 text-accent`: 5,54:1 no escuro sobre o card, 6,30 no claro); `Settings.tsx` zona de risco no escuro (`text-destructive` sobre `destructive/5`: 4,76 sobre card, 5,66 sobre fundo). No claro o mesmo par dá 3,54 (já era assim; revisar, abaixo de 4,5). `bg-black` do player e do overlay do vídeo é intencional.
- Limitações / não testado: `NewsletterWidget` (fora da Home) usa `primary-foreground` como branco e `text-foreground` no botão; quebra no escuro, corrigir antes de reativar. (`CoverArt` e setas do carrossel de `About` foram corrigidos na auditoria abaixo.) Páginas `/artigo/*`, `/video/*`, `/perfil`, `/configuracoes` e o admin não foram abertas no navegador no escuro (as de artigo e vídeo de propósito, para não somar acessos). Não foi usado axe. O hero não foi alterado.

### Barra lateral do admin (`AdminLayout.tsx`)

- A `aside` é `sticky top-0 h-screen`: ocupa a altura da janela e não rola com a página. O topo (logo) e o rodapé (Ver portal, e-mail, tema, Sair) são `shrink-0`; só a lista de links rola (`overflow-y-auto`) se a janela for baixa. O `main` ganhou `min-w-0` para tabelas largas não esticarem a página.
- Não testado em navegador com o admin logado.

### Badges de status no admin

- `components/ui/badge.tsx` ganhou as variantes `chip` (`bg-chip`/`text-chip-foreground`, a mesma pílula lilás do portal; 7,86:1 no claro e 7,76:1 no escuro) e `draft` (`bg-muted`/`text-muted-foreground` com borda; 6,27:1 no claro). Usadas em `AdminArticles` e `AdminVideos` (Publicado = `chip`, Rascunho = `draft`) e em `AdminAuthors` (papel do integrante, com cor própria por pedido do usuário para identificar de relance: Autor = verde, Desenvolvedor = azul, Orientador = lilás `chip`; o texto do papel continua no badge, então a cor não é o único sinal). Tokens `role-autor` e `role-dev` (cada um com `-foreground`) em `:root` e `.dark`, variantes `autor` e `desenvolvedor` em `badge.tsx`. Contrastes (por script): claro autor 6,50, dev 8,01, orientador 7,79; escuro autor 7,51, dev 7,72, orientador 7,76. Antes eram verde, âmbar, roxo e azul fixos.
- Contrastes calculados à mão, sem axe; não testado em navegador com o admin logado.

### Auditoria WCAG 2.2 AA do modo escuro (por leitura de código)

- Método: leitura dos `.tsx` e de `components/ui`, contraste calculado à mão (luminância WCAG, erro menor que 0,05). Sem shell, sem axe e sem navegador nesta etapa, então nada foi visto renderizado. O que depende de render (cor final de sombra, `color-scheme` aplicado, ordem de variantes do Tailwind) ficou sem conferir.
- Corrigido:
  - `ThemeToggle`: ganhou `role="status"` `sr-only` que anuncia "Modo escuro/claro ativado" (4.1.3); a troca do `aria-label` sozinha não é anunciada de forma confiável. Alvo 40px, nome acessível contém o texto visível, foco `outline-ring` (10,78 sobre o fundo escuro): sem mudança. Não há opção de voltar a "sistema" depois da primeira escolha (decisão de produto).
  - `CoverArt`: contorno `stroke-primary-foreground` virava `#1D1D26` sobre `#15151C` (invisível); agora `stroke-topbar-foreground`.
  - `SearchPage`: campo com `border-border` (1,53:1 no escuro; 1,3:1 no claro) passou a usar `border-input` (4,50 sobre o fundo escuro); campo ganhou `aria-label`; número do "Em Alta" usava `text-muted-foreground/30` (1,93:1 no escuro) e agora é `text-muted-foreground` com `aria-hidden` (8,28).
  - `Settings` (não estava no git como alterado): bordas de campo `border-border` (1,30 sobre o card) viraram `border-input` (3,82); `label` com `htmlFor`/`id`; `autoComplete` em nome, e-mail e telefone; os "toggles" eram `div` sem teclado nem papel (2.1.1, 4.1.2) e viraram `Switch` do shadcn com `aria-labelledby`; botões com `type="button"`, foco visível e `aria-current` na aba ativa. A página continua sem ação nenhuma (mock).
  - `Profile`: `input type=file` com `hidden` (`display:none`) não recebia foco; virou `sr-only` e o `label` mostra foco por `has-[:focus-visible]`; `label` dos campos ligados por `htmlFor`.
  - `Auth`: `autoComplete` (`email`, `current-password`, `new-password`, `name`).
  - `Category`: link do vídeo sem foco próprio ganhou `outline-ring`; miniatura duplicava o título no nome do link (`alt=""`); o fallback `/placeholder.svg` é logo preta sobre transparente (invisível no card escuro) e foi trocado por `CoverArt`, como na Home; `▶` com `aria-hidden`.
  - `Article`: `alt` das sugestões e da foto do autor viraram `""` (duplicavam o texto ao lado); marcadores de lista do `prose-invert` (`#6b7280`, 2,93:1 sobre o card) agora usam `muted-foreground` no escuro (7,02).
  - `Video`: `iframe` sem `title` (4.1.2) ganhou `title`.
  - `About`: `CarouselPrevious/Next` mesclavam `hover:text-accent-foreground` do `outline` com `hover:bg-popover` (ícone invisível no hover, nos dois temas); acrescentado `hover:text-popover-foreground`. Links de LinkedIn e e-mail eram só ícone, sem nome (2.4.4, 4.1.2): ganharam `aria-label` e foco.
  - `ui/tabs`: aba ativa só mudava de fundo (`background` sobre `muted`, 1,1:1) e a sombra some no escuro; agora tem filete inferior `primary` (6,6:1 sobre `secondary`; 1.4.1/1.4.11).
  - `ui/dialog`: texto "Close" em inglês virou "Fechar"; botão de fechar de 16px passou a 24px; removido `data-[state=open]:bg-accent data-[state=open]:text-muted-foreground`, que daria 1,5:1 se o estado fosse aplicado.
  - `ui/carousel`: "Previous slide" e "Next slide" em português.
  - `ui/toast` (Radix, usado em `AdminAuthors`): fechar do toast destrutivo era `red-300` sobre `destructive` (1,46:1 no escuro); agora `destructive-foreground` (6,04).
- Pares usados de fato, calculados (escuro): `accent/10` sobre card com texto `accent` 5,55 (chip de busca e artigo) e sobre o fundo 6,61 (chip do vídeo); `primary` sobre `primary/10` do avatar 5,05; `text-primary/90` sobre o fundo 6,01; `destructive` sobre `destructive/5` 5,66 (fundo); `text-foreground/50` do fechar do toast e chevron do `Select` 4,77; prosa `gray-300` 9,62, legendas e contadores `gray-400` 5,58; `green-700` sobre `green-100` 4,57 e `amber-700` sobre `amber-100` 4,51 (badges de `AdminVideos`, mesmos nos dois temas); `purple/blue/green-400` sobre `-900/30` 5,11, 5,16 e 7,25 (`AdminAuthors`); anel `ring` 10,78 sobre o fundo e 9,14 sobre o card; borda de campo `input` 4,50 e 3,82.
- Sem mudança: `Select` e `DropdownMenu` (`focus:bg-accent` com `accent-foreground` 7,87), `Input`/`Textarea` (placeholder `muted-foreground` 8,28), `Button` (anel `ring-2` com offset), `Switch`, `Checkbox`, sonner (`theme` do `next-themes`, região `aria-live="polite"` na lib; `color-scheme` tratado pelo `next-themes`), logo (`alt=""` dentro de link com `aria-label`, variante clara escondida por `dark:hidden`; rodapé `alt="TechIn"`), `CoverArt` `aria-hidden`.
- Ressalvas e pendências:
  - Conteúdo de artigo vindo do banco pode trazer `style="color:..."` ou classes próprias; `prose-invert` não cobre isso. O editor Tiptap atual não tem extensão de cor.
  - Imagens PNG transparentes com texto escuro inseridas no corpo do artigo somem no escuro.
  - `AdminAuthors` (fora do escopo desta etapa, não editado): links só de ícone sem nome e "-" com `opacity-40` abaixo de 4,5:1.
  - `DropdownMenuSubTrigger` (sem uso hoje) mistura `bg-accent` sem `text-accent-foreground`; corrigir se for usado. `sheet.tsx` e `sidebar.tsx` ainda têm "Close" e "Toggle Sidebar" em inglês.
  - Modo claro (só reporte): `destructive` branco sobre `0 84% 60%` dá 3,76 no botão destrutivo e em `text-destructive` sobre `destructive/5` dá 3,54 em `Settings`; `ChevronDown` do `Select` com `opacity-50` dá 2,94 sobre branco (ícone, mínimo 3); fechar do toast padrão `foreground/50` 2,94.
  - `Article.tsx` aninha `<main>` dentro do `<main id="conteudo">` do `PortalLayout`; resultados da busca e "Buscando…" não têm `role="status"` (4.1.3); `About` descreve os slides do manual só como "Página N" (1.1.1, imagens de texto); sombra de hover dos cartões (`foreground/0.07`) some no escuro, o feedback fica no sublinhado do título e no deslocamento.
  - `Auth` não tem alternador de tema (segue o salvo ou o do sistema) e não tem `h1`.
  - `NewsletterWidget` (fora da Home) continua com as ressalvas da seção "Alternador de tema".
- Hero: lido sem edição. Não achei problema específico do escuro (overlay, texto branco e setas `slate-900/70` não dependem do tema; selos `chip`/`chip-foreground` dão 7,18).

### Responsivo na página de artigo (`Article.tsx`)

- Abaixo de `lg` as duas colunas laterais ficam ocultas (inclui "Em Alta" e "Categorias"). Por pedido do usuário, "Sugestões de Leitura" volta no fim do artigo no celular: seção `lg:hidden` depois do `main`, em 1 coluna (2 a partir de `sm`), com `h2`; no desktop continua na coluna da esquerda (`h3`). A lista vem de `renderSuggestions`, uma só para os dois lugares. "Categorias" (e "Em Alta") seguem sem aparecer no celular, por decisão do usuário.
- Não testado em navegador (a página de artigo não é aberta no navegador automático por causa do contador de acessos).

### Tamanho da logo no cabeçalho do portal

- `logo.png` (colorida, 700x300) tem margem transparente maior que `logo-white.png` (400x150, recortada): o conteúdo visível mede 677x153 contra 388x88. Na mesma altura de 40px a colorida ficava ~13% menor. A colorida usa `h-[46px]` (conteúdo ~104px de largura, igual à branca com `h-10`); a branca segue em `h-10`. Se a arte for recortada no futuro, voltar as duas para a mesma altura.

### Pendências conhecidas

- `types.ts` está desatualizado em relação ao banco real (6 erros de `tsc`).
- `Home.tsx` tem 8 `any`.
- Lint do projeto: 32 erros e 11 avisos (todos pré-existentes, sem aumento nesta sessão).
- Comentários antigos ainda existem em outros arquivos (por exemplo `client.ts`, `Profile.tsx`, `AdminVideos.tsx`, `Category.tsx`, `SearchPage.tsx`); remover ao editar cada um.
- `package.json` é regravado por algo externo com `packageManager: yarn`; reverter antes de commitar (ver "Resumo das mudanças de 06/10/2026").
- Falta aplicar do manual: ícones sólidos, escolha entre logo linear e centralizada por contexto, favicon.
- Acessos reais do banco estão inflados pelos testes desta sessão (ver "Banco").
- `Auth.tsx` não tem botão de tema nem `h1`; na página de artigo, "Em Alta" e "Categorias" não aparecem no celular e "Categorias" e "Sugestões de Leitura" seguem no visual antigo, diferente do `CategoriesWidget` da Home.
- `slate-900` ainda aparece no `HeroCarousel.tsx` nos botões das setas e no `ring-offset` do link; falta token por função. O `ring-offset-slate-900` fixo no foco do título do hero é praticamente igual ao token `hero-overlay`.
- A Newsletter está fora da Home por enquanto e o botão "Assinar" não faz nada; decisão de produto adiada (ver "Sidebar, hover e Newsletter").
- `client.ts` tem URL e chave publishable fixas e não lê o `.env` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`). A chave é a anon, pública por desenho; a segurança depende das políticas RLS.
- Última migration troca a policy de leitura do bucket `media` por `auth.role() = 'anon' IS NOT NULL`, que tende a ser sempre verdadeira; revisar antes de considerar o bucket restrito.
- `npm audit` acusou 59 vulnerabilidades (27 altas); não tratadas.
- Existem `bun.lock`, `bun.lockb` e `package-lock.json`; o `npm install` foi o usado.
- `SearchPage.tsx` e `Video.tsx` usam `views`, que não existe no banco até a migration; `AdminOverview`, `AdminArticles` e `AdminVideos` também leem `views`.
- `Index.tsx` (2 linhas) e `Dashboard.tsx` não aparecem em nenhuma rota.
- `AdminAuthors` existe duplicado: `pages/admin/AdminAuthors.tsx` (usado em `App.tsx`) e `components/admin/AdminAuthors.tsx`.
