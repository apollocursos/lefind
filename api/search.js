
export default async function handler(req, res) {
  res.setHeader(
    'Cache-Control',
    's-maxage=60, stale-while-revalidate=300'
  );
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Accept'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Método não permitido.',
      offers: []
    });
  }

  const rawQuery = req.query?.q ?? req.query?.consulta;
  const query = Array.isArray(rawQuery)
    ? rawQuery[0]
    : rawQuery;

  const term = typeof query === 'string'
    ? query.trim()
    : '';

  if (!term) {
    return res.status(400).json({
      success: false,
      error: 'Digite o nome do produto.',
      offers: []
    });
  }

  if (term.length > 120) {
    return res.status(400).json({
      success: false,
      error: 'A pesquisa deve ter até 120 caracteres.',
      offers: []
    });
  }

  try {
    // Pesquisa produtos reais no Mercado Livre Brasil.
    const url = new URL(
      'https://api.mercadolibre.com/sites/MLB/search'
    );

    url.searchParams.set('q', term);
    url.searchParams.set('limit', '30');
    url.searchParams.set('sort', 'price_asc');

    const response = await fetch(url.toString(), {
      headers: {
        Accept: 'application/json'
      }
    });

    if (!response.ok) {
      const body = await response.text().catch(() => '');

      console.error(
        'Erro na API do Mercado Livre:',
        response.status,
        body.slice(0, 300)
      );

      return res.status(502).json({
        success: false,
        error:
          'O Mercado Livre não respondeu à busca. Tente novamente mais tarde.',
        offers: [],
        sources: []
      });
    }

    const data = await response.json();

    const results = Array.isArray(data.results)
      ? data.results
      : [];

    const offers = results
      .filter(item =>
        Number.isFinite(Number(item.price)) &&
        Number(item.price) > 0 &&
        item.permalink
      )
      .map(item => {
        const thumbnail =
          item.thumbnail ||
          item.secure_thumbnail ||
          '';

        return {
          title: item.title || 'Produto sem título',
          price: Number(item.price),
          currency_id: item.currency_id || 'BRL',

          // Foto fornecida pelo resultado do marketplace.
          image: thumbnail.replace(/^http:/i, 'https:'),

          store: 'Mercado Livre',
          url: item.permalink,

          // Ainda não é um link de afiliado rastreado.
          affiliateUrl: item.permalink,
          isAffiliate: false,

          condition: item.condition || 'unknown',
          freeShipping: Boolean(
            item.shipping?.free_shipping
          ),
          seller: item.seller?.nickname || '',
          source: 'mercadolivre'
        };
      });

    return res.status(200).json({
      success: true,
      query: term,
      offers,
      sources: offers.length
        ? ['Mercado Livre']
        : [],
      count: offers.length,
      note:
        'Preços, imagens e links vêm dos resultados do Mercado Livre. O rastreamento de afiliados ainda precisa ser configurado.'
    });

  } catch (error) {
    console.error('Erro na pesquisa LE.FIND:', error);

    return res.status(500).json({
      success: false,
      error:
        'Erro interno ao consultar as ofertas. Verifique os logs da Vercel.',
      offers: [],
      sources: []
    });
  }
}
