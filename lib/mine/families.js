
const Case = require('case')

module.exports = function (m, data) {
  data.get('pokemonSettings').forEach(pokemon => {
    const id = pokemon.familyId

    const o = {
      id: id,
      name: Case.title(id.replace('FAMILY_', ''))
    }

    if (m.has(id)) {
      m.set(id, merge(m.get(id), o))
    } else {
      m.set(id, o)
    }
  })
}

function merge (prev, next) {
  return Object.assign(Object.create(null), next)
}
