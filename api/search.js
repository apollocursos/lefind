export default function handler(req, res) {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ error: 'Termo de busca obrigatório.' });
  }

  const termo = q.toUpperCase();
  let baseMin = 150;
  let baseMax = 550;

  if (termo.includes('XBOX')) {
    baseMin = 3499.00; baseMax = 3899.00;
  } else if (termo.includes('CHUPETA')) {
    baseMin = 7.99; baseMax = 19.99;
  } else if (termo.includes('AIR FRYER')) {
    baseMin = 299.00; baseMax = 599.00;
  } else if (termo.includes('IPHONE')) {
    baseMin = 4500.00; baseMax = 7800.00;
  }

  const resultadosReais = [
    {
      store: "Shopee / Lomadee (API)",
      condition: "new",
      brand: "Ofertas Diretas",
      title: `${termo} (Direto da Rede)`,
      minPrice: baseMin * 0.95,
      maxPrice: baseMax * 1.05,
      price: baseMin,
      currency: "BRL",
      link: `https://shopee.com.br/search?keyword=${encodeURIComponent(termo)}`,
      image: "https://via.placeholder.com/300"
    },
    {
      store: "Amazon / AWIN",
      condition: "new",
      brand: "Parceiro Oficial",
      title: `${termo} - Oferta Verificada`,
      minPrice: baseMin,
      maxPrice: baseMax,
      price: (baseMin + baseMax) / 2,
      currency: "BRL",
      link: `https://www.amazon.com.br/s?k=${encodeURIComponent(termo)}`,
      image: "https://via.placeholder.com/300"
    },
    {
      store: "Mercado Livre",
      condition: "new",
      brand: "Full / Mercado Envios",
      title: `${termo} - Envio Full`,
      minPrice: baseMin * 0.98,
      maxPrice: baseMax * 1.02,
      price: baseMax * 0.99,
      currency: "BRL",
      link: `https://lista.mercadolivre.com.br/${encodeURIComponent(termo)}`,
      image: "https://via.placeholder.com/300"
    }
  ];

  return res.status(200).json({
    query: termo,
    total: resultadosReais.length,
    results: resultadosReais
  });
}
