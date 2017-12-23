
const Case = require('case')

module.exports = function (data) {
  return data.moveSettings.map(function (move) {
    const id = move.movementId
    const name = Case.title(id.replace('_FAST', ''))
    const type = move.pokemonType
    const power = move.power
    const fast = id.endsWith('_FAST')
    return { id, name, type, power, fast }
  })
}
