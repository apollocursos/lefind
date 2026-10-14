# Entregáveis LE.FIND — status do MVP

> `[x]` entregue no preview; `[~]` interface/contrato entregue, mas depende de credenciais, banco ou integração externa para produção.

## 1. Diretório global de buscas
- [x] A aplicação oferece barra de busca por profissão, produto, bairro ou cidade.
- [x] Oferece filtros rápidos SOS 24h / Plantão, Verificados, Melhores Avaliados e Perto de mim. O filtro local usa a região ativa e distância estimada; integração com GPS do navegador fica como próximo passo.
- [x] Exibe cards com foto, distância estimada, estrelas e status de disponibilidade: Agenda Aberta, Apenas Próxima Semana ou Agenda Lotada.

## 2. Cartão digital de profissional
- [x] Cada profissional possui link interno `/profissional/:slug` e link público `/br/:cidade/:slug` para divulgação.
- [x] O perfil exibe capa, avatar, bio, selo de verificação, cidade e bairro.
- [x] O perfil tem botão grande e FAB de WhatsApp com número específico por profissional e mensagem pré-preenchida.
- [x] O perfil exibe avaliações com estrelas e depoimentos associados ao slug do profissional.
- [x] Slugs inválidos exibem estado de perfil não encontrado, sem atribuir o cartão de outra pessoa.

## 3. Hub de mídias sociais
- [~] Os perfis demonstram links para Instagram, TikTok, Kwai, YouTube, Pinterest e Threads/X conforme o profissional. Cadastro/edição e URLs específicas de cada conta precisam ser conectados ao painel.
- [~] A galeria Antes & Depois está pronta no perfil; embeds autenticados Feed/Reels devem usar os SDKs/CDNs oficiais quando as contas forem conectadas, sem hospedar vídeo no LE.FIND.

## 4. Comunidades e condomínios
- [x] Há grupos públicos e privados com página dinâmica `/comunidade/:slug`.
- [x] O painel demonstrativo do administrador permite aprovar/remover prestadores na lista recomendada.
- [x] A página oferece compartilhamento rápido da lista no WhatsApp.
- [~] Persistência de convites/moderação depende de autenticação e de ligar a UI às tabelas `communities` e `communityMembers`.

## 5. Lojistas e anúncios
- [x] Lojas locais têm vitrines de produtos, categoria, cidade, distância e badge de destaque.
- [~] A interface de anunciante e a tabela `sponsoredSpots` estão preparadas; compra, cobrança e segmentação por bairro/cidade/estado/país precisam de Payments e dados reais.

## 6. SOS 24h
- [x] Profissional pode alternar Disponível Agora no painel; o estado é persistido no navegador e refletido nos cards, busca e cartão público.
- [~] O procedimento tRPC `directory.setSos` está preparado para gravar no perfil quando a sessão autenticada e o banco forem ligados ao painel.

## 7. Relatório Antes e Depois
- [x] Há criação demonstrativa com título, resumo e seleção múltipla de fotos no formulário.
- [x] O relatório possui rota pública `/relatorios/:slug`, visual Antes/Depois, checklist, link compartilhável e CTA para WhatsApp.
- [x] A entrega usa a chamada: “Gostou do serviço? Deixe sua avaliação de 5 estrelas no meu perfil LE.FIND”.
- [~] Upload e persistência real precisam de Storage; o preview não inventa credenciais nem publica arquivos fora do projeto.

## 8. Plataforma e arquitetura
- [x] Frontend mobile-first com Dark Mode / Glassmorphism Tech.
- [x] PWA com manifest, ícones, service worker com fallback de navegação e navegação inferior em mobile.
- [x] Backend Node.js/Express com função serverless em `api/index.ts`, tRPC, health check e mutation de cotações/SOS com fallback seguro.
- [x] Banco MySQL gerenciado representado por schema Drizzle e SQL portátil alinhado (`database/schema.sql`); README esclarece que Supabase/Firebase exigem adaptação de dialeto.
- [~] Seletor PT/EN/ES e persistência de locale estão estruturados; a tradução integral de todos os textos e moedas locais é a próxima camada de conteúdo.
- [x] `vercel.json` com build estático, função Node para `/api/*`, rewrites de deep links e headers PWA.
- [x] Instruções diretas para GitHub, Vercel, variáveis de ambiente, banco e comandos de validação em `README.md`.

## Validação executada

- `pnpm check` — aprovado.
- `pnpm test` — 2 arquivos / 6 testes aprovados.
- `pnpm build` — aprovado; apenas avisos de chunk grande e script de configuração não-module.
- `GET /api/health`, `manifest.webmanifest`, `manus-routes.json` e as rotas dinâmicas — HTTP 200.
- Capturas mobile verificadas para Home, Busca, Perfil, Comunidades, Lojas, Relatórios, Painel, comunidade dinâmica e relatório público.
