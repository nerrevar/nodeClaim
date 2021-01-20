const config = require('./db.config')

const Base64 = require('crypto-js/enc-base64')
const sha256 = require('crypto-js/sha256')

const ObjectId = require('mongodb').ObjectId

function initClient () {
  return require('mongodb').MongoClient(
    config.protocol + config.username + config.password + config.host + config.txtOptions,
    config.options
  )
}

async function getUser (query) {
  let client = initClient()
  let user = {}
  try {
    await client.connect()
    user = await client.db('claim').collection('user').findOne(query)
  }
  catch (e) {
    console.error(e)
  }
  finally {
    await client.close()
  }
  return await user
}

async function getStat (projectCode, userQuery, year, month) {
  let client = initClient()
  let questions = []
  let users = []
  let claims = []
  let groups = []
  let userIds = [] // Internal use
  try {
    await client.connect()
    await client.db('claim').collection(projectCode + 'Question').find({year: year, month: month}).forEach(q => {
      questions.push(q)
    })
    await client.db('claim').collection('user').find(userQuery).forEach(user => {
      if (user.project.filter(p => p.code === projectCode).length > 0) {
        users.push(user)
        userIds.push(ObjectId(user._id))
        for (let p of user.project.filter(pr => pr.code === projectCode))
          if (!groups.includes(p.group))
            groups.push(p.group)
      }
    })
    await client.db('claim').collection(projectCode + 'Claim').find(
      {userId: {$in: userIds}, year: year, month: month}
    ).forEach(c => {
      claims.push(c)
    })
  }
  catch (e) {
    console.error(e)
  }
  finally {
    await client.close()
  }
  return await {users: users, claims: claims, groups: groups, questions: questions}
}

async function getStatKv (projectCode, year, month) {
  let client = initClient()
  let users = []
  let claims = []
  let userIds = [] // Internal use
  try {
    await client.connect()
    await client.db('claim').collection('user').find().forEach(user => {
      if (user.project.filter(p => p.code === projectCode).length > 0) {
        users.push(user)
        userIds.push(ObjectId(user._id))
      }
    })
    await client.db().collection(projectCode + 'Claim').find(
      {userId: {$in: userIds}, year: year, month: month}
    ).forEach(c => {
      claims.push(c)
    })
  }
  catch (e) {
    console.error(e)
  }
  finally {
    await client.close()
  }
  return await {users: users, claims: claims}
}

async function getStatQ (projectCode, year, month) {
  let client = initClient()
  let questions = []
  let claims = []
  try {
    await client.connect()
    await client.db('claim').collection(projectCode + 'Question').find({year: year, month: month}).forEach(q => {
      questions.push(q)
    })
    await client.db().collection(projectCode + 'Claim').find({year: year, month: month}).forEach(c => {
      claims.push(c)
    })
  }
  catch (e) {
    console.error(e)
  }
  finally {
    await client.close()
  }
  return await {questions: questions, claims: claims}
}

async function getClaimsForKv (projectCode, login, year, month) {
  let client = initClient()
  let claims = []
  try {
    await client.connect()
    let user = await client.db('claim').collection('user').findOne({login: login})
    console.log(user)
    await client.db('claim').collection(projectCode + 'Claim').find(
      {userId: user._id, year: year, month: month}
    ).forEach(c => {
      claims.push(c)
    })
  }
  catch (e) {
    console.error(e)
  }
  finally {
    await client.close()
  }
  return await claims
}

async function writeErrorMultiple (projectCode, errorList, year, month) {
  let client = initClient()
  let result = {}
  try {
    await client.connect()
    let userArr = []
    let questionArr = []
    let claimArr = []
    let claimToInsert = []
    await client.db('claim').collection('user').find().forEach(u => userArr.push(u))
    await client.db('claim').collection(projectCode + 'Question').find({year: year, month: month}).forEach(
      q => questionArr.push(q)
    )
    await client.db('claim').collection(projectCode + 'Claim').find({year: year, month: month}).forEach(
      c => claimArr.push(c)
    )
    for (let claim of errorList) {
      result = {
        status: false,
        type: 'кв',
        text: claim.login,
      }
      let user = userArr.filter(u => u.login === claim.login)[0]
      if (user === undefined)
        return result
      result = {
        status: false,
        type: 'вопросе',
        text: claim.questionText,
      }
      let question = questionArr.filter(q => q.text === claim.questionText)[0]
      if (question === undefined)
        return result
      if (
        claimArr.filter(
          c => c.userId === ObjectId(user._id) && c.questionId === ObjectId(question._id) && c.formId === claim.formId
        ).length === 0
      )
        claimToInsert.push({
          userId: user._id,
          questionId: question._id,
          formId: claim.formId,
          year: year,
          month: month,
        })
    }
    await client.db('claim').collection(projectCode + 'Claim').insertMany(claimToInsert)
    result = {
      status: true,
    }
  }
  catch (e) {
    result = {
      status: false,
      type: 'запросе',
      text: e,
    }
  }
  finally {
    await client.close()
  }
  return await result
}

async function addUser (user) {
  let client = initClient()
  let result = {}
  try {
    await client.connect()
    let u = await client.db().collection('user').findOne({login: user.login})
    let clone = true
    if (u)
      if (u.project.filter(p => p.code === user.project[0].code).length === 1)
        result = {
          status: false,
          text: 'Пользователь существует'
        }
      else {
        await client.db().collection('user').updateOne(
          {login: user.login},
          {$set: {project: u.project.concat(user.project)}}
        )
        result = {
          status: true,
          text: 'Пользователь успешно обновлен'
        }
      }
    else {
      user.password = Base64.stringify(sha256(user.login + user.login))
      if (user.project[0].captain === '')
        delete user.project[0].captain
      await client.db().collection('user').insertOne(user)
      result = {
        status: true,
        text: 'Пользователь успешно добавлен'
      }
    }
  }
  catch (e) {
    console.error(e)
  }
  finally {
    client.close()
  }
  return await result
}

async function addQuestions (projectCode, questions) {
  let client = initClient()
  let result = {
    status: false,
  }
  try {
    await client.connect()
    let tmp_questions = []
    for (let q of questions) {
      let notExist = true
      await client.db().collection(projectCode + 'Question').find(
        { text: q.text, year: q.year, month: q.month }
      ).forEach(
        q => notExist = false
      )
      if (notExist)
        tmp_questions.push(q)
    }
    if (tmp_questions.length !== 0)
      await client.db().collection(projectCode + 'Question').insertMany(tmp_questions)
    result = {
      status: true,
      text: 'Вопросы успешно добавлены'
    }
  }
  catch (e) {
    console.error(e)
  }
  finally {
    client.close()
  }
  return await result
}

async function getGroups (projectCode) {
  let client = initClient()
  let groups = []
  await client.connect()
  await client.db().collection('user').find(
    {project: {$elemMatch: {code: projectCode}}}
  ).forEach(u => u.project.map(p => {if (p.code === projectCode && !groups.includes(p.group)) groups.push(p.group)}))
  return await groups
}

async function getQuestions (projectCode, year, month) {
  let client = initClient()
  let questions = []
  try {
    await client.connect()
    await client.db('claim').collection(projectCode + 'Question').find({year: year, month: month}).forEach(q => {
      questions.push(q)
    })
  }
  catch (e) {
    console.error(e)
  }
  finally {
    await client.close()
  }
  return questions
}

export default {
  getUser,
  getStat,
  getStatKv,
  getStatQ,
  getClaimsForKv,
  writeErrorMultiple,
  addUser,
  addQuestions,
  getGroups,
  getQuestions,
}
