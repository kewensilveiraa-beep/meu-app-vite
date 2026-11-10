import { useEffect, useState } from 'react'
import './App.css'
import axios from 'axios'

const getEvolutionNames = (evolution) => [
  evolution.species.name,
  ...evolution.evolves_to.flatMap(getEvolutionNames),
]

const defaultPokemon = {
  name: 'Pichu',
  sprites: { front_default: '' },
  types: [{ type: { name: 'electric' } }],
}

const defaultMovie = {
  Title: 'Warcraft',
  Poster: 'https://upload.wikimedia.org/wikipedia/en/5/56/Warcraft_Teaser_Poster.jpg',
  Ratings: [{ Source: 'Rotten Tomatoes', Value: '29%' }],
  Plot: 'Uma história intensa de guerra, aventura e escolhas difíceis em um mundo cheio de conflito.',
  Genre: 'Ação, Fantasia',
  Year: '2016',
  Director: 'Duncan Jones',
  Actors: 'Travis Fimmel, Paula Patton',
}

const suggestedMovies = [
  {
    title: 'Pokemon',
    rating: '4.9',
    image: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=300&q=80',
    synopsis:
      'Uma jornada emocionante em que um grupo de treinadores enfrenta desafios, mistérios e aventuras em um mundo repleto de criaturas incríveis.',
  },
  {
    title: 'Mewtwo',
    rating: '4.0',
    image: 'https://images.unsplash.com/photo-1531259683007-016a7b628fc3?auto=format&fit=crop&w=300&q=80',
    synopsis:
      'Mewtwo busca entender seu próprio destino enquanto enfrenta a tensão entre poder, liberdade e a responsabilidade de ser mais do que uma criação.',
  },
  {
    title: 'Sinfonia',
    rating: '4.9',
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=300&q=80',
    synopsis:
      'Uma história cinematográfica rica em emoção, com cenas intensas, personagens marcantes e momentos que misturam arte, aventura e reflexão.',
  },
  {
    title: 'Sky',
    rating: '6.6',
    image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=300&q=80',
    synopsis:
      'Quando o horizonte se abre para o inesperado, personagens decisivos embarcam em uma viagem repleta de coragem, mistério e escolhas difíceis.',
  },
]

const pokemonStatLabels = {
  hp: 'Vida',
  attack: 'Ataque',
  defense: 'Defesa',
  'special-attack': 'Atq. especial',
  'special-defense': 'Def. especial',
  speed: 'Velocidade',
}

const pokemonTypeLabels = {
  electric: 'Elétrico',
  fire: 'Fogo',
  water: 'Água',
  grass: 'Planta',
  psychic: 'Psíquico',
  fighting: 'Lutador',
  flying: 'Voador',
  poison: 'Veneno',
  ground: 'Terra',
  rock: 'Pedra',
  bug: 'Inseto',
  ghost: 'Fantasma',
  steel: 'Aço',
  ice: 'Gelo',
  dragon: 'Dragão',
  dark: 'Sombrio',
  fairy: 'Fada',
  normal: 'Normal',
}

