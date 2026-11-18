import { useEffect, useRef, useState } from 'react'
import './App.css'
import axios from 'axios'
import MediaCard from './components/MediaCard.jsx'
import PokemonCard from './components/PokemonCard.jsx'

const MAX_POKEMON_ID = 1025

const getApiData = async (url) => {
  const response = await axios.get(url, { timeout: 10000 })
  return response.data
}

const getEvolutionPaths = (evolution, path = []) => {
  const currentPath = [...path, evolution.species.name]
  const nextEvolutions = evolution.evolves_to || []

  if (nextEvolutions.length === 0) {
    return [currentPath]
  }

  return nextEvolutions.flatMap((nextEvolution) =>
    getEvolutionPaths(nextEvolution, currentPath),
  )
}

const getPokemonWithEvolution = async (identifier) => {
  const pokemon = await getApiData(
    `https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(identifier)}`,
  )

  try {
    const species = await getApiData(pokemon.species.url)
    const evolutionChain = await getApiData(species.evolution_chain.url)

    return {
      pokemon,
      evolutionPaths: getEvolutionPaths(evolutionChain.chain),
      evolutionLoaded: true,
    }
  } catch (error) {
    console.error('Não foi possível carregar a cadeia evolutiva:', error)
    return {
      pokemon,
      evolutionPaths: [[pokemon.name]],
      evolutionLoaded: false,
    }
  }
}

const defaultPokemon = {
  name: 'Pichu',
  sprites: { front_default: '' },
  types: [{ type: { name: 'electric' } }],
}

