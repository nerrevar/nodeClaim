import mongo from 'mongodb'

import config from './db.config'

import Base64 from 'crypto-js/enc-base64'
import sha256 from 'crypto-js/sha256'

function initClient () {
  return mongo.MongoClient(
    config.protocol + config.username + config.password + config.host + config.txtOptions,
    config.options
  )
}

async function auth (user) {
  let client = initClient()

  let result = {
    status: false,
    text: 'Invalid username or password'
  }

  try {
    await client.connect()
    let userInDb = await client.db(config.db).collection('user').findOne({ login: user.login, isAdmin: true })
    if (userInDb)
      if (user.password === userInDb.password)
        result = {
          status: 2,
          user: {
            loginHash: Base64.stringify(sha256(userInDb.login)),
            name: userInDb.name
          }
        }
  }
  catch (e) {
    result = {
      status: 101,
      text: e.message,
    }
    console.error(e)
  }
  finally {
    await client.close()
  }
  return await result
}

async function readCollections () {
  let client = initClient()

  let result = {
    status: 103,
    text: 'Unable to read collections',
  }

  try {
    await client.connect()
    let collections = await client.db(config.db).collections()
    result = {
      status: 10,
      collections: collections.map(c => c = c.s.namespace.collection)
    }
  }
  catch (e) {
    result = {
      status: 101,
      text: e.message,
    }
  }
  finally {
    await client.close()
  }
  return await result
}

async function readDocuments (collectionName) {
  let client = initClient()

  let result = {
    status: 104,
    text: 'Unable to read documents',
  }

  try {
    await client.connect()

    let documents = []
    await client.db(config.db).collection(collectionName).find({}).forEach(d => documents.push(d))

    result = {
      status: 11,
      documents: documents,
    }
  }
  catch (e) {
    result = {
      status: 101,
      text: e.message,
    }
  }
  finally {
    await client.close()
  }
  return await result
}

export default {
  auth,
  readCollections,
  readDocuments,
}
