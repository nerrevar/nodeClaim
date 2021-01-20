import Vue from 'vue'
import VueRouter from 'vue-router'

import AppIndex from './components/app.index'

Vue.use(VueRouter)

export default new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    { path: '*', component: AppIndex, name: 'AppIndex' }
  ],
})
