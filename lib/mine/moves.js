
const Case = require('case')

module.exports = function (m, data) {
  data.get('moveSettings').forEach(move => {
    const id = move.movementId

    m.set(id, {
      id: id,
      name: Case.title(id.replace('_FAST', '')),
      type: move.pokemonType,
      power: move.power,
      fast: id.endsWith('_FAST')
    })
  })
}
