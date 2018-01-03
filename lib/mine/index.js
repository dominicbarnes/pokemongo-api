const items = require('./items')
const moves = require('./moves')
const pokemon = require('./pokemon')
const types = require('./types')

module.exports = class Miner {
  constructor () {
    this.types = new Map()
    this.items = new Map()
    this.moves = new Map()
    this.pokemon = new Map()
  }

  process (raw) {
    const data = prepare(raw)
    types(this.types, data)
    items(this.items, data)
    moves(this.moves, data)
    pokemon(this.pokemon, data)
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
