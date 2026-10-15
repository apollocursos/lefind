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
- `/carlos-piscineiro` — landing page individual com WhatsApp, Telegram, e-mail, partilha, orçamento e hub social.
- `/profissional/carlos-piscineiro` — alias compatível do cartão digital público.
- `/comunidades` — condomínios e grupos públicos/privados.
- `/lojas` — vitrines e spots patrocinados por região.
- `/relatorios` — relatório digital Antes e Depois.
- `/painel` — visão do profissional, métricas, modo SOS e checkout de Ouro/anúncio.
- `/admin` — painel ADM protegido por role, com concessão de cortesia e cancelamento manual.

A URL de divulgação no formato `/br/:cidade/:slug` e o slug limpo `/carlos-piscineiro` estão preparados em `vercel.json`; o frontend também aceita rotas amigáveis via SPA. Os embeds sociais configuráveis ficam em `client/src/pages/Profile.tsx` e usam as URLs dos próprios provedores.

## Banco de dados

O starter está conectado ao banco gerenciado do projeto por `DATABASE_URL` e usa Drizzle. O modelo persistente está em `drizzle/schema.ts`; o SQL portátil de referência está em `database/schema.sql`. Em um banco vazio, execute:

```bash
pnpm db:push
```

As tabelas cobrem usuários, perfis, lojas, comunidades, membros aprovados, avaliações, cotações, spots patrocinados, relatórios de serviço, pagamentos, eventos de webhook e entitlements. O frontend usa fallback demonstrativo quando ainda não existem registros, então o preview permanece navegável.

## Pagamentos e ativação automática

O projeto usa a integração Stripe provisionada pelo Webdev para checkout com **cartão e Pix**. O botão do painel cria a sessão no servidor; o navegador nunca recebe a chave secreta. Os métodos elegíveis são geridos pelo Payment Methods dinâmico do Stripe Dashboard; mantenha Pix e cartão habilitados na conta. O webhook `POST /api/stripe/webhook` recebe os eventos com o corpo bruto, valida `STRIPE_WEBHOOK_SECRET` e usa `paymentEvents.eventId` para impedir dupla ativação.

Quando um pagamento aprovado traz `metadata.product=gold`, o fulfillment grava `payments.status=approved`, cria/atualiza um entitlement e define `profiles.gold=1`. Quando traz `metadata.product=sponsored_spot`, ativa o entitlement e marca os spots da loja como `active`. Falhas, cancelamentos e reembolsos revogam o status, exceto quando existe uma sobreposição ADM de cortesia.

O único controle manual é `/admin`, protegido por `role=admin`: `grant` concede cortesia e `revoke` cancela/revoga. A intervenção manual fica registrada em `entitlements.source`, `manualOverride`, `overrideByUserId` e `overrideReason`; ela não substitui a confirmação do pagamento.

No projeto Manus, habilite a integração Stripe pelo Dashboard/configuração. Em um deploy Vercel próprio, configure `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `VITE_STRIPE_PUBLISHABLE_KEY`, `PUBLIC_APP_URL` e aponte o webhook Stripe para `/api/stripe/webhook`. Nunca persista número de cartão, CVV, validade, payload bruto ou chaves secretas.

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

O MVP usa fallback local quando o banco não está disponível, mas o caminho de produção para cobrança e fulfillment já está implementado em `server/payments.ts` e `server/paymentRoutes.ts`. Vídeos continuam fora do storage do LE.FIND: somente URLs/embed das plataformas de origem devem ser persistidos.
