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
    const ofertas = [
      {
        loja: 'Google Shopping (Espelhado)',
        titulo: `${searchTerm} - Melhor Oferta Encontrada`,
        preco: 0.00,
        imagem: '',
        link: `https://www.google.com/search?q=${encodeURIComponent(searchTerm)}&tbm=shop`,
        disponivel: true
      }
    ];

    return res.status(200).json({
      query: searchTerm,
      sucesso: true,
      ofertas: ofertas
    });

  } catch (error) {
    console.error('Erro no espelhamento:', error);
    return res.status(500).json({ 
      sucesso: false, 
      error: 'Erro ao processar o espelhamento gratuito.' 
    });
  }
}
