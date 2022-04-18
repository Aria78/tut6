
const express = require('express')
const bodyParser = require('body-parser')
const graphqlHttp = require('express-graphql')
const mongoose = require('mongoose')

const graphqlSchema = require('./graphql/schema/index')
const graphqlResolvers = require('./graphql/resolvers/index')
const isAuth = require('./middleware/is-auth')

const app = express()

// connect to mongodb cluster
const { MONGO_USER, MONGO_PASSWORD, MONGO_DB } = process.env
mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${
      process.env.MONGO_PASSWORD
    }@cluster0.ppsel.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`, { useNewUrlParser: true })
  .then(() => {
    app.listen(8000);
  }).catch(err => {
    console.log(err);
  });

// parse incoming json bodies
app.use(bodyParser.json())

app.use((req, res, next) => {
  // Allow CORS -- explained here https://www.reddit.com/r/webdev/comments/5r9be9/could_someone_please_explain_cors_or_point_me_to/dd5ksrc?utm_source=share&utm_medium=web2x
  res.setHeader('Access-Control-Allow-Origin', '*')
  // allow only these methods, note: OPTIONS is automatically sent from browser
  res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS')
  // the only two headers that our server can handle
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  // our server cannot specially handle options, in this case just send 200
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }
  // only proceed if it was not OPTIONS header
  next()
})

// express will run isAuth on every incoming request
app.use(isAuth)

// the '/graphql is the end point localhost:8000/graphql
app.use('/graphql', graphqlHttp({
  schema: graphqlSchema,
  // has all resolver functions for that schema
  rootValue: graphqlResolvers,
  graphiql: true
}))
