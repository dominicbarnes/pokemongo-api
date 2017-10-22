
const graphql = require('graphql')

module.exports = function (db) {
  const items = db.getCollection('items')
  const moves = db.getCollection('moves')
  const pokemon = db.getCollection('pokemon')
  const types = db.getCollection('types')

  const FloatMatrix = new graphql.GraphQLList(new graphql.GraphQLList(graphql.GraphQLFloat))

  const PokemonTypes = new graphql.GraphQLObjectType({
    name: 'PokemonTypes',
    fields: {
      list: { type: new graphql.GraphQLList(graphql.GraphQLString) },
      matrix: { type: FloatMatrix }
    }
  })

  const PokemonStats = new graphql.GraphQLObjectType({
    name: 'PokemonStats',
    fields: {
      stamina: { type: graphql.GraphQLInt },
      attack: { type: graphql.GraphQLInt },
      defense: { type: graphql.GraphQLInt }
    }
  })

  const Item = new graphql.GraphQLObjectType({
    name: 'Item',
    fields: {
      id: { type: graphql.GraphQLString },
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
      id: { type: graphql.GraphQLString },
      name: { type: graphql.GraphQLString },
      type: { type: graphql.GraphQLString },
      power: { type: graphql.GraphQLInt }
    }
  })

  const Pokemon = new graphql.GraphQLObjectType({
    name: 'Pokemon',
    fields: () => ({
      id: { type: graphql.GraphQLString },
      name: { type: graphql.GraphQLString },
      dex: { type: graphql.GraphQLInt },
      generation: { type: graphql.GraphQLInt },
      types: { type: new graphql.GraphQLList(graphql.GraphQLString) },
      baseStats: { type: PokemonStats },
      previousEvolution: { type: Pokemon },
      nextEvolutions: { type: new graphql.GraphQLList(PokemonEvolution) },
      quickMoves: { type: new graphql.GraphQLList(PokemonMove) },
      chargeMoves: { type: new graphql.GraphQLList(PokemonMove) },
      rarity: { type: graphql.GraphQLString }
    })
  })

  const query = new graphql.GraphQLObjectType({
    name: 'Query',
    fields: {
      types: {
        type: PokemonTypes,
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
        args: {
          dex: { type: graphql.GraphQLInt },
          generation: { type: graphql.GraphQLInt },
          type: { type: graphql.GraphQLString }
        },
        resolve (root, { dex, generation, type }) {
          const query = {}
          if (dex) query.dex = dex
          if (generation) query.generation = generation
          if (type) query.types = { $contains: `POKEMON_TYPE_${type.toUpperCase()}` }

          const data = pokemon.chain().find(query).simplesort('dex').data()
          for (const item of data) {
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
            item.quickMoves = item.quickMoves.map(id => formatMove(moves.by('id', id)))
            item.chargeMoves = item.chargeMoves.map(id => formatMove(moves.by('id', id)))
          }
          return data
        }
      }
    }
  })

  return new graphql.GraphQLSchema({ query })
}

function formatTypeId (id) {
  return id.replace('POKEMON_TYPE_', '').toLowerCase()
}

function formatMove (move) {
  move.type = formatTypeId(move.type)
  return move
}
