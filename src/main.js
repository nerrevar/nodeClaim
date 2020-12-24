import Vue from 'vue'
import App from './components/app'
import store from './store'

Vue.use(require('vue-cookie'))

Vue.config.productionTip = true

Vue.prototype.$fetch = async (url, body) => {
  return await fetch(url, {
    method: 'POST',
    mode: 'same-origin',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Allow: 'POST',
    },
    body: JSON.stringify(body),
  })
}

new Vue({
  store,
  render: h => h(App),
}).$mount('#app')
