import { useEffect, useState } from 'react'
import './App.css'
import axios from 'axios'

const getEvolutionNames = (evolution) => [
  evolution.species.name,
  ...evolution.evolves_to.flatMap(getEvolutionNames),
]

function App() {
  const API_KEY = '65710bf0 '

  const [perfil, setPerfil] = useState({})
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)
  const [DBZ, setDBZ] = useState({})
  const [pokemon, setPokemon] = useState({})
  const [filme, setFilme] = useState({})
  const [pokemonStages, setPokemonStages] = useState([])
  const [pokemonStageIndex, setPokemonStageIndex] = useState(0)
  const [isLoadingPokemon, setIsLoadingPokemon] = useState(false)
  const [transformationIndex, setTransformationIndex] = useState(0)

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
        // API do perfil
        const response = await axios.get(
          'https://6a79e554674f43f4db11ebc8.mockapi.io/api/person/54'
        )
        setPerfil(response.data)

        // API Dragon Ball
        const responseDBZ = await axios.get(
          'https://dragonball-api.com/api/characters/10'
        )
        setDBZ(responseDBZ.data)

        // API Pokémon
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

        // API OMDb - Filme
        const responseFilme = await axios.get(
          `https://www.omdbapi.com/?i=tt0803096&apikey=${API_KEY}`
        )
        setFilme(responseFilme.data)

        setLoading(false)
      } catch (error) {
        console.log('Erro:', error)
        setLoading(false)
        setError(true)
      }
    }

    getData()
  }, [])

  // Salva o texto no localStorage
  useEffect(() => {
    localStorage.setItem('easy-input', text)
  }, [text])

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Ocorreu um erro inesperado</div>
  }

  return (
    <>
      <section id="center">
        <div className="hero">
          <img
            src={currentDBZForm.image}
            className="base"
            width="170"
            height="179"
            alt={currentDBZForm.name}
          />
        </div>

        <div>
          <h1>{perfil.nome} {perfil.sobrenome}</h1>
        </div>

        <div className="card">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Digite algo para salvar..."
          />
        </div>
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <h2>Personagem Dragon Ball</h2>

          <p>{currentDBZForm.name}</p>

          <img
            src={currentDBZForm.image}
            width="170"
            alt={currentDBZForm.name}
          />

          <p>Raça: {DBZ.race}</p>

          <div className="evolution-options" role="group" aria-label="Transformações de Gohan">
            <button
              className="evolution-button"
              type="button"
              onClick={() => setTransformationIndex(0)}
              aria-pressed={transformationIndex === 0}
            >
              Gohan
            </button>
            {transformations.map((transformation, index) => (
              <button
                className="evolution-button"
                type="button"
                key={transformation.id}
                onClick={() => setTransformationIndex(index + 1)}
                aria-pressed={transformationIndex === index + 1}
              >
                {transformation.name}
              </button>
            ))}
          </div>
        </div>

        <div id="social">
          <h2>Meu pet</h2>

          <p>{pokemon.name}</p>

          <img
            src={pokemon.sprites.front_default}
            alt={pokemon.name}
          />

          <p>{pokemon.types[0].type.name}</p>

          <div className="evolution-options" role="group" aria-label="Evoluções do Pokémon">
            {pokemonStages.map((stageName, index) => (
              <button
                className="evolution-button"
                type="button"
                key={stageName}
                onClick={() => selectPokemonStage(stageName, index)}
                aria-pressed={pokemonStageIndex === index}
                disabled={isLoadingPokemon}
              >
                {stageName}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="ticks"></div>

      <section id="filme">
        <h2>Filme que não gostei</h2>

        <p>{filme.Title}</p>

        <img
          src={filme.Poster}
          width="170"
          alt={filme.Title}
        />

        {filme.Ratings && filme.Ratings.length > 1 && (
          <>
            <p>{filme.Ratings[1].Source}</p>
            <p>{filme.Ratings[1].Value}</p>
          </>
        )}
      </section>
    </>
  )
}

export default App