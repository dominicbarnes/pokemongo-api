
const POGOProtos = require('node-pogo-protos-vnext')

module.exports = function (data) {
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

function index (input) {
  const output = Object.create(null)
  for (let [ key, value ] of Object.entries(input)) {
    output[value] = key
  }
  return output
}
