const express = require('express')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')

const db = require('./db.function')

const app = express()
app.use(express.static('dist'))
app.use(morgan('dev'))
app.use(express.json())
app.use(cookieParser())

let data = {}

let year = (new Date()).getFullYear()
let month = (new Date()).getMonth() + 1

app.use((req, res, next) => {
  if (!req.cookies.login)
    data = {
      status: 100,
      text: 'Not authorised',
    }
  else
    data = {
      status: 1,
      text: 'Successfully authorised by cookie'
    }
  if (req.cookies.year && req.cookies.month) {
    year = req.cookie.year
    month = req.cookie.month
  }
  next()
})

app.post('/claimApi', async (req, res, next) => {
  if (!req.body)
    data = {
      status: 101,
      text: 'Invalid request',
    }
  else
    switch (req.body.target) {
      case 'login': {
        if (!req.body || !req.body.username || !req.body.password)
          data = {
            status: 103,
            text: 'Неверное имя пользователя или пароль',
          }
        else {
          const user = await db.getUser({login: req.body.username})
          if (!user)
            data = {
              status: 105,
              text: 'Неверное имя пользователя или пароль',
            }
          else
            if (req.body.password === user.password) { // TODO: hash password
              let project = ''
              user.project.map(p => {
                if (project)
                  project += ',' + p.code + ':' + p.role + ':' + p.group + (p.captain ? ':' + p.captain : '')
                else
                  project += p.code + ':' + p.role + ':' + p.group + (p.captain ? ':' + p.captain : '')
              }) // Collect projects
              res.cookie('login', user.login, {sameSite: true})
              res.cookie('name', user.name, {sameSite: true})
              res.cookie('project', project, {sameSite: true}) // code:role:group[:captain]
              data = {
                status: 2,
                text: 'Successfully authorised',
              }
            }
            else
              data = {
                status: 104,
                text: 'Неверное имя пользователя или пароль',
              }
        }
        break
      }
      case 'logout': {
        res.clearCookie('login')
          .clearCookie('name')
          .clearCookie('role')
          .clearCookie('project')
          .clearCookie('group_name')
        data = {
          status: 90,
          text: 'Successfully logouted'
        }
        break
      }
      case 'stat': {
        if (!req.body.user)
          data = {
            status: 105,
            text: 'Invalid user'
          }
        else {
          let userQuery = {}
          switch (req.body.userPermissions.role) {
            case 'kv': {
              userQuery = {login: req.body.user.login}
              break
            }
            case 'captain': {
              userQuery = {$or:[
                {project: {$elemMatch: {code: req.body.projectCode, group: req.body.userPermissions.captain}}},
                {login: req.body.user.login}
              ]}
              break
            }
            case 'view':
            case 'work': {
              userQuery = {project: {$elemMatch: {code: req.body.projectCode}}}
              break
            }
            default: data = {
              status: 106,
              text: 'Invalid user role'
            }
          }
          let result = await db.getStat(req.body.projectCode, userQuery, year, month)
          let question = db.getQuestions(req.body.projectCode, year, month)
          if (!result || !question)
            data = {
              status: 107,
              text: 'Fail retrieving data',
            }
          else
            data = {
              status: 10,
              text: 'Successfully retrieved statistic',
              question: result.questions,
              claim: result.claims,
              user: result.users,
              group: result.groups,
            }
        }
        break
      }
      case 'statKv': {
        let result = await db.getStatKv(req.body.projectCode, year, month)
        if (!result)
          data = {
            status: 108,
            text: 'Fail retrieving data',
          }
        else
          data = {
            status: 11,
            text: 'Successfully retrieved statistic for kv',
            user: result.users,
            claim: result.claims,
          }
        break
      }
      case 'statQ': {
        let result = await db.getStatQ(req.body.projectCode, year, month)
        if (!result)
          data = {
            status: 109,
            text: 'Fail retrieving data',
          }
        else
          data = {
            status: 12,
            text: 'Successfully retrieved statistic for questions',
            question: result.questions,
            claim: result.claims,
          }
        break
      }
      case 'formNumbers': {
        if (!req.body.login)
          data = {
            status: 110,
            text: 'Invalid login',
          }
        else {
          data = {
            status: 20,
            text: 'Successfully retrieved form ids',
            claim: await db.getClaimsForKv(req.body.projectCode, req.body.login, year, month),
            question: await db.getQuestions(req.body.projectCode, year, month),
          }
        }
        break
      }
      case 'writeErrorMultiple': {
        if (!req.body.errorList)
          data = {
            status: 111,
            text: 'Invalid data',
          }
        if (req.body.prev)
          if (month === 1) {
            year -= 1
            month = 12
          }
          else
            month -= 1
        let result = await db.writeErrorMultiple(req.body.projectCode, req.body.errorList, year, month)
        data = {
          status: result.status ? 31 : 112,
          text: result.status ?
            'Ошибки успешно добавлены' :
            'Ошибки не добавлены. Ошибка в ' + result.type + ' ' + result.text
        }
        break
      }
      case 'getGroups': {
        data = {
          groups: await db.getGroups(req.body.projectCode)
        }
        break
      }
      case 'addUser': {
        if (!(req.body.user.name || req.body.user.login || req.body.user.project.length !== 0))
          data = {
            status: 113,
            text: 'Введены неверные данные'
          }
        else {
          let result = await db.addUser(req.body.user)
          data = {
            status: result.status ? 40 : 114,
            text: result.text ? result.text : 'Ошибка при добавлении пользователя'
          }
        }
        break
      }
      default: data = {
        status: 102,
        text: 'Invalid target'
      }
  }
  next()
})

app.use((req, res) => {
  res.status(200).send(data)
})

app.listen(3000, () => {
  console.log('listening on port 3000')
})
