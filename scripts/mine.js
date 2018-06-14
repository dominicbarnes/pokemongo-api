
const fs = require('fs')
const path = require('path')
const util = require('util')

const mkdir = require('mkdirp')
const semver = require('semver')
const { Loki } = require('@lokijs/loki')
const { FSStorage } = require('@lokijs/fs-storage')

const Miner = require('../lib/mine')

const input = path.resolve(__dirname, '../pokemongo-game-master/versions/')
const output = path.resolve(__dirname, '../data/game-master.db')

const schemas = {
  families: {
    unique: [ 'id' ],
    clone: true
  },
  types: {
    unique: [ 'id' ],
    clone: true
  },
  items: {
    unique: [ 'id' ],
    indices: [ 'type', 'category' ],
    clone: true
  },
  pokemon: {
    unique: [ 'id' ],
    indices: [ 'dex', 'generation' ],
    clone: true
  },
  moves: {
    unique: [ 'id' ],
    clone: true
  },
  settings: {
    unique: [ 'id' ],
    clone: true
  }
}

async function run () {
  const miner = new Miner()
  const db = new Loki(output)
  await db.initializePersistence({ adapter: new FSStorage() })

  const files = await util.promisify(fs.readdir)(input)
  const versions = files.filter(semver.valid).sort(semver.compare)

  for (const version of versions) {
    console.log('> version %s', version)
    const file = path.join(input, version, 'GAME_MASTER.json')
    const raw = await util.promisify(fs.readFile)(file, 'utf8')
    const data = JSON.parse(raw)
    miner.process(data)
  }

  for (const [ id, schema ] of Object.entries(schemas)) {
    if (!(id in miner)) continue
    const rows = Array.from(miner[id].entries()).map(entry => {
      const [ id, doc ] = entry
      doc.id = id
      return doc
    })
    db.addCollection(id, schema).insert(rows)
  }

  await mkdir(path.dirname(output))
  await db.saveDatabase()
}

run()
  .then(function () {
    console.log('done')
    process.exit(0)
  })
  .catch(function (err) {
    console.error(err.stack)
    process.exit(1)
  })
