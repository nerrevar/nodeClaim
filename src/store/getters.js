export const getCurrentProject = state => state.currentProject

export const getCurrentPage = state => state.currentPage

export const getStartDate = state => {
  if (state.startDate !== '')
    return state.startDate
  else {
    let currDate = new Date()
    let dateStr = '' + currDate.getFullYear() + '-'
    if (currDate.getMonth() < 9) {
      let month = currDate.getMonth() + 1
      dateStr += '0' + month
    }
    else
      dateStr += currDate.getMonth()
    dateStr += '-01'
    return dateStr
  }
}

export const getEndDate = state => {
  if (state.endDate !== '')
    return state.endDate
  else {
    let currDate = new Date()
    let newDate = ''
    if (currDate.getMonth() <= 10)
      newDate = new Date(currDate.getFullYear(), currDate.getMonth() + 1, 0)
    else
      newDate = new Date(currDate.getFullYear(), 0, 0)
    let dateStr = '' + newDate.getFullYear() + '-'
    if (newDate.getMonth() < 9) {
      let month = newDate.getMonth() + 1
      dateStr += '0' + month
    }
    else
      dateStr += newDate.getMonth()
    dateStr += '-' + newDate.getDate()
    return dateStr
  }
}

export const getGroup = state => state.group

export const getQuestion = state => state.question

export const getUser = state => state.user

export const parseProject = state => projectString => {
  let project = []
  projectString.split(',').map(p => {
    let pArr = p.split(':')
    let tmpProject = {
      code: pArr[0],
      role: pArr[1],
      group: pArr[2],
    }
    if (pArr.length > 3)
      tmpProject.captain = pArr[3]
    project.push(tmpProject)
  })
  return project
}
