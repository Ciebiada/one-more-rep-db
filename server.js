const PouchDB = require('pouchdb')
const express = require('express')
const cors = require('cors')

const app = express()
const pouchHandler = require('express-pouchdb')(PouchDB)

const corsOptions = {
  origin: process.env.WEB_HOST,
  credentials: true
}

app.use('/', cors(corsOptions), pouchHandler) 

app.listen(process.env.PORT || 5984)

const users = new PouchDB('_users')

users
  .changes({
    since: 'now',
    live: true,
    include_docs: true,
    filter(doc) {
      const version = doc._rev.split('-')[0]
      if (parseInt(version) > 1 || doc.type !== 'user') { return false }
      return true
    }
  })
  .on('change', (result) => {
    const username = result.doc.name
    const userDB = new PouchDB(`userdb-${username}`)
    userDB.putSecurity({
      members: {
        names: [username]
      }
    })
  })
