
const fs = require('fs')
const Loki = require('lokijs')
const mine = require('../lib/mine')
const mkdir = require('mkdirp')
const path = require('path')

const input = path.resolve(__dirname, '../game-master/versions/latest/GAME_MASTER.json')
const output = path.resolve(__dirname, '../data/game-master.db')

const data = mine(JSON.parse(fs.readFileSync(input, 'utf8')))
const db = new Loki(output)

const schemas = {
  types: {
    unique: [ 'id' ]
  },
  items: {
    unique: [ 'id' ],
    indices: [ 'type', 'category' ]
  },
  pokemon: {
    unique: [ 'id' ],
    indices: [ 'dex', 'generation' ],
    clone: true
  },
  moves: {
    unique: [ 'id' ],
    clone: true
  }
}

for (const [ id, schema ] of Object.entries(schemas)) {
  if (!(id in data)) continue
  db.addCollection(id, schema).insert(data[id])
}

mkdir(path.dirname(output), err => {
  if (err) throw err
  db.saveDatabase(err => {
    if (err) throw err
  })
})
