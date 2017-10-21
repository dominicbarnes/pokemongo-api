
const express = require('express')
const graphql = require('express-graphql')
const Loki = require('lokijs')
const path = require('path')
const schema = require('./lib/schema')
const port = process.env.PORT || 4000

const app = express()
const db = new Loki(path.resolve(__dirname, './data/game-master.db'))

db.loadDatabase(null, err => {
  if (err) throw err

  app.use('/graphql', graphql({
    schema: schema(db),
    graphiql: true
  }))

  app.listen(port)
})
