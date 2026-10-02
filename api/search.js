export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const query = req.query.q || req.query.consulta;

  if (!query || query.trim() === '') {
    return res.status(400).json({ error: 'Termo de busca obrigatório.' });
  }

  const searchTerm = query.trim();

  try {
    // Chamada real à API pública do Mercado Livre para dados reais (título, preço, imagem e link)
    const mlUrl = `https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(searchTerm)}&limit=4`;
    const response = await fetch(mlUrl);
    const data = await response.json();

    let ofertas = [];

    if (data && data.results && data.results.length > 0) {
      ofertas = data.results.map(item => ({
        loja: 'Mercado Livre (API Real)',
        titulo: item.title,
        preco: item.price,
        imagem: item.thumbnail ? item.thumbnail.replace('http://', 'https://').replace('-I.jpg', '-O.jpg') : '',
        link: item.permalink,
        disponivel: true
      }));
    } else {
      // Caso não retorne resultados específicos, devolvemos estrutura limpa sem inventar dados matemáticos
      ofertas = [{
        loja: 'Mercado Livre',
        titulo: `${searchTerm} - Nenhum produto encontrado diretamente`,
        preco: 0.00,
        imagem: '',
        link: '#',
        disponivel: false
      }];
    }

    return res.status(200).json({
      query: searchTerm,
      sucesso: true,
      ofertas: ofertas
    });

  } catch (error) {
    console.error('Erro na API:', error);
    return res.status(500).json({ 
      error: 'Falha ao buscar dados nas APIs.',
      detalhes: error.message 
    });
  }
}
