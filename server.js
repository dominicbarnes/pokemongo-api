
const express = require('express')
const graphql = require('express-graphql')
const Loki = require('lokijs')
const path = require('path')
const schema = require('../lib/schema')

const app = express()
const db = new Loki(path.resolve(__dirname, '../data/game-master.db'))

app.use('/graphql', graphql({
  schema: schema(db),
  graphiql: true
}))

db.loadDatabase(null, function (err) {
  if (err) throw err
  app.listen(4000, function () {
    console.log('Running a GraphQL API server at http://localhost:4000/graphql')
  })
})
