
const path = require('path')

const express = require('express')
const favicon = require('serve-favicon')
const graphql = require('express-graphql')
const { Loki } = require('@lokijs/loki')
const { FSStorage } = require('@lokijs/fs-storage')

const logger = require('./lib/logger')
const schema = require('./lib/schema')

const stage = process.env.UP_STAGE || 'development'
const port = process.env.PORT || 4000
const app = express()

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.use(logger.middleware)

async function run () {
  const db = new Loki(path.resolve(__dirname, './data/game-master.db'))
  await db.initializePersistence({ adapter: new FSStorage() })
  await db.loadDatabase()

  app.use('/graphql', graphql({
    schema: schema(db),
    graphiql: stage === 'development'
  }))

  app.listen(port, () => logger.log('info', 'server listening', { port }))
}

run().catch(function (err) {
  console.error(err.stack)
  process.exit(1)
})
