const config = require('./db.config')

function initClient () {
  return require('mongodb').MongoClient(
    config.protocol + config.username + config.password + config.host + config.txtOptions,
    config.options
  )
}

module.exports.getUser = async function (query) {
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

module.exports.getStat = async function (projectCode, userQuery, year, month) {
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
      console.log(userQuery)
      if (user.project.filter(p => p.code === projectCode).length > 0) {
        users.push(user)
        userIds.push(user._id)
        for (p of user.project.filter(pr => pr.code === projectCode))
          if (!groups.includes(p.group))
            groups.push(p.group)
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
  return await {users: users, claims: claims, groups: groups, questions: questions}
}

module.exports.getStatKv = async function (projectCode, year, month) {
  let client = initClient()
  let users = []
  let claims = []
  let userIds = [] // Internal use
  try {
    await client.connect()
    await client.db('claim').collection('user').find().forEach(user => {
      if (user.project.filter(p => p.code === projectCode).length > 0) {
        users.push(user)
        userIds.push(user._id)
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

module.exports.getStatQ = async function (projectCode, year, month) {
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

module.exports.getClaimsForKv = async function (projectCode, login, year, month) {
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

module.exports.writeErrorMultiple = async function (projectCode, errorList, year, month) {
  let client = initClient()
  let result = {}
  try {
    await client.connect()
    for (let c of errorList) {
      let user = await client.db('claim').collection('user').findOne({login: c.login})
      if (!user) {
        result = {
          status: false,
          type: 'кв',
          text: c.login,
        }
        return await result
      }
      let question = await client.db('claim').collection(projectCode + 'Question').findOne(
        {text: c.questionText, year: year, month: month}
      )
      if (!question) {
        result = {
          status: false,
          type: 'вопросе',
          text: c.questionText,
        }
        return await result
      }
      let claim = await client.db('claim').collection(projectCode + 'Claim').findOne(
        {userId: user._id, questionId: question._id, formId: c.formId}
      )
      if (!claim)
        await client.db('claim').collection(projectCode + 'Claim').insertOne(
          {year: year, month: month, userId: user._id, questionId: question._id, formId: c.formId}
        )
      result = {
        status: true,
      }
    }
  }
  catch (e) {
    console.error(e)
  }
  finally {
    await client.close()
  }
  return await result
}

module.exports.addUser = async function (user) {
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
      user.password = user.login + user.login
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

module.exports.getGroups = async function (projectCode) {
  let client = initClient()
  let groups = []
  await client.connect()
  await client.db().collection('user').find(
    {project: {$elemMatch: {code: projectCode}}}
  ).forEach(u => u.project.map(p => {if (p.code === projectCode && !groups.includes(p.group)) groups.push(p.group)}))
  return await groups
}

module.exports.getQuestions = async function (projectCode, year, month) {
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
