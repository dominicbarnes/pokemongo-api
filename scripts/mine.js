
const fs = require('fs')
const Loki = require('lokijs')
const mine = require('../lib/mine')
const mkdir = require('mkdirp')
const path = require('path')

const input = path.resolve(__dirname, '../game-master/versions/latest/GAME_MASTER.json')
const output = path.resolve(__dirname, '../data/game-master.db')

const data = mine(JSON.parse(fs.readFileSync(input, 'utf8')))
const db = new Loki(output)

db.addCollection('types', { unique: [ 'id' ] }).insert(data.types)

db.addCollection('pokemon', {
  unique: [ 'id' ],
  indices: [ 'dex', 'generation' ],
  clone: true
}).insert(data.pokemon)

db.addCollection('moves', { unique: [ 'id' ] })

mkdir(path.dirname(output), function (err) {
  if (err) throw err
  db.saveDatabase(function (err) {
    if (err) throw err
  })
})
