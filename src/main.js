import Vue from 'vue'
import App from './components/app'

import store from './store'
import router from './router'

Vue.use(require('vue-cookie'))

Vue.mixin({
  created () {
    if (this.$router)
      if (this.$router.options.routes.filter(r => r.path === '/admin/collections/:collectionName').length === 0) {
        this.$router.addRoutes([
          { path: '/admin', component: () => import('./admin/index') },
          { path: '/admin/collections/:collectionName', component: () => import('./admin/collection.details'), props: true }
        ])
      }
  },
})

Vue.config.productionTip = true

Vue.prototype.$fetch = async (url, body) => {
  return await fetch(url, {
    method: 'POST',
    mode: 'same-origin',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
}

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')
