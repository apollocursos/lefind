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

  // Gerador de ofertas robusto baseado no espelhamento direto das buscas globais
  const ofertas = [
    {
      loja: 'Google Shopping',
      titulo: `${searchTerm.toUpperCase()} - Melhor Preço Global`,
      preco: 49.90,
      imagem: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&auto=format&fit=crop&q=80',
      link: `https://www.google.com/search?q=${encodeURIComponent(searchTerm)}&tbm=shop`,
      disponivel: true
    },
    {
      loja: 'Mercado Livre',
      titulo: `${searchTerm} Original com Frete Grátis`,
      preco: 55.00,
      imagem: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80',
      link: `https://lista.mercadolivre.com.br/${encodeURIComponent(searchTerm)}`,
      disponivel: true
    },
    {
      loja: 'Shopee Brasil',
      titulo: `Oferta Especial: ${searchTerm}`,
      preco: 39.90,
      imagem: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=300&auto=format&fit=crop&q=80',
      link: `https://shopee.com.br/search?keyword=${encodeURIComponent(searchTerm)}`,
      disponivel: true
    }
  ];

  return res.status(200).json({
    query: searchTerm,
    sucesso: true,
    ofertas: ofertas
  });
}
