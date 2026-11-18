import MediaCard from './MediaCard.jsx'

function PokemonCard({ name, hp, attack, type, typeLabel, image, stage }) {
  const pokemonType = type.toLowerCase().replace(/[^a-z0-9-]/g, '')

  return (
    <MediaCard
      title={name}
      mediaUrl={image}
      tags={[typeLabel, `Estágio ${stage}`]}
      metadata={[
        { label: 'Vida', value: hp },
        { label: 'Ataque', value: attack },
      ]}
      className={`media-card--pokemon pokemon-type-${pokemonType}`}
    />
  )
}

export default PokemonCard
