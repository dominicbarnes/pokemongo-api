
const graphql = require('graphql')
const sortBy = require('sort-by')

module.exports = function (db) {
  const FloatMatrix = new graphql.GraphQLList(new graphql.GraphQLList(graphql.GraphQLFloat))

  const PokemonTypes = new graphql.GraphQLObjectType({
    name: 'PokemonTypes',
    fields: {
      list: { type: new graphql.GraphQLList(graphql.GraphQLString) },
      matrix: { type: FloatMatrix }
    }
  })

  const Pokemon = new graphql.GraphQLObjectType({
    name: 'Pokemon',
    fields: {
      id: { type: graphql.GraphQLString },
      name: { type: graphql.GraphQLString },
      dex: { type: graphql.GraphQLInt },
      generation: { type: graphql.GraphQLInt },
      types: { type: new graphql.GraphQLList(graphql.GraphQLString) }
    }
  })

  const query = new graphql.GraphQLObjectType({
    name: 'Query',
    fields: {
      types: {
        type: PokemonTypes,
        resolve () {
          return buildTypes(db.getCollection('types').find())
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
          return buildPokemon(db.getCollection('pokemon').find(query))
        }
      }
    }
  })

  return new graphql.GraphQLSchema({ query })
}

function buildTypes (items) {
  const ids = items.sort(sortBy('sort')).map(item => item.id)
  return items.reduce((acc, item) => {
    acc.list.push(item.name)
    acc.matrix.push(ids.map(id => item.multipliers[id]))
    return acc
  }, { list: [], matrix: [] })
}

function buildPokemon (items) {
  for (const item of items) {
    item.types = item.types.map(t => t.replace('POKEMON_TYPE_', '').toLowerCase())
  }
  items.sort(sortBy('dex'))
  return items
}
