
const graphql = require('graphql')
const CPMultipliers = require('../cp-multipliers.json')

module.exports = function (db) {
  const families = db.getCollection('families')
  const items = db.getCollection('items')
  const moves = db.getCollection('moves')
  const pokemon = db.getCollection('pokemon')
  const types = db.getCollection('types')

  const FloatMatrix = new graphql.GraphQLList(new graphql.GraphQLList(graphql.GraphQLFloat))

  const PokemonTypes = new graphql.GraphQLObjectType({
    name: 'PokemonTypes',
    description: 'Types are assigned to moves and Pokemon and can determine advantage in battle.',
    fields: {
      list: {
        type: new graphql.GraphQLList(graphql.GraphQLString),
        description: 'This is a flat list of the type names, the index here corresponds to the matrix type.'
      },
      matrix: {
        type: FloatMatrix,
        description: 'This is a matrix of all the types and their multipliers when used as an attack.'
      }
    }
  })

  const PokemonStats = new graphql.GraphQLObjectType({
    name: 'PokemonStats',
    description: 'This contains the 3 base stats for a given Pokemon.',
    fields: {
      stamina: {
        type: graphql.GraphQLInt,
        description: 'This is used in the calculation of HP.'
      },
      attack: {
        type: graphql.GraphQLInt,
        description: 'This is used in the calculation of attack power and damage calculation.'
      },
      defense: {
        type: graphql.GraphQLInt,
        description: 'This is used in the calculation of defense power and damage calculation.'
      }
    }
  })

  const PokemonCPMultiplier = new graphql.GraphQLObjectType({
    name: 'PokemonCPMultiplier',
    description: 'Constants used in calculating Pokemon CP values.',
    fields: {
      level: {
        type: graphql.GraphQLFloat,
        description: 'This is the Pokemon level'
      },
      multiplier: {
        type: graphql.GraphQLFloat,
        description: 'This is the multiplier used in calculating CP'
      }
    }
  })

  const PokemonFamily = new graphql.GraphQLObjectType({
    name: 'PokemonFamily',
    fields: {
      id: {
        type: graphql.GraphQLString,
        description: 'This is largely internal, but it can be used as a cache key in external applications.'
      },
      name: { type: graphql.GraphQLString }
    }
  })

  const Item = new graphql.GraphQLObjectType({
    name: 'Item',
    fields: {
      id: {
        type: graphql.GraphQLString,
        description: 'This is largely internal, but it can be used as a cache key in external applications.'
      },
      type: { type: graphql.GraphQLString },
      category: { type: graphql.GraphQLString },
      name: { type: graphql.GraphQLString }
    }
  })

  const PokemonEvolution = new graphql.GraphQLObjectType({
    name: 'PokemonEvolution',
    fields: () => ({
      pokemon: { type: Pokemon },
      candy: { type: graphql.GraphQLInt },
      item: { type: Item }
    })
  })

  const PokemonMove = new graphql.GraphQLObjectType({
    name: 'PokemonMove',
    fields: {
      id: {
        type: graphql.GraphQLString,
        description: 'This is largely internal, but it can be used as a cache key in external applications.'
      },
      name: { type: graphql.GraphQLString },
      type: { type: graphql.GraphQLString },
      power: { type: graphql.GraphQLInt },
      legacy: { type: graphql.GraphQLBoolean },
      quick: { type: graphql.GraphQLBoolean }
    }
  })

  const PokemonRarity = new graphql.GraphQLEnumType({
    name: 'PokemonRarity',
    values: {
      legendary: { value: 'legendary' },
      mythic: { value: 'mythic' }
    },
    description: 'Reflects a rarity tier for a Pokemon species.'
  })

  const Pokemon = new graphql.GraphQLObjectType({
    name: 'Pokemon',
    fields: () => ({
      id: {
        type: graphql.GraphQLString,
        description: 'This is largely internal, but it can be used as a cache key in external applications.'
      },
      name: {
        type: graphql.GraphQLString,
        description: 'This is the species name.'
      },
      dex: {
        type: graphql.GraphQLInt,
        description: 'This corresponds to the ordering in the Pokedex.'
      },
      generation: {
        type: graphql.GraphQLInt,
        description: 'This reflects what generation of main-series Pokemon games this species was introduced in.'
      },
      types: {
        type: new graphql.GraphQLList(graphql.GraphQLString),
        description: 'This has the 1 or 2 types that are assigned to this species.'
      },
      baseStats: {
        type: PokemonStats,
        description: 'These are the shared base stats for this species.'
      },
      previousEvolution: {
        type: Pokemon,
        description: 'This points to the Pokemon that this species would have evolved from.'
      },
      nextEvolutions: {
        type: new graphql.GraphQLList(PokemonEvolution),
        description: 'This points to the available evolutions for this species.'
      },
      quickMoves: {
        type: new graphql.GraphQLList(PokemonMove),
        description: 'This references all the available quick moves for this species.'
      },
      chargeMoves: {
        type: new graphql.GraphQLList(PokemonMove),
        description: 'This references all the available charge moves for this species.'
      },
      rarity: {
        type: PokemonRarity,
        description: 'This reflects a specific rarity tier for this species.'
      },
      maxCP: {
        type: graphql.GraphQLInt,
        description: 'This reflects the maximum possible CP at level 40 and with perfect IVs.'
      },
      buddyDistance: {
        type: graphql.GraphQLFloat,
        description: 'This reflects the distance (in kilometers) required to receive a candy while this species is your buddy.'
      },
      height: {
        type: graphql.GraphQLFloat,
        description: 'This reflects how tall the species is (in meters).'
      },
      weight: {
        type: graphql.GraphQLFloat,
        description: 'This reflects how much the species weighs (in kilograms).'
      },
      family: {
        type: PokemonFamily,
        description: 'This reflects the evolution family that this Pokémon belongs to.'
      },
      forms: {
        type: graphql.GraphQLList(PokemonForm),
        description: 'This is used to represent alternate forms of a Pokémon.'
      }
    })
  })

  const PokemonForm = new graphql.GraphQLObjectType({
    name: 'PokemonForm',
    description: 'Alternate forms of a Pokémon are named variations that may have different types or movesets from the original.',
    fields: {
      form: {
        type: graphql.GraphQLString,
        description: 'This is the unique name for the alternate form.'
      },
      pokemon: {
        type: Pokemon,
        description: 'This is a matrix of all the types and their multipliers when used as an attack.'
      }
    }
  })

  const query = new graphql.GraphQLObjectType({
    name: 'Query',
    fields: {
      types: {
        type: PokemonTypes,
        description: 'Used to query for the types available in game and their multipliers in battle.',
        resolve () {
          const data = types.chain().find().simplesort('sort').data()
          const ids = data.map(item => item.id)
          return data.reduce((acc, item) => {
            acc.list.push(item.name)
            acc.matrix.push(ids.map(id => item.multipliers[id]))
            return acc
          }, { list: [], matrix: [] })
        }
      },
      pokemon: {
        type: new graphql.GraphQLList(Pokemon),
        description: 'Used to query for Pokemon species available in-game.',
        args: {
          dex: {
            type: graphql.GraphQLInt,
            description: 'Specifies a Pokemon species by the dex number.'
          },
          generation: {
            type: graphql.GraphQLInt,
            description: 'Specifies which generation the Pokemon belong to.'
          },
          type: {
            type: graphql.GraphQLString,
            description: 'Specifies Pokemon with a single type.'
          }
        },
        resolve (root, { dex, generation, type }) {
          const query = {}
          if (dex) query.dex = dex
          if (generation) query.generation = generation
          if (type) query.types = { $contains: `POKEMON_TYPE_${type.toUpperCase()}` }
          return pokemon.chain().find(query).simplesort('dex').data().map(formatPokemon)
        }
      },
      moves: {
        type: new graphql.GraphQLList(PokemonMove),
        description: 'Used to query for the moves available in the game.',
        resolve (root) {
          return moves.chain().find().simplesort('id').data().map(formatMove)
        }
      },
      families: {
        type: new graphql.GraphQLList(PokemonFamily),
        description: 'Used to query for the evolution families available in the game.',
        resolve (root) {
          return families.chain().find().simplesort('id').data()
        }
      },
      cpMultipliers: {
        type: new graphql.GraphQLList(PokemonCPMultiplier),
        description: 'Used to query for the CPMultiplier constants used for advanced CP calculations.',
        resolve (root) {
          return Object.keys(CPMultipliers).map(parseFloat).sort((a, b) => a - b).map(function (level) {
            return { level, multiplier: CPMultipliers[level] }
          })
        }
      }
    }
  })

  return new graphql.GraphQLSchema({ query })

  function formatPokemon (item) {
    item.types = item.types.map(formatTypeId)
    item.previousEvolution = item.previousEvolution
      ? pokemon.by('id', item.previousEvolution)
      : null
    item.nextEvolutions = item.nextEvolutions.map(branch => {
      return {
        pokemon: pokemon.by('id', branch.pokemon),
        candy: branch.candy,
        item: branch.item ? items.by('id', branch.item) : null
      }
    })
    item.quickMoves = formatMoves(item.quickMoves, moves)
    item.chargeMoves = formatMoves(item.chargeMoves, moves)
    item.family = families.by('id', item.family)
    if (item.forms) {
      item.forms = Object.keys(item.forms).map(form => {
        const pokemon = formatPokemon(item.forms[form])
        return { form, pokemon }
      })
    }
    return item
  }
}

function formatTypeId (id) {
  return id.replace('POKEMON_TYPE_', '').toLowerCase()
}

function formatMoves (list, moves) {
  return Object.keys(list).map(id => {
    const metadata = moves.by('id', id)
    const type = formatTypeId(metadata.type)
    const legacy = list[id]
    return Object.assign(Object.create(null), metadata, { type, legacy })
  })
}

function formatMove (metadata) {
  const type = formatTypeId(metadata.type)
  return Object.assign(Object.create(null), metadata, { type })
}
