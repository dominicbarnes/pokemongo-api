
const Case = require('case')

module.exports = function (m, data) {
  data.get('moveSettings').forEach(move => {
    const id = `MOVE_${move.movementId}`

    m.set(id, {
      id: id,
      name: Case.title(move.movementId.replace('_FAST', '')),
      type: move.pokemonType,
      power: move.power,
      quick: id.endsWith('_FAST')
    })
  })
}
