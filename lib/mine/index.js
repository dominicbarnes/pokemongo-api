
const Case = require('case')
const POGOProtos = require('node-pogo-protos-vnext')

module.exports = function (data, done) {
  const items = group(data)

  return {
    types: types(items),
    pokemon: pokemon(items)
  }
}

function group (data) {
  return data.itemTemplates.reduce((acc, item) => {
    for (const key in item) {
      if (item.hasOwnProperty(key) && item[key]) {
        if (!(key in acc)) acc[key] = []
        acc[key].push(item[key])
      }
    }
    return acc
  }, Object.create(null))
}

function types (items) {
  const t = index(POGOProtos.Enums.PokemonType)
  return items.typeEffective.map(function (effective) {
    const id = effective.attackType
    const name = id.replace('POKEMON_TYPE_', '').toLowerCase()
    const sort = POGOProtos.Enums.PokemonType[id]
    const multipliers = effective.attackScalar.reduce((acc, multiplier, id) => {
      acc[t[id + 1]] = multiplier
      return acc
    }, Object.create(null))

    return { id, name, sort, multipliers }
  })
}

function pokemon (items) {
  return items.pokemonSettings.map(function (pokemon) {
    const id = pokemon.pokemonId
    const name = Case.title(id)
    const dex = POGOProtos.Enums.PokemonId[id]

    return {
      id: id,
      name: name,
      dex: dex,
      generation: generation(dex),
      types: [ pokemon.type, pokemon.type2 ].filter(Boolean),
      base: {
        stamina: pokemon.stats.baseStamina,
        attack: pokemon.stats.baseAttack,
        defense: pokemon.stats.baseDefense
      },
      previous: pokemon.parentPokemonId,
      next: (pokemon.evolutionBranch || []).map(branch => {
        return {
          pokemon: branch.evolution,
          candy: branch.candyCost,
          item: branch.evolutionItemRequirement
        }
      }),
      moves: {
        quick: pokemon.quickMoves,
        charge: pokemon.cinematicMoves
      }
    }
  })
}

function index (input) {
  const output = Object.create(null)
  for (let [ key, value ] of Object.entries(input)) {
    output[value] = key
  }
  return output
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
