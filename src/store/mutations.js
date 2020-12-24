import Vue from 'vue'

export const setUser = (state, user) => Vue.set(state, 'user', user)

export const setCurrentProject = (state, project) => Vue.set(state, 'currentProject', project)

export const setCurrentPage = (state, pageName) => Vue.set(state, 'currentPage', pageName)

export const setDate = (state, date) => Vue.set(state, 'date', date)

export const setGroup = (state, group) => Vue.set(state, 'group', group)

export const setQuestion = (state, question) => Vue.set(state, 'question', question)
