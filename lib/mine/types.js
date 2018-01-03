
const POGOProtos = require('node-pogo-protos-vnext')

module.exports = function (data) {
  const m = new Map()
  const t = index(POGOProtos.Enums.PokemonType)

  data.get('typeEffective').forEach(effective => {
    const id = effective.attackType

    m.set(id, {
      id: id,
      name: id.replace('POKEMON_TYPE_', '').toLowerCase(),
      sort: POGOProtos.Enums.PokemonType[id],
      multipliers: effective.attackScalar.reduce((acc, multiplier, id) => {
        acc[t[id + 1]] = multiplier
        return acc
      }, Object.create(null))
    })
  })

  return m
}

function index (input) {
  const output = Object.create(null)
  for (let [ key, value ] of Object.entries(input)) {
    output[value] = key
  }
  return output
}
