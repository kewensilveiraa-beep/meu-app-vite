import process from 'node:process'

const MOVIE_IMDB_ID = 'tt0803096'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Método não permitido.' })
  }

  const apiKey = process.env.OMDB_API_KEY
  if (!apiKey) {
    console.error('OMDB_API_KEY não está configurada.')
    return res.status(503).json({ error: 'Serviço de filmes não configurado.' })
  }

  const url = new URL('https://www.omdbapi.com/')
  url.searchParams.set('i', MOVIE_IMDB_ID)
  url.searchParams.set('apikey', apiKey)

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(8000) })
    const movie = await response.json()

    if (!response.ok) {
      return res.status(502).json({ error: 'A API de filmes não respondeu corretamente.' })
    }

    if (movie.Response === 'False') {
      return res.status(404).json({ error: movie.Error || 'Filme não encontrado.' })
    }

    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400')
    return res.status(200).json(movie)
  } catch (error) {
    console.error('Falha ao consultar a API de filmes:', error)
    return res.status(502).json({ error: 'Não foi possível consultar os filmes agora.' })
  }
}