function App() {
  const [perfil, setPerfil] = useState({ nome: 'kewen', sobrenome: 'Silveira' })
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)
  const [DBZ, setDBZ] = useState({
    name: 'Gohan',
    image: '',
    race: 'Saiyan',
    transformations: [],
  })
  const [pokemon, setPokemon] = useState(defaultPokemon)
  const [filme, setFilme] = useState(defaultMovie)
  const [pokemonStages, setPokemonStages] = useState(['Pichu', 'Pikachu', 'Raichu'])
  const [pokemonStageIndex, setPokemonStageIndex] = useState(0)
  const [isLoadingPokemon, setIsLoadingPokemon] = useState(false)
  const [transformationIndex, setTransformationIndex] = useState(0)
  const [selectedMovie, setSelectedMovie] = useState(suggestedMovies[0].title)
  const [showMainMovieSynopsis, setShowMainMovieSynopsis] = useState(false)
  const [movieDetailsOpen, setMovieDetailsOpen] = useState(false)

  const [text, setText] = useState(() => {
    return localStorage.getItem('easy-input') || ''
  })

  const transformations = DBZ.transformations || []
  const currentDBZForm =
    transformationIndex === 0 ? DBZ : transformations[transformationIndex - 1]

  const selectPokemonStage = async (stageName, stageIndex) => {
    if (stageIndex === pokemonStageIndex || isLoadingPokemon) return

    setIsLoadingPokemon(true)
    try {
      const response = await axios.get(
        `https://pokeapi.co/api/v2/pokemon/${stageName}`
      )
      setPokemon(response.data)
      setPokemonStageIndex(stageIndex)
    } catch (error) {
      console.error('Não foi possível carregar o Pokémon:', error)
    } finally {
      setIsLoadingPokemon(false)
    }
  }

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await axios.get(
          'https://6a79e554674f43f4db11ebc8.mockapi.io/api/person/54'
        )
        setPerfil(response.data)

        const responseDBZ = await axios.get(
          'https://dragonball-api.com/api/characters/10'
        )
        setDBZ(responseDBZ.data)

        const responsePoke = await axios.get(
          'https://pokeapi.co/api/v2/pokemon/pichu'
        )
        setPokemon(responsePoke.data)

        const speciesResponse = await axios.get(responsePoke.data.species.url)
        const evolutionResponse = await axios.get(
          speciesResponse.data.evolution_chain.url
        )
        setPokemonStages(getEvolutionNames(evolutionResponse.data.chain))
        setPokemonStageIndex(0)

        try {
          const responseFilme = await axios.get('/api/movie')
          setFilme(responseFilme.data)
        } catch (movieError) {
          console.error('Não foi possível carregar o filme:', movieError)
          setFilme(defaultMovie)
        }

        setLoading(false)
      } catch (error) {
        console.log('Erro:', error)
        setLoading(false)
        setError(true)
      }
    }

    getData()
  }, [])

  useEffect(() => {
    localStorage.setItem('easy-input', text)
  }, [text])

  if (loading) {
    return <div className="loading-state">Loading...</div>
  }

  if (error) {
    return <div className="loading-state">Ocorreu um erro inesperado</div>
  }

  const movieRating = filme?.Ratings?.[1] || filme?.Ratings?.[0]
  const pokemonType = pokemon.types?.[0]?.type?.name || 'electric'
  const currentPokemonImage =
    pokemon?.sprites?.other?.home?.front_default ||
    pokemon?.sprites?.front_default ||
    'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/25.png'
  const currentDBZImage =
    currentDBZForm.image ||
    DBZ.image ||
    'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=300&q=80'
  const pokemonStats = pokemon.stats || []
  const pokemonPower = pokemonStats.find((stat) => stat.stat.name === 'attack')?.base_stat ?? '—'
  const currentDBZKi = currentDBZForm.ki || DBZ.ki || '—'
  const pokemonDisplayName = pokemon.name?.replace(/\b\w/g, (letter) => letter.toUpperCase()) || 'Pokémon'
  const dragonDisplayName = currentDBZForm.name || DBZ.name || 'Guerreiro Z'
  const selectedMovieData =
    suggestedMovies.find((movie) => movie.title === selectedMovie) || suggestedMovies[0]
  const translateGenre = (genre = '') =>
    genre
      .split(',')
      .map((part) => {
        const text = part.trim()
        const map = {
          Action: 'Ação',
          Adventure: 'Aventura',
          Fantasy: 'Fantasia',
          Drama: 'Drama',
          Thriller: 'Suspense',
          Comedy: 'Comédia',
          History: 'História',
          Horror: 'Terror',
          Animation: 'Animação',
          Family: 'Família',
          Sci: 'Sci',
          'Sci-Fi': 'Ficção Científica',
          War: 'Guerra',
          Mystery: 'Mistério',
          Romance: 'Romance',
          Biography: 'Biografia',
          Crime: 'Crime',
          'Film-Noir': 'Noir',
          Musical: 'Musical',
          Western: 'Faroeste',
          Sport: 'Esporte',
        }

        return map[text] || text
      })
      .join(', ')

  const translateRatingSource = (source = '') => {
    const map = {
      'Internet Movie Database': 'Internet Movie Database',
      'Rotten Tomatoes': 'Tomates Podres',
      Metacritic: 'Metacritic',
    }

    return map[source] || source
  }

  const getPortugueseMoviePlot = (title = '', plot = '') => {
    const normalizedTitle = (title || '').toLowerCase()

    if (normalizedTitle.includes('warcraft')) {
      return 'Em um mundo de conflito e magia, guerreiros e criaturas se enfrentam em uma batalha que decide o destino de reinos inteiros e dos que vivem entre eles.'
    }

    if (normalizedTitle.includes('pokemon')) {
      return 'Uma jornada emocionante em que treinadores exploram o mundo, enfrentam desafios e descobrem laços profundos com criaturas extraordinárias.'
    }

    if (normalizedTitle.includes('mewtwo')) {
      return 'Mewtwo busca entender seu próprio destino enquanto enfrenta poder, liberdade e a responsabilidade de ser mais do que uma criação.'
    }

    if (!plot) {
      return 'Sinopse não disponível.'
    }

    return plot
  }

  const movieSynopsis = getPortugueseMoviePlot(filme?.Title, filme?.Plot)
  const movieRatingsText = filme?.Ratings?.length
    ? filme.Ratings.map((rating) => `${translateRatingSource(rating.Source)}: ${rating.Value}`).join(' • ')
    : 'Avaliação não disponível'

  const translatedMovieDetail = {
    title: filme?.Title || 'Warcraft',
    year: filme?.Year || '—',
    genre: translateGenre(filme?.Genre || 'Ação, Drama'),
    director: filme?.Director || 'Diretor ainda não informado',
    ratings: movieRatingsText,
    plot: movieSynopsis || 'Sinopse não disponível.',
  }

  return (
    <div className="app-shell">
      <aside className="brand-panel">
        <div className="hero-cluster">
          <article className="trading-card pokemon-trading-card">
            <header className="trading-card-heading">
              <span>Pokémon</span>
              <strong>{pokemonDisplayName}</strong>
              <b>{pokemonTypeLabels[pokemonType] || pokemonType}</b>
            </header>
            <div className="trading-card-art pokemon-card-art">
              <img src={currentPokemonImage} alt={pokemonDisplayName} />
            </div>
            <div className="trading-card-caption">
              <span>Estágio {pokemonStageIndex + 1}</span>
              <strong>Força base</strong>
            </div>
            <div className="trading-card-stats">
              {pokemonStats.map((stat) => (
                <div className="trading-stat" key={stat.stat.name}>
                  <span>{pokemonStatLabels[stat.stat.name] || stat.stat.name}</span>
                  <strong>{stat.base_stat}</strong>
                </div>
              ))}
            </div>
          </article>

          <article className="trading-card dragon-trading-card">
            <header className="trading-card-heading">
              <span>Guerreiro Z</span>
              <strong>{dragonDisplayName}</strong>
              <b>KI</b>
            </header>
            <div className="trading-card-art dragon-card-art">
              <img src={currentDBZImage} alt={dragonDisplayName} />
            </div>
            <div className="trading-card-caption">
              <span>{DBZ.race || 'Saiyajin'}</span>
              <strong>Poder de combate</strong>
            </div>
            <div className="dragon-card-stats">
              <div className="dragon-stat">
                <span>KI atual</span>
                <strong>{currentDBZKi}</strong>
              </div>
              <div className="dragon-stat">
                <span>KI máximo</span>
                <strong>{DBZ.maxKi || '—'}</strong>
              </div>
            </div>
          </article>
        </div>

        <img
          className="brand-logo"
          src="/powerdex-logo.svg"
          alt="POWERDEX MOVIES"
        />
      </aside>

      <main className="dashboard-panel">
        <header className="topbar">
          <div className="user-pill">
            <div className="user-avatar-wrap">
              <img
                src={currentDBZImage}
                alt={currentDBZForm.name || 'User'}
              />
            </div>
            <span>{perfil.nome || 'kewen'} {perfil.sobrenome || 'Silveira'}</span>
            <button type="button" className="profile-button" aria-label="Perfil">
              ◌
            </button>
          </div>
        </header>

        <div className="search-box">
          <span className="search-icon">⌕</span>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Digite para buscar..."
          />
        </div>

        <section className="info-card">
          <h2>CARD 1: EVOLUÇÃO POKÉMON</h2>
          <div className="selected-character-summary">
            <strong>{pokemonDisplayName}</strong>
            <span>{pokemonTypeLabels[pokemonType] || pokemonType} · Ataque {pokemonPower}</span>
          </div>
          <div className="step-list pokemon-steps">
            {pokemonStages.map((stageName, index) => (
              <button
                key={stageName}
                type="button"
                className={`step-item ${pokemonStageIndex === index ? 'active' : ''}`}
                onClick={() => selectPokemonStage(stageName, index)}
                disabled={isLoadingPokemon}
              >
                <span className="step-name">{stageName}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="info-card">
          <h2>CARD 2: TRANSFORMAÇÃO Z</h2>
          <div className="selected-character-summary">
            <strong>{dragonDisplayName}</strong>
            <span>KI atual: {currentDBZKi} · KI máximo: {DBZ.maxKi || '—'}</span>
          </div>
          <div className="step-list transformation-steps">
            <button
              type="button"
              className={`step-item ${transformationIndex === 0 ? 'active' : ''}`}
              onClick={() => setTransformationIndex(0)}
            >
              <span className="step-name">Gohan</span>
            </button>
            {transformations.map((transformation, index) => (
              <button
                key={transformation.id}
                type="button"
                className={`step-item ${transformationIndex === index + 1 ? 'active' : ''}`}
                onClick={() => setTransformationIndex(index + 1)}
              >
                <span className="step-name">{transformation.name}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="info-card movie-card">
          <h2>CARD 3: CINEMA GEEK</h2>
          <button
            type="button"
            className="movie-box movie-box-button"
            onClick={() => {
              setShowMainMovieSynopsis((value) => !value)
              setMovieDetailsOpen((value) => !value)
            }}
          >
            <img
              src={filme.Poster && filme.Poster !== 'N/A' ? filme.Poster : defaultMovie.Poster}
              alt={filme.Title || 'Filme'}
            />
            <div className="movie-meta">
              <div className="stars">★ ★ ★ ★ ☆</div>
              <div className="movie-label">{filme.Title || 'Warcraft'}</div>
              <div className="movie-rating">
                {movieRating?.Source || 'Rotten Tomatoes'} {movieRating?.Value || '29%'}
              </div>
            </div>
          </button>

          {(showMainMovieSynopsis || movieDetailsOpen) && (
            <div className="movie-summary main-movie-summary">
              <div className="movie-detail-topline">
                <strong>{filme.Title || 'Warcraft'}</strong>
                <span>{filme.Year || '—'}</span>
              </div>
              <div className="movie-detail-meta">
                <span>{translatedMovieDetail.genre}</span>
                <span>{filme.Director || 'Diretor ainda não informado'}</span>
              </div>
              <p className="movie-detail-rating">{movieRatingsText}</p>
              <p>{movieSynopsis || 'Sinopse não disponível.'}</p>
            </div>
          )}
        </section>

        <section className="recommendations">
          <h3>FILMES SUGERIDOS</h3>
          <div className="recommendation-list">
            {suggestedMovies.map((movie) => (
              <button
                key={movie.title}
                type="button"
                className={`movie-tile ${selectedMovie === movie.title ? 'selected' : ''}`}
                onClick={() => setSelectedMovie(movie.title)}
              >
                <img src={movie.image} alt={movie.title} />
                <div className="movie-tile-info">
                  <span className="tile-name">{movie.title}</span>
                  <span className="tile-rating">★ {movie.rating}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="movie-summary">
            <div className="movie-summary-header">
              <img src={selectedMovieData.image} alt={selectedMovieData.title} />
              <div>
                <strong>{selectedMovieData.title}</strong>
                <span>★ {selectedMovieData.rating}</span>
              </div>
            </div>
            <p>{selectedMovieData.synopsis}</p>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App