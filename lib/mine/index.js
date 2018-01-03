const items = require('./items')
const moves = require('./moves')
const pokemon = require('./pokemon')
const types = require('./types')

module.exports = function (raw) {
  const data = prepare(raw)

  return {
    types: types(data),
    items: items(data),
    moves: moves(data),
    pokemon: pokemon(data)
  }
}

function prepare (data) {
  return data.itemTemplates.reduce((m, item) => {
    for (const key in item) {
      if (key === 'templateId') continue
      if (item.hasOwnProperty(key) && item[key]) {
        if (!m.has(key)) m.set(key, new Set())
        m.get(key).add(item[key])
      }
    }
    return m
  }, new Map())
}
