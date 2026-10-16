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

## 9. Pagamentos e controle ADM
- [x] Checkout server-side Stripe com Payment Methods dinâmicos para cartão e Pix, sem expor chave secreta no navegador.
- [x] Webhook `POST /api/stripe/webhook` recebe corpo bruto, valida `STRIPE_WEBHOOK_SECRET`, copia metadados para o PaymentIntent e processa eventos de sucesso, falha e reembolso.
- [x] Eventos são deduplicados por `paymentEvents.eventId`; pagamentos e entitlements ficam persistidos em `payments` e `entitlements`.
- [x] Pagamento aprovado com `product=gold` ativa `profiles.gold=1`; pagamento aprovado com `product=sponsored_spot` ativa os `sponsoredSpots` da loja.
- [x] Painel ADM em `/admin` usa `role=admin` e mantém apenas sobreposição manual: conceder cortesia (`grant`) ou revogar/cancelar (`revoke`), com motivo e administrador registrados.
- [x] Migração Drizzle `drizzle/0001_mighty_captain_britain.sql` aplicada no banco gerenciado; `.env.example` documenta as variáveis de deploy.

## Validação executada

- `pnpm check` — aprovado.
- `pnpm test` — 2 arquivos / 6 testes aprovados.
- `pnpm build` — aprovado; apenas avisos de chunk grande e script de configuração não-module.
- `GET /api/health`, `manifest.webmanifest`, `manus-routes.json` e as rotas dinâmicas — HTTP 200.
- Capturas mobile verificadas para Home, Busca, Perfil, Comunidades, Lojas, Relatórios, Painel, comunidade dinâmica e relatório público.


## 10. Responsividade ultra-flexível, onboarding e E2E
- [x] Layout Mobile-First fluido para celular, tablet, desktop e monitor ultrawide; container da Home aproveita telas grandes sem margens excessivas.
- [x] Bottom Nav permanece fixa em celulares; em tablets e desktops fica oculta e os mesmos links aparecem no Header superior.
- [x] PWA mantém instalação na tela inicial e recebe favicon, apple-touch-icon, metas de app e status bar para Android/iOS.
- [x] Cadastro de profissional usa fluxo simples em português: Nome → Foto/WhatsApp → Profissão e Cidade, com botões/áreas de toque de no mínimo 48px e alto contraste.
- [x] Profissão é um campo com busca/autocomplete; texto inédito, como “Montador de Pisos Vinílicos”, é aceito e criado automaticamente na tabela `serviceCategories` do banco.
- [x] Usuário consegue publicar o serviço criado, encontrá-lo na busca por profissão e abrir o botão WhatsApp a partir do cartão.
- [~] Fluxo automatizado simulou usuário fictício de 65 anos e validou criação, publicação, busca por profissão/região, WhatsApp, console sem erro observado, TypeScript, testes e build; o navegador recusou a permissão GPS, então a aplicação confirmou o fallback regional de localização.

## 11. Correções para lançamento oficial
- [x] Seletor PT/EN/ES troca o locale em tempo real, detecta o idioma do navegador, persiste a preferência e fornece formatação de moeda local.
- [x] Header deslogado não usa avatar genérico e apresenta Entrar e Cadastrar Profissional.
- [x] `/admin` usa o título Painel de Administração, carrega entitlements públicos com fallback operacional e mantém concessão/revogação manual.
- [x] Painel ADM inclui aba de Embaixadores/Influenciadores com código e contagem de profissionais indicados.
- [x] Cadastro de profissional e lojista aceita Código de Indicação / Embaixador; cadastros e pagamentos aprovados contabilizam o código no banco.
- [x] Profissões continuam sem lista fixa: autocomplete consulta o banco e novos nomes são criados automaticamente.
- [x] Margens desktop foram ampliadas para containers de até 1.880px; cache PWA foi invalidado para a versão v3.
- [x] `pnpm check`, `pnpm test`, `pnpm build`, migração Drizzle e validações HTTP executados com sucesso.

## 12. Correções finais de produção e usabilidade 65+
- [x] Visitante consegue entrar sem login, pesquisar um profissional e abrir o WhatsApp; `/painel` não exibe dados de prestador sem sessão Manus OAuth.
- [x] Cadastro prioriza Nome, WhatsApp, Profissão e Cidade; campos opcionais ficam recolhidos, com botões e inputs de pelo menos 48px, contraste alto e foco visível.
- [x] Foto de perfil usa enquadramento quadrado, centralizado e consistente em cards e cartão individual, sem avatar genérico no header deslogado.
- [x] `/admin` exige usuário autenticado com `role=admin`; entitlements e embaixadores usam procedimentos protegidos e continuam com fallback operacional apenas após a autorização correta.
- [x] PWA mantém manifest, service worker versionado, instalação móvel e script de configuração pública compatível com o build.
- [x] A experiência pública foi repetida três vezes em navegador, em viewport móvel, cobrindo busca, abertura de perfil e ação WhatsApp; a filtragem por query string foi corrigida durante o teste.

## 13. Última execução cirúrgica
- [x] Login usa Manus OAuth real com CTA “Entrar / Cadastrar-se”; o script público de configuração recebe fallback dos valores públicos necessários no bundle para funcionar também no deploy Vercel sem env Manus injetado.
- [x] Header deslogado mostra “Entrar / Cadastrar-se” e “Criar perfil”; header logado usa nome/iniciais ou `avatarUrl` real quando fornecido, sem avatar mockado, e dropdown com Meu Perfil / Minhas Profissões, Painel do Prestador, Painel Admin para `role=admin` e Sair.
- [x] Painel autenticado lista as profissões do usuário através de `directory.myProfiles`; o cadastro existente cria em `profiles` e a edição de profissão, WhatsApp, cidade e bairro usa `directory.updateProfile` com ownership por `userId`.
- [x] Visitantes continuam livres para buscar qualquer profissão e abrir o WhatsApp sem login.
- [x] Build final, TypeScript, testes e `git diff --check` executados antes do deploy.

## 14. Busca dinâmica e decisão de autenticação
- [x] Mantido Manus OAuth + MySQL/Drizzle conforme decisão do proprietário; não foi criada uma integração Supabase incompleta ou um botão Google que não criaria sessão válida no backend.
- [x] Busca consulta perfis persistidos dinamicamente por profissão, nome, bio, bairro e cidade usando expressão `LIKE` case-insensitive compatível com o MySQL gerenciado, além dos perfis demonstrativos e filtros SOS/verificados.
- [x] Busca sem resultados exibe dentro do app: “Ainda não temos um [Termo] cadastrado em Porto Feliz”, com ações “Solicitar no WhatsApp” e “Postar na Comunidade Local”.
- [x] `pnpm check`, `pnpm test`, `pnpm build` e `git diff --check` aprovados para este release.

## 15. Login Manus e release final
- [x] A decisão de manter Manus OAuth + MySQL foi aplicada; não há chamada Supabase no fluxo de login.
- [x] `publicPlatformConfig` usa o ambiente Manus quando disponível e os identificadores públicos gerados do projeto como fallback para a Vercel; nenhum segredo privado é enviado ao navegador.
- [x] Busca livre por termos novos permanece ligada ao procedimento público MySQL/Drizzle e o fallback WhatsApp continua dentro da interface.
