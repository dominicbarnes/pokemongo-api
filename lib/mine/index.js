
const Case = require('case')
const POGOProtos = require('node-pogo-protos-vnext')

module.exports = function (data, done) {
  const grouped = group(data)

  return {
    types: types(grouped),
    items: items(grouped),
    moves: moves(grouped),
    pokemon: pokemon(grouped)
  }
}

function group (data) {
  return data.itemTemplates.reduce((acc, item) => {
    for (const key in item) {
      if (key === 'templateId') continue
      if (item.hasOwnProperty(key) && item[key]) {
        if (!(key in acc)) acc[key] = []
        acc[key].push(item[key])
      }
    }
    return acc
  }, Object.create(null))
}

function types (data) {
  const t = index(POGOProtos.Enums.PokemonType)
  return data.typeEffective.map(function (effective) {
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

function items (data) {
  return data.itemSettings.map(function (item) {
    const id = item.itemId
    const type = item.itemType
    const category = item.category
    const name = Case.title(id.replace('ITEM_', ''))
    // TODO: add "food" data
    return { id, type, category, name }
  })
}

function moves (data) {
  return data.moveSettings.map(function (move) {
    const id = move.movementId
    const name = Case.title(id)
    const type = move.pokemonType
    const power = move.power
    return { id, name, type, power }
  })
}

function pokemon (data) {
  return data.pokemonSettings.map(function (pokemon) {
    const id = pokemon.pokemonId
    const name = Case.title(id)
    const dex = POGOProtos.Enums.PokemonId[id]

    return {
      id: id,
      name: name,
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
      chargeMoves: pokemon.cinematicMoves
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
