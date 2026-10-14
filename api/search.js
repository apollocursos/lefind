<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#0b0f19">
  <title>LE.FIND — O Google dos Marketplaces</title>
  <meta name="description" content="Pesquise produtos e compare ofertas de marketplaces em um só lugar.">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    :root{--bg:#0b0f19;--card:#111827;--border:#1f2937;--blue:#3b82f6;--green:#10b981;--yellow:#f59e0b;--purple:#8b5cf6;--text:#f9fafb;--muted:#9ca3af}
    *{box-sizing:border-box}
    body{margin:0;padding:20px;font-family:Segoe UI,Tahoma,sans-serif;background:var(--bg);color:var(--text)}
    header{display:flex;align-items:center;justify-content:space-between;gap:15px;flex-wrap:wrap;background:var(--card);border:1px solid var(--border);border-radius:12px;padding:15px 20px;margin-bottom:22px}
    .logo{font-size:1.35rem;font-weight:800;color:var(--blue);white-space:nowrap}.logo small{font-size:.65rem;background:var(--purple);color:#fff;padding:3px 6px;border-radius:4px;vertical-align:middle}
    .search{display:flex;gap:8px;flex:1;max-width:650px;min-width:min(100%,280px)}
    input,button{font:inherit}.search input{min-width:0;flex:1;padding:12px 14px;background:var(--bg);border:1px solid var(--border);border-radius:8px;color:var(--text);outline:none}
    .search input:focus{border-color:var(--blue)}button{cursor:pointer}.primary{background:var(--blue);border:0;border-radius:8px;color:#fff;padding:11px 18px;font-weight:700}
    .plain{background:var(--card);border:1px solid var(--border);color:var(--muted);border-radius:8px;padding:9px 12px}
    .features{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin-bottom:22px}
    .feature{background:var(--card);border:1px solid var(--border);padding:14px;border-radius:10px;font-size:.9rem}.feature strong{display:block;color:var(--blue);margin-bottom:5px}
    .toolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:16px}
    .filters{display:flex;gap:8px;flex-wrap:wrap}.filter{background:var(--card);border:1px solid var(--border);color:var(--muted);padding:8px 13px;border-radius:7px}.filter.active{background:var(--blue);border-color:var(--blue);color:white}
    #stats{color:var(--muted);font-size:.85rem}.results{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,260px),1fr));gap:16px}
    .offer{position:relative;display:flex;flex-direction:column;gap:10px;background:var(--card);border:1px solid var(--border);border-radius:12px;padding:14px;min-width:0}
    .offer.best{border-color:var(--green)}.badge{align-self:flex-start;background:var(--green);color:#04130d;border-radius:30px;padding:4px 9px;font-size:.72rem;font-weight:800}
    .product-image{height:210px;background:#fff;border-radius:8px;display:flex;align-items:center;justify-content:center;overflow:hidden}
    .product-image img{width:100%;height:100%;object-fit:contain;padding:8px}.no-image{color:#6b7280;text-align:center;padding:20px}
    .store{color:#93c5fd;font-size:.82rem;font-weight:700}.title{font-size:1rem;font-weight:700;line-height:1.35;overflow-wrap:anywhere}
    .price{font-size:1.45rem;font-weight:800;color:var(--green)}.details{font-size:.8rem;color:var(--muted);line-height:1.5}.actions{display:flex;gap:8px;margin-top:auto;padding-top:4px}
    .offer-link{display:block;text-align:center;text-decoration:none;background:var(--blue);color:#fff;font-weight:700;border-radius:8px;padding:11px;flex:1}
    .alert-btn{background:transparent;color:var(--yellow);border:1px solid var(--border);border-radius:8px;padding:0 12px}
    .state{grid-column:1/-1;text-align:center;color:var(--muted);padding:45px 15px;background:var(--card);border:1px solid var(--border);border-radius:12px}
    .disclaimer{color:#6b7280;font-size:.78rem;margin-top:22px;line-height:1.5}
    .modal{display:none;position:fixed;inset:0;background:#000b;z-index:10;align-items:center;justify-content:center;padding:18px}
    .modal-content{width:min(100%,420px);background:var(--card);border:1px solid var(--border);border-radius:12px;padding:22px;display:grid;gap:12px}
    .modal-content input{padding:11px;background:var(--bg);color:var(--text);border:1px solid var(--border);border-radius:7px}
    .modal-actions{display:flex;gap:8px}.modal-actions button{flex:1}
    @media(max-width:600px){body{padding:10px}.search{order:3;flex-basis:100%;max-width:none}.product-image{height:190px}.results{grid-template-columns:1fr}}
  </style>
</head>
<body>
  <header>
    <div class="logo"><i class="fa-solid fa-globe"></i> LE.FIND <small>BUSCADOR GLOBAL</small></div>
    <form class="search" id="searchForm">
      <input id="searchInput" type="search" placeholder="Digite um produto (ex.: Xbox Series S, air fryer...)" autocomplete="off" required>
      <button class="primary" type="submit"><i class="fa-solid fa-magnifying-glass"></i> Buscar</button>
    </form>
    <button class="plain" type="button" onclick="abrirMeusAlertas()"><i class="fa-regular fa-bell"></i> Alertas (<span id="alertCount">0</span>)</button>
  </header>

  <section class="features">
    <div class="feature"><strong><i class="fa-solid fa-images"></i> Fotos dos produtos</strong>Imagens recebidas das ofertas, quando fornecidas pela plataforma.</div>
    <div class="feature"><strong><i class="fa-solid fa-tags"></i> Comparação de preços</strong>Ofertas reais ordenadas pelo preço anunciado.</div>
    <div class="feature"><strong><i class="fa-solid fa-shield-halved"></i> Transparência</strong>Sem inventar preço quando uma fonte não responde.</div>
    <div class="feature"><strong><i class="fa-solid fa-link"></i> Links para as lojas</strong>Abra a oferta original para conferir detalhes e frete.</div>
  </section>

  <div class="toolbar">
    <div class="filters">
      <button class="filter active" data-filter="all" type="button">Todas as ofertas</button>
      <button class="filter" data-filter="new" type="button">Produtos novos</button>
      <button class="filter" data-filter="used" type="button">Usados</button>
    </div>
    <div id="stats">Digite um produto para começar.</div>
  </div>

  <main id="results" class="results">
    <div class="state"><i class="fa-solid fa-magnifying-glass" style="font-size:1.8rem;margin-bottom:12px"></i><br>Pesquise um produto para encontrar ofertas.</div>
  </main>
  <p class="disclaimer">Os preços e a disponibilidade podem mudar na loja. Confira o valor final, o frete, a condição do produto e a reputação do vendedor antes de comprar. Neste primeiro estágio, as ofertas reais são consultadas no Mercado Livre; outras plataformas serão adicionadas quando suas APIs e permissões de afiliado estiverem integradas. Um link de produto comum não garante comissão de afiliado.</p>

  <div class="modal" id="alertModal" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
    <div class="modal-content">
      <h3 id="modalTitle">🔔 Criar alerta de preço</h3>
      <p id="alertProduct" class="details"></p>
      <input id="targetPrice" type="number" min="0.01" step="0.01" placeholder="Preço-alvo em R$">
      <input id="alertContact" type="text" placeholder="WhatsApp com DDD (opcional)">
      <div class="modal-actions">
        <button class="primary" type="button" onclick="salvarAlerta()">Salvar neste navegador</button>
        <button class="plain" type="button" onclick="fecharModal()">Cancelar</button>
      </div>
      <p class="details">Aviso: por enquanto o alerta fica salvo neste navegador; não monitora preços 24/7 nem envia WhatsApp automaticamente.</p>
    </div>
  </div>

  <script>
    const resultsEl = document.getElementById('results');
    const statsEl = document.getElementById('stats');
    const searchInput = document.getElementById('searchInput');
    let offers = [];
    let activeFilter = 'all';
    let selectedProduct = null;

    const money = value => new Intl.NumberFormat('pt-BR', {style:'currency', currency:'BRL'}).format(Number(value) || 0);
    const safeText = value => String(value ?? '');
    function showState(message, icon='fa-circle-info') {
      resultsEl.innerHTML = '';
      const state = document.createElement('div');
      state.className = 'state';
      const i = document.createElement('i');
      i.className = `fa-solid ${icon}`;
      i.style.cssText = 'font-size:1.8rem;margin-bottom:12px';
      const p = document.createElement('div');
      p.textContent = message;
      state.append(i, document.createElement('br'), p);
      resultsEl.appendChild(state);
    }

    async function executarBuscaAPI() {
      const term = searchInput.value.trim();
      if (!term) { searchInput.focus(); return; }
      statsEl.textContent = 'Buscando ofertas reais...';
      showState('Consultando as ofertas disponíveis. Aguarde...', 'fa-spinner fa-spin');
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(term)}`, {headers:{'Accept':'application/json'}});
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || `Erro HTTP ${response.status}`);
        const incoming = Array.isArray(data.offers) ? data.offers : (Array.isArray(data.ofertas) ? data.ofertas : []);
        offers = incoming.map(normalizarOferta).filter(o => o.title && Number.isFinite(o.price) && o.price > 0);
        offers.sort((a,b) => a.price-b.price);
        statsEl.textContent = offers.length
          ? `${offers.length} ofertas encontradas • Fonte: ${data.sources?.join(', ') || data.fonte || 'marketplace'}`
          : 'Nenhuma oferta real encontrada para esta pesquisa.';
        renderizarCards();
        if (!offers.length) showState('Nenhuma oferta foi encontrada. Tente outro nome ou modelo.', 'fa-box-open');
      } catch (error) {
        console.error(error);
        statsEl.textContent = 'Não foi possível concluir a busca.';
        showState(error.message || 'Falha de conexão com a API. Tente novamente.', 'fa-triangle-exclamation');
      }
    }

    function normalizarOferta(o) {
      const price = Number(o.price ?? o.preco ?? o.minPrice);
      return {
        title: safeText(o.title ?? o.titulo ?? o.name ?? 'Produto'),
        price,
        image: safeText(o.image ?? o.imagem ?? o.thumbnail ?? ''),
        store: safeText(o.store ?? o.loja ?? 'Marketplace'),
        url: safeText(o.affiliateUrl ?? o.affiliate_url ?? o.link ?? o.permalink ?? '#'),
        condition: safeText(o.condition ?? o.condicao ?? 'unknown').toLowerCase(),
        freeShipping: Boolean(o.freeShipping ?? o.freteGratis ?? o.shipping?.free_shipping),
        seller: safeText(o.seller ?? o.vendedor ?? ''),
        currency: safeText(o.currency_id ?? 'BRL'),
        isAffiliate: Boolean(o.isAffiliate ?? o.linkAfiliado ?? false)
      };
    }

    function renderizarCards() {
      let filtered = offers;
      if (activeFilter === 'new') filtered = offers.filter(o => ['new','novo','newcondition'].includes(o.condition));
      if (activeFilter === 'used') filtered = offers.filter(o => ['used','usado'].includes(o.condition));
      resultsEl.innerHTML = '';
      filtered.forEach((item, index) => {
        const card = document.createElement('article');
        card.className = `offer ${index === 0 ? 'best' : ''}`;
        if (index === 0) {
          const badge = document.createElement('span');
          badge.className = 'badge';
          badge.textContent = 'MENOR PREÇO ENTRE OS RESULTADOS';
          card.appendChild(badge);
        }
        const imageBox = document.createElement('div');
        imageBox.className = 'product-image';
        if (item.image && /^https?:\/\//i.test(item.image)) {
          const img = document.createElement('img');
          img.src = item.image;
          img.alt = item.title;
          img.loading = 'lazy';
          img.referrerPolicy = 'no-referrer';
          img.onerror = () => { imageBox.innerHTML = '<div class="no-image"><i class="fa-regular fa-image"></i><br>Imagem indisponível na origem</div>'; };
          imageBox.appendChild(img);
        } else {
          imageBox.innerHTML = '<div class="no-image"><i class="fa-regular fa-image"></i><br>A loja não forneceu imagem</div>';
        }
        const store = document.createElement('div'); store.className='store'; store.textContent=item.store;
        const title = document.createElement('div'); title.className='title'; title.textContent=item.title;
        const price = document.createElement('div'); price.className='price'; price.textContent=money(item.price);
        const details = document.createElement('div'); details.className='details';
        const conditionLabel = item.condition === 'new' || item.condition === 'novo' ? 'Novo' : item.condition === 'used' || item.condition === 'usado' ? 'Usado' : 'Condição não informada';
        details.textContent = `${conditionLabel}${item.freeShipping ? ' • Frete grátis anunciado' : ''}${item.seller ? ' • Vendedor: '+item.seller : ''}`;
        const actions = document.createElement('div'); actions.className='actions';
        const link = document.createElement('a'); link.className='offer-link'; link.href=item.url; link.target='_blank'; link.rel='noopener noreferrer sponsored'; link.textContent='Ver oferta na loja';
        const alertBtn = document.createElement('button'); alertBtn.className='alert-btn'; alertBtn.type='button'; alertBtn.title='Criar alerta de preço'; alertBtn.innerHTML='<i class="fa-regular fa-bell"></i>';
        alertBtn.addEventListener('click', () => abrirAlertaModal(item));
        actions.append(link, alertBtn);
        card.append(imageBox,store,title,price,details,actions);
        resultsEl.appendChild(card);
      });
      if (filtered.length && activeFilter !== 'all') statsEl.textContent += ` • Filtro: ${activeFilter === 'new' ? 'novos' : 'usados'}`;
    }

    document.getElementById('searchForm').addEventListener('submit', e => {e.preventDefault(); executarBuscaAPI();});
    searchInput.addEventListener('keydown', e => { if (e.key === 'Enter') {e.preventDefault(); executarBuscaAPI();} });
    document.querySelectorAll('[data-filter]').forEach(btn => btn.addEventListener('click', () => {
      document.querySelectorAll('[data-filter]').forEach(b=>b.classList.toggle('active',b===btn));
      activeFilter = btn.dataset.filter;
      renderizarCards();
    }));

    function abrirAlertaModal(product) {
      selectedProduct = product;
      document.getElementById('alertProduct').textContent = `${product.title} — preço atual ${money(product.price)}`;
      document.getElementById('targetPrice').value = (product.price * .9).toFixed(2);
      document.getElementById('alertContact').value = '';
      document.getElementById('alertModal').style.display = 'flex';
    }
    function fecharModal(){document.getElementById('alertModal').style.display='none';}
    function salvarAlerta(){
      const target = Number(document.getElementById('targetPrice').value);
      if (!selectedProduct || !Number.isFinite(target) || target <= 0) {alert('Informe um preço-alvo válido.');return;}
      const alerts = JSON.parse(localStorage.getItem('lefind_alertas') || '[]');
      alerts.push({product:selectedProduct.title,target,contact:document.getElementById('alertContact').value.trim(),createdAt:new Date().toISOString()});
      localStorage.setItem('lefind_alertas',JSON.stringify(alerts));
      atualizarContadorAlertas(); fecharModal(); alert('Alerta salvo neste navegador. O monitoramento automático será implementado em uma etapa posterior.');
    }
    function atualizarContadorAlertas(){const a=JSON.parse(localStorage.getItem('lefind_alertas')||'[]');document.getElementById('alertCount').textContent=a.length;}
    function abrirMeusAlertas(){
      const a=JSON.parse(localStorage.getItem('lefind_alertas')||'[]');
      if(!a.length){alert('Você ainda não salvou alertas neste navegador.');return;}
      alert('Alertas salvos neste navegador:\n\n'+a.map((x,i)=>`${i+1}. ${x.product} — alvo ${money(x.target)}`).join('\n'));
    }
    window.addEventListener('load', () => {atualizarContadorAlertas();});
  </script>
</body>
</html>
