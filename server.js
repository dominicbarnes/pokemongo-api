
const express = require('express')
const favicon = require('serve-favicon')
const graphql = require('express-graphql')
const logger = require('./lib/logger')
const Loki = require('lokijs')
const path = require('path')

const schema = require('./lib/schema')

const stage = process.env.UP_STAGE || 'development'
const port = process.env.PORT || 4000
const app = express()
const db = new Loki(path.resolve(__dirname, './data/game-master.db'))

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.use(logger.middleware)

db.loadDatabase(null, err => {
  if (err) throw err

  app.use('/graphql', graphql({
    schema: schema(db),
    graphiql: stage === 'development'
  }))

  app.listen(port, () => {
    logger.log('info', 'server listening', { port })
  })
})
