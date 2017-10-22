
const items = require('./items')
const moves = require('./moves')
const pokemon = require('./pokemon')
const types = require('./types')

module.exports = function (data, done) {
  const grouped = group(data)

  return {
    types: types(grouped),
    items: items(grouped),
    moves: moves(grouped),
    pokemon: pokemon(grouped)
  }
}

function group (data) {
  return data.itemTemplates.reduce((acc, item) => {
    for (const key in item) {
      if (key === 'templateId') continue
      if (item.hasOwnProperty(key) && item[key]) {
        if (!(key in acc)) acc[key] = []
        acc[key].push(item[key])
      }
    }
    return acc
  }, Object.create(null))
}
