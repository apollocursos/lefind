# LE.FIND

**LE.FIND** é o diretório local inteligente e ecossistema de negócios para quem presta, indica ou procura serviços. O MVP desta pasta traz uma experiência mobile-first em Dark Mode / Glassmorphism Tech, com diretório, perfil profissional, SOS 24h, comunidades, vitrines de lojas, relatórios Antes e Depois e painel do profissional.

## Rodar localmente

```bash
pnpm install
pnpm dev
```

O servidor escuta em `http://localhost:3000`. O endpoint `GET /api/health` responde `{ "status": "ok" }`. Para checar tipos e gerar a build de produção:

```bash
pnpm check
pnpm build
```

## Rotas principais

- `/` — descoberta local e profissionais disponíveis.
- `/buscar` — busca por profissão, produto, bairro ou cidade com filtros.
- `/profissional/carlos-piscineiro` — cartão digital público com WhatsApp, avaliações e mídias.
- `/comunidades` — condomínios e grupos públicos/privados.
- `/lojas` — vitrines e spots patrocinados por região.
- `/relatorios` — relatório digital Antes e Depois.
- `/painel` — visão do profissional, métricas e modo SOS.

A URL de divulgação no formato `/br/:cidade/:slug` está preparada em `vercel.json`; o frontend também aceita rotas amigáveis via SPA.

## Banco de dados

O starter está conectado ao banco gerenciado do projeto por `DATABASE_URL` e usa Drizzle. O modelo persistente está em `drizzle/schema.ts`; o SQL portátil de referência está em `database/schema.sql`. Em um banco vazio, execute:

```bash
pnpm db:push
```

As tabelas cobrem usuários, perfis, lojas, comunidades, membros aprovados, avaliações, cotações, spots patrocinados e relatórios de serviço. O frontend usa fallback demonstrativo quando ainda não existem registros, então o preview permanece navegável.

## PWA

`client/public/manifest.webmanifest`, `client/public/sw.js` e os ícones SVG deixam o site instalável. O manifesto é de propriedade da aplicação e a página registra o service worker no carregamento. Para produção, mantenha os paths públicos dos assets. O seletor PT/EN/ES já persiste a preferência do visitante e está preparado para receber o dicionário completo de conteúdo.

## Publicar na Vercel

1. Crie um repositório no GitHub e envie a pasta, sem incluir `.env` ou credenciais:

```bash
git init
git add .
git commit -m "feat: primeira versão do LE.FIND"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/lefind.git
git push -u origin main
```

2. Na Vercel, importe o repositório. O projeto já contém `vercel.json`, a função em `api/index.ts` e as rewrites de `/api/*` e links dinâmicos.
3. Configure as variáveis de runtime `DATABASE_URL`, `JWT_SECRET` e as variáveis de autenticação do ambiente escolhido. Nunca coloque esses valores no frontend.
4. Rode a migração/schema no banco de destino antes de abrir o tráfego. Em produção, prefira a migração versionada do Drizzle a alterações manuais destrutivas.
5. Defina o domínio `lefindapp.com` na Vercel e aponte os registros DNS indicados pelo painel.

## Evolução prevista

O MVP usa ações locais e dados demonstrativos para que o produto seja validado visualmente sem credenciais externas. Para a próxima etapa, conecte os procedimentos tRPC de `server/routers.ts` às tabelas reais, implemente autenticação por perfil, upload em storage, cobrança de spots e integrações oficiais de embeds das redes sociais. Vídeos continuam fora do storage do LE.FIND: somente URLs/embed das plataformas de origem devem ser persistidos.
