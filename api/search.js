export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const query = req.query.q || req.query.consulta;

  if (!query || query.trim() === '') {
    return res.status(400).json({ sucesso: false, error: 'Termo de busca obrigatório.' });
  }

  const searchTerm = query.trim();

  try {
    const mlUrl = `https://api.mercadolibre.com/sites/MLB/search?q=${encodeURIComponent(searchTerm)}&limit=8`;
    const response = await fetch(mlUrl);
    const data = await response.json();

    let ofertas = [];

    if (data && data.results && data.results.length > 0) {
      ofertas = data.results.map(item => ({
        loja: 'Mercado Livre',
        titulo: item.title,
        preco: item.price,
        imagem: item.thumbnail ? item.thumbnail.replace('http://', 'https://').replace('-I.jpg', '-O.jpg') : '',
        link: item.permalink,
        disponivel: true
      }));
    }

    return res.status(200).json({
      query: searchTerm,
      sucesso: true,
      ofertas: ofertas
    });

  } catch (error) {
    console.error('Erro na API:', error);
    return res.status(500).json({ 
      sucesso: false,
      error: 'Falha ao buscar dados nas APIs.',
      detalhes: error.message 
    });
  }
}