const defaultMovie = {
  Title: 'Interstellar',
  Poster: 'N/A',
  Ratings: [{ Source: 'Internet Movie Database', Value: '8.7/10' }],
  Plot: 'Uma equipe de exploradores viaja além desta galáxia para descobrir se a humanidade pode sobreviver entre as estrelas.',
  Genre: 'Aventura, Drama, Ficção Científica',
  Year: '2014',
  Director: 'Christopher Nolan',
  Actors: 'Matthew McConaughey, Anne Hathaway',
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
  const [loading, setLoading] = useState(true)
  const [DBZ, setDBZ] = useState({
    name: 'Gohan',
    image: '',
    race: 'Saiyan',
    transformations: [],
  })
  const [pokemon, setPokemon] = useState(defaultPokemon)
  const [filme, setFilme] = useState(defaultMovie)
  const [pokemonEvolutionPaths, setPokemonEvolutionPaths] = useState([])
  const [isLoadingPokemon, setIsLoadingPokemon] = useState(false)
  const [pokemonFeedback, setPokemonFeedback] = useState({ status: 'idle', message: '' })
  const [isOnline, setIsOnline] = useState(
    () => typeof navigator === 'undefined' || navigator.onLine,
  )
  const [transformationIndex, setTransformationIndex] = useState(0)
  const [selectedMovie, setSelectedMovie] = useState(suggestedMovies[0].title)
  const [showMainMovieSynopsis, setShowMainMovieSynopsis] = useState(false)
  const [movieDetailsOpen, setMovieDetailsOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(
    () => localStorage.getItem('powerdex-theme') === 'dark',
  )
  const pokemonRequestInProgress = useRef(false)

  const [text, setText] = useState(() => {
    return localStorage.getItem('easy-input') || ''
  })

  const transformations = DBZ.transformations || []
  const currentDBZForm =
    transformationIndex === 0 ? DBZ : transformations[transformationIndex - 1]

  const requestPokemon = async (
    identifier,
    { refreshEvolution = false, randomEncounter = false } = {},
  ) => {
    if (pokemonRequestInProgress.current) return

    pokemonRequestInProgress.current = true
    setIsLoadingPokemon(true)
    setPokemonFeedback({ status: 'loading', message: 'Buscando Pokémon...' })

    try {
      const result = refreshEvolution
        ? await getPokemonWithEvolution(identifier)
        : {
            pokemon: await getApiData(
              `https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(identifier)}`,
            ),
          }

      setPokemon(result.pokemon)
      if (result.evolutionPaths) {
        setPokemonEvolutionPaths(result.evolutionPaths)
      }

      const name = (result.pokemon.name || 'Pokémon').replace(
        /\b\w/g,
        (letter) => letter.toUpperCase(),
      )
      const encounterText = randomEncounter
        ? `Encontro aleatório: ${name} (ID ${result.pokemon.id}).`
        : `${name} carregado.`
      const evolutionText =
        result.evolutionLoaded === false
          ? ' A cadeia evolutiva não pôde ser carregada.'
          : ''

      setPokemonFeedback({
        status: 'success',
        message: `${encounterText}${evolutionText}`,
      })
    } catch (error) {
      console.error('Não foi possível carregar o Pokémon:', error)
      setPokemonFeedback({
        status: 'error',
        message: 'Não foi possível carregar o Pokémon. Tente novamente.',
      })
    } finally {
      pokemonRequestInProgress.current = false
      setIsLoadingPokemon(false)
    }
  }

  const selectPokemonStage = (stageName) => requestPokemon(stageName)

  const findRandomEncounter = () => {
    const randomId = Math.floor(Math.random() * MAX_POKEMON_ID) + 1
    requestPokemon(randomId, { refreshEvolution: true, randomEncounter: true })
  }

  useEffect(() => {
    let active = true

    const loadInitialData = async () => {
      const [profileResult, dragonBallResult, pokemonResult, movieResult] =
        await Promise.allSettled([
          getApiData('https://6a79e554674f43f4db11ebc8.mockapi.io/api/person/54'),
          getApiData('https://dragonball-api.com/api/characters/10'),
          getPokemonWithEvolution('pichu'),
          getApiData('/api/movie'),
        ])

      if (!active) return

      if (profileResult.status === 'fulfilled') {
        setPerfil(profileResult.value)
      } else {
        console.error('Não foi possível carregar o perfil:', profileResult.reason)
      }

      if (dragonBallResult.status === 'fulfilled') {
        setDBZ(dragonBallResult.value)
      } else {
        console.error('Não foi possível carregar o personagem Dragon Ball:', dragonBallResult.reason)
      }

      if (pokemonResult.status === 'fulfilled') {
        setPokemon(pokemonResult.value.pokemon)
        setPokemonEvolutionPaths(pokemonResult.value.evolutionPaths)
      } else {
        console.error('Não foi possível carregar o Pokémon inicial:', pokemonResult.reason)
        setPokemonFeedback({
          status: 'error',
          message: 'Não foi possível carregar o Pokémon inicial. Use o encontro aleatório para tentar novamente.',
        })
      }

      if (movieResult.status === 'fulfilled') {
        setFilme(movieResult.value)
      } else {
        console.error('Não foi possível carregar o filme; usando dados de demonstração:', movieResult.reason)
      }

      setLoading(false)
    }

    loadInitialData()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('easy-input', text)
  }, [text])

  useEffect(() => {
    localStorage.setItem('powerdex-theme', isDarkMode ? 'dark' : 'light')
  }, [isDarkMode])

  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine)

    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  if (loading) {
    return <div className="loading-state">Loading...</div>
  }

  const movieRating = filme?.Ratings?.[1] || filme?.Ratings?.[0]
  const pokemonType = pokemon.types?.[0]?.type?.name || 'electric'
  const currentPokemonImage =
    pokemon?.sprites?.other?.['official-artwork']?.front_default ||
    pokemon?.sprites?.other?.home?.front_default ||
    pokemon?.sprites?.front_default ||
    ''
  const currentDBZImage =
    currentDBZForm.image ||
    DBZ.image ||
    'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=300&q=80'
  const pokemonStats = pokemon.stats || []
  const pokemonHP = pokemonStats.find((stat) => stat.stat.name === 'hp')?.base_stat ?? '—'
  const pokemonPower = pokemonStats.find((stat) => stat.stat.name === 'attack')?.base_stat ?? '—'
  const activePokemonSpecies = pokemon.species?.name || pokemon.name?.toLowerCase()
  const activeEvolutionPath =
    pokemonEvolutionPaths.find((path) => path.includes(activePokemonSpecies)) || []
  const pokemonStageIndex = Math.max(0, activeEvolutionPath.indexOf(activePokemonSpecies))
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
    title: filme?.Title || defaultMovie.Title,
    year: filme?.Year || '—',
    genre: translateGenre(filme?.Genre || 'Ação, Drama'),
    director: filme?.Director || 'Diretor ainda não informado',
    ratings: movieRatingsText,
    plot: movieSynopsis || 'Sinopse não disponível.',
  }

  return (
    <div className={`app-shell ${isDarkMode ? 'dark-mode' : ''}`}>
      <aside className="brand-panel">
        <div className="hero-cluster">
          <PokemonCard
            name={pokemonDisplayName}
            hp={pokemonHP}
            attack={pokemonPower}
            type={pokemonType}
            typeLabel={pokemonTypeLabels[pokemonType] || pokemonType}
            image={currentPokemonImage}
            stage={pokemonStageIndex + 1}
          />

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
            <button
              type="button"
              className="theme-toggle-button"
              onClick={() => setIsDarkMode((value) => !value)}
              aria-label={isDarkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}
              aria-pressed={isDarkMode}
              title={isDarkMode ? 'Modo claro' : 'Modo escuro'}
            >
              {isDarkMode ? '☀' : '☾'}
            </button>
            <button type="button" className="profile-button" aria-label="Perfil">
              ◌
            </button>
          </div>
        </header>

        {!isOnline && (
          <p className="offline-notice" role="status">
            Você está offline. O app usará dados salvos e informações de demonstração quando disponíveis.
          </p>
        )}

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
          <div className="pokemon-actions">
            <button
              type="button"
              className="encounter-button"
              onClick={findRandomEncounter}
              disabled={isLoadingPokemon}
            >
              {isLoadingPokemon ? 'Buscando...' : ' Pokémon aleatório'}
            </button>
            {pokemonFeedback.message && (
              <p
                className={`pokemon-feedback pokemon-feedback--${pokemonFeedback.status}`}
                role="status"
                aria-live="polite"
              >
                {pokemonFeedback.message}
              </p>
            )}
          </div>
          {pokemonEvolutionPaths.length > 0 ? (
            <div className="evolution-path-list">
              {pokemonEvolutionPaths.map((path, pathIndex) => (
                <div
                  className="evolution-path"
                  key={`${path[0]}-${pathIndex}`}
                  aria-label={`Caminho evolutivo ${pathIndex + 1}`}
                >
                  {path.map((stageName, stageIndex) => (
                    <div className="evolution-step" key={`${pathIndex}-${stageName}`}>
                      <button
                        type="button"
                        className={`step-item ${
                          activePokemonSpecies === stageName ? 'active' : ''
                        }`}
                        onClick={() => selectPokemonStage(stageName)}
                        disabled={isLoadingPokemon}
                        aria-current={
                          activePokemonSpecies === stageName ? 'step' : undefined
                        }
                      >
                        <span className="step-name">
                          {stageName.replace(/\b\w/g, (letter) => letter.toUpperCase())}
                        </span>
                      </button>
                      {stageIndex < path.length - 1 && (
                        <span className="evolution-arrow" aria-hidden="true">
                          →
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <p className="evolution-empty">A cadeia evolutiva ainda não está disponível.</p>
          )}
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
          <MediaCard
            title={filme.Title || defaultMovie.Title}
            mediaUrl={filme.Poster && filme.Poster !== 'N/A' ? filme.Poster : ''}
            tags={(filme.Genre || defaultMovie.Genre)
              .split(',')
              .map((genre) => genre.trim())
              .filter(Boolean)}
            metadata={[
              { label: 'Ano', value: filme.Year || defaultMovie.Year },
              {
                label: movieRating?.Source || 'Avaliação',
                value: movieRating?.Value || '—',
              },
            ]}
            className="media-card--movie"
            ariaLabel={`Mostrar detalhes de ${filme.Title || defaultMovie.Title}`}
            onClick={() => {
              setShowMainMovieSynopsis((value) => !value)
              setMovieDetailsOpen((value) => !value)
            }}
          />

          {(showMainMovieSynopsis || movieDetailsOpen) && (
            <div className="movie-summary main-movie-summary">
              <div className="movie-detail-topline">
                <strong>{filme.Title || defaultMovie.Title}</strong>
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