
const Case = require('case')

module.exports = function (data) {
  return data.moveSettings.map(function (move) {
    const id = move.movementId
    const name = Case.title(id)
    const type = move.pokemonType
    const power = move.power
    return { id, name, type, power }
  })
}
