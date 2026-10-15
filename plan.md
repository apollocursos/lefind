# Plano de implementação — LE.FIND

## Escopo aprovado

Entregar um MVP navegável e modular do LE.FIND: diretório local inteligente, cartão digital de profissional, descoberta por SOS/verificação/avaliação, comunidades, vitrine de lojista, relatório Antes e Depois e base serverless com banco persistente. A primeira versão prioriza a experiência pública e os fluxos de demonstração com dados realistas, mantendo contratos prontos para ligar autenticação, pagamentos e integrações externas.

## Abordagem técnica

- **Frontend:** React + TypeScript + Wouter, com estado local para filtros, busca, favoritos e modais; componentes pequenos em `client/src/components/` e páginas separadas em `client/src/pages/`.
- **Backend:** Express já provisionado, health check, endpoint de demonstração e tRPC público para catálogo; a aplicação funciona mesmo sem banco local graças a dados de fallback, e as tabelas Drizzle ficam prontas para persistência real.
- **Dados:** estender `drizzle/schema.ts` com perfis, lojas, grupos, avaliações, cotações, anúncios e relatórios; adicionar schema SQL legível em `database/schema.sql` para provisionamento externo/Supabase como referência.
- **PWA:** `client/public/manifest.webmanifest`, `client/public/sw.js`, `client/public/icons/` e registro do service worker. O modo PWA será application-owned.
- **Rotas:** `/`, `/buscar`, `/profissional/:slug`, `/comunidades`, `/comunidade/:slug`, `/lojas`, `/relatorios`, `/painel`, além de `/api/*` no servidor. `public/manus-routes.json` declara as páginas navegáveis.
- **Deploy:** manter Dockerfile do starter, adicionar `vercel.json` com rewrites para `/api/*` e deep links, e registrar a declaração de deploy no Webdev config quando o app estiver estável.

## Direção visual

### Alternativas consideradas

1. **Glassmorphism Tech / Night Signal (0,06):** painéis translúcidos, luzes ciano e lime sobre fundo quase preto, sensação de rede viva e precisão.
2. **Editorial Local Premium (0,07):** tipografia serifada, papel quente e foco em histórias locais.
3. **Utility Neon Brutal (0,05):** blocos densos, alto contraste e sinais de status quase industriais.

### Escolha: Glassmorphism Tech / Night Signal

- **Movimento:** interface de produto premium inspirada em cockpits de mobilidade, dashboards de comunidade e mapas noturnos.
- **Princípios:** escaneabilidade em 3 segundos; confiança por sinais visuais; ação local em um toque; densidade responsiva sem parecer pesada.
- **Filosofia de cor:** base obsidiana cria foco e sensação de infraestrutura; ciano elétrico orienta descoberta; lime acende disponibilidade e SOS; âmbar comunica atenção e agenda futura; coral aparece apenas em urgência.
- **Paradigma de layout:** coluna editorial assimétrica com hero compacto, trilho horizontal de filtros, cards empilhados e painéis que deslizam/abrem em modal; desktop amplia o respiro sem abandonar a leitura mobile.
- **Assinaturas:** marca `LE.` em pill luminescente; pontos de status com halo; linhas finas e gradientes radiais que lembram coordenadas de mapa.
- **Interação:** resultados respondem imediatamente à busca e aos chips; ações primárias ficam sempre próximas ao polegar; feedback usa toast, mudança de estado e microanimações de 160–240 ms.
- **Animação:** entrada suave por subida de 8px; halos respiram lentamente; skeletons não serão necessários no catálogo local; respeitar `prefers-reduced-motion`.
- **Tipografia:** Manrope para toda a UI, com pesos 500/600/800; números e microstatus em `DM Mono` para sensação operacional.
- **Essência:** “encontre quem resolve, onde você está” — direto, confiável, conectado. Personalidade: local, viva, resolutiva.
- **Voz:** CTAs curtos e humanos, sem jargão corporativo. Exemplos: “Encontrar quem resolve” e “Chamar no WhatsApp”.
- **Wordmark:** `LE.` em caixa alta com ponto circular destacado, seguido de `FIND` em tracking amplo; o ponto funciona como marcador de mapa.
- **Cor proprietária:** `#C8FF35` (Lime Signal), usada como assinatura de disponibilidade e conversão.

## Estrutura do projeto

- `client/src/App.tsx`: shell, rotas e navegação.
- `client/src/pages/`: Home, Busca, Perfil, Comunidades, Lojas, Relatórios e Painel.
- `client/src/components/`: shell, cards, badges, modais e navegação.
- `client/src/lib/`: catálogo demo e helpers de UI.
- `server/routers.ts`: procedimentos tRPC públicos para catálogo e métricas.
- `server/db.ts` + `drizzle/schema.ts`: acesso e tabelas persistentes.
- `database/schema.sql`: schema portátil de referência.
- `client/public/`: manifest, service worker e rotas declaradas.
- `vercel.json`: rewrites e headers para Vercel.

## Limites conscientes do MVP

Os fluxos de autenticação, compra de banners, upload real de fotos e embeds autenticados de redes sociais ficam representados por interfaces e contratos de dados seguros; o MVP não inventa credenciais nem armazena vídeos. O backend inclui pontos de extensão para ligar esses fluxos a uma conta/banco real.

## Melhorias finais — responsividade e onboarding real

- Ampliar o container fluido para telas grandes sem perder leitura, aplicar breakpoints mobile/tablet/desktop e mover a navegação inferior para o cabeçalho em tablets e desktops.
- Reforçar acessibilidade com áreas de toque de pelo menos 48px, contraste, foco visível, labels em português e um onboarding direto para profissionais: nome, idade opcional, WhatsApp, profissão com autocomplete e cidade.
- Criar `serviceCategories` no banco e procedimentos públicos controlados para sugerir e criar automaticamente profissões novas; publicar o perfil localmente para o diretório sem listas engessadas.
- Completar metadados de favicon, toque iOS/Android e instalação PWA.
- Validar com checks TypeScript, build, testes automatizados e um fluxo E2E de usuário fictício de 65 anos: criar profissão inédita, publicar, encontrar na busca local e verificar o link WhatsApp.
