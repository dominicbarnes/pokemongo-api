
const Case = require('case')
const POGOProtos = require('node-pogo-protos-vnext')

module.exports = function (data) {
  return data.pokemonSettings.map(function (pokemon) {
    const id = pokemon.pokemonId
    const dex = POGOProtos.Enums.PokemonId[id]

    return {
      id: id,
      name: name(pokemon),
      dex: dex,
      generation: generation(dex),
      types: [ pokemon.type, pokemon.type2 ].filter(Boolean),
      baseStats: {
        stamina: pokemon.stats.baseStamina,
        attack: pokemon.stats.baseAttack,
        defense: pokemon.stats.baseDefense
      },
      previousEvolution: pokemon.parentPokemonId,
      nextEvolutions: (pokemon.evolutionBranch || []).map(branch => {
        return {
          pokemon: branch.evolution,
          candy: branch.candyCost,
          item: branch.evolutionItemRequirement
        }
      }),
      quickMoves: pokemon.quickMoves,
      chargeMoves: pokemon.cinematicMoves,
      rarity: rarity(pokemon)
    }
  })
}

function generation (dex) {
  switch (true) {
    case dex <= 151: return 1
    case dex <= 251: return 2
    case dex <= 386: return 3
    case dex <= 493: return 4
    case dex <= 649: return 5
    case dex <= 721: return 6
    case dex <= 802: return 7
    default: return -1
  }
}

function name (pokemon) {
  return Case.title(pokemon.pokemonId)
    .replace('Female', '♀')
    .replace('Male', '♂')
}

function rarity (pokemon) {
  if (!pokemon.rarity) return null
  return pokemon.rarity.replace('POKEMON_RARITY_', '').toLowerCase()
}
