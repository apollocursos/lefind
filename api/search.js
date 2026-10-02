export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const query = req.query.q || req.query.consulta;

  if (!query || query.trim() === '') {
    return res.status(400).json({ sucesso: false, error: 'Termo obrigatório.' });
  }

  const searchTerm = query.trim();

  try {
    // Espelhamento direto da busca pública do Google (Gratuito, sem chaves ou tokens)
    const targetUrl = `https://www.google.com/search?q=${encodeURIComponent(searchTerm)}&tbm=shop`;
    
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    });

    const html = await response.text();
    let ofertas = [];

    // Extração inteligente baseada nos padrões de blocos públicos do Google Shopping
    // Captura blocos de produtos espelhados em tempo real
    const matches = [...html.matchAll(/<div[^>]*class="[^"]*sh-dgr[^"]*"[^>]*>([\s\S]*?)<\/div>/g)];

    // Se a estrutura exata de blocos variar, fazemos o parsing limpo dos títulos e preços detetados
    if (matches.length > 0) {
      matches.slice(0, 12).forEach((match, index) => {
        const bloco = match[1];
        
        // Extrai título aproximado
        const titleMatch = bloco.match(/h3[^>]*>([^<]+)<\/h3>/) || bloco.match(/class="[^"]*tIxPaf[^"]*"[^>]*>([^<]+)</);
        // Extrai preço aproximado
        const priceMatch = bloco.match(/class="[^"]*a8Pemb[^"]*"[^>]*>([^<]+)</) || bloco.match(/R\$\s[\d.,]+/);
        // Extrai link
        const linkMatch = bloco.match(/href="(\/url\?q=[^"]+)"/);

        if (titleMatch) {
          let linkFinal = `https://www.google.com/search?q=${encodeURIComponent(searchTerm)}&tbm=shop`;
          if (linkMatch) {
            const decoded = decodeURIComponent(linkMatch[1].replace('/url?q=', '').split('&')[0]);
            if (decoded.startsWith('http')) linkFinal = decoded;
          }

          ofertas.push({
            loja: 'Google Shopping (Espelhado)',
            titulo: titleMatch[1].trim(),
            preco: priceMatch ? priceMatch[0].trim() : 'Consulte',
            imagem: '', // Espelhamento textual e de links diretos
            link: linkFinal,
            disponivel: true
          });
        }
      });
    }

    // Fallback garantido para o utilizador nunca ficar sem o espelhamento interativo exato do termo
    if (ofertas.length === 0) {
      ofertas.push({
        loja: 'Google Shopping (Espelhamento Global)',
        titulo: `Resultado Global para: ${searchTerm}`,
        preco: 'Ver no Google',
        imagem: '',
        link: `https://www.google.com/search?q=${encodeURIComponent(searchTerm)}&tbm=shop`,
        disponivel: true
      });
    }

    return res.status(200).json({
      query: searchTerm,
      sucesso: true,
      ofertas: ofertas
    });

  } catch (error) {
    console.error('Erro no espelhamento:', error);
    return res.status(500).json({ 
      sucesso: false, 
      error: 'Erro ao processar o espelhamento.' 
    });
  }
}
