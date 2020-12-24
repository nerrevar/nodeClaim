export const getCurrentProject = state => state.currentProject

export const getCurrentPage = state => state.currentPage

export const getDate = state => state.date

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
