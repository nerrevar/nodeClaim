import express from 'express'
let app = express.Router()

import admin from './admin.function'

let response = {
  status: 100,
  text: 'Not authorised',
}

app.use((req, res, next) => {
  if (req.cookies.loginHash)
    response = {
      status: 1,
      text: 'Successfully authorised by cookie'
    }
  next()
})

app.post('/', async (req, res) => {
  switch (req.body.target) {
    case 'login': {
      response = await admin.auth({ login: req.body.username, password: req.body.password })
      res.cookie('loginHash', response.user.loginHash, {path: '/admin', sameSite: true})
      break
    }
    case 'readCollections': {
      response = await admin.readCollections()
      break
    }
    default: response = {
      status: 110,
      text: 'Invalid target',
    }
  }

  res.status(200).send(response)
})

app.post('/collections', async (req, res) => {
  res.status(200).send(await admin.readDocuments(req.body.collectionName))
})

app.use((req, res) => {
  res.status(200).send({
    status: 100,
    text: 'Invalid URL'
  })
})

export default app
