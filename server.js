
const path = require('path')

const express = require('express')
const favicon = require('serve-favicon')
const cors = require('cors')
const graphql = require('express-graphql')
const { Loki } = require('@lokijs/loki')
const { FSStorage } = require('@lokijs/fs-storage')

const logger = require('./lib/logger')
const schema = require('./lib/schema')

const stage = process.env.UP_STAGE || 'development'
const port = process.env.PORT || 4000
const app = express()

app.use(cors())
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))
app.use(logger.middleware)

const db = new Loki(path.resolve(__dirname, './data/game-master.db'))

db.initializePersistence({ adapter: new FSStorage() })
  .then(() => db.loadDatabase())
  .then(() => {
    app.use('/graphql', graphql({
      schema: schema(db),
      graphiql: stage !== 'production',
      formatError: stage !== 'production' ? formatError : null
    }))

    app.listen(port, () => logger.log('info', 'server started', { port }))
  })
  .catch(err => {
    console.error(err.stack)
    process.exit(1)
  })

function formatError (err) {
  return {
    code: err.code,
    message: err.message,
    stack: err.stack
  }
}
