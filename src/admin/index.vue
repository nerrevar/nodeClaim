<template>
  <div class="wrapper">
    <Login
      v-if="user.loginHash === undefined"
      :error="error"
      @login="login($event)"
    ></Login>
    <div
      class="collectionList"
      v-if="user.loginHash !== undefined"
    >
      <span class="header1">List of collections</span>
      <router-link
        class="collection"
        v-for="(collection, index) in collections"
        :key="index"
        :collection="collection"
        :to="{ path: `/admin/collections/${collection}` }"
      >
        {{ collection }}
      </router-link>
    </div>
  </div>
</template>

<script>
import Login from './login'

import CollectionDetails from './collection.details'

export default {
  name: 'Admin',
  data () {
    return {
      user: {},
      page: 'collections',
      collections: {},
      error: '',
    }
  },
  components: {
    Login,
  },
  methods: {
    fetch: async function (body) {
      return fetch(
        '/admin',
        {
          method: 'POST',
          mode: 'same-origin',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        }
      )
    },
    login (credentials) {
      if (credentials.username && credentials.password)
        this.fetch(
          {
            target: 'login',
            username: credentials.username,
            password: credentials.password,
          }
        ).then(
          response => response.json()
        ).then(
          response => {
            if (response.status !== 2)
              if (typeof(response.status) === 'number') /* eslint-disable-line */
                this.error = 'Ошибка: ' + response.text /* eslint-disable-line */
              else /* eslint-disable-line */
                this.error = 'Неизвестная ошибка' /* eslint-disable-line */
            else {
              this.user.loginHash = this.$cookie.get('loginHash')
              this.readCollections()
            }
          }
        )
      else
        this.error = 'Ошибка при вводе'
    },
    readCollections () {
      this.fetch({
        target: 'readCollections',
      }).then(
        response => response.json()
      ).then(
        response => {
          if (response.status)
            this.collections = response.collections
          else
            alert(`Error while reading collection list!\n${response.code}: ${response.text}`)
        }
      )
    },
    changeRoute (path) {
      this.$router.push({ path: path })
    },
  },
  created () {
    if (this.$cookie.get('loginHash')) {
      this.user.loginHash = this.$cookie.get('loginHash')
      this.readCollections()
    }
  },
}
</script>

<style lang="sass" scoped>
.wrapper
  width: 100vw
  height: 100vh
  display: flex

.header1
  margin: 0.3em 0.1em
  color: #0d97c4
  font-size: 1.2em

.collection
  display: flex
  padding: 0.3em
</style>
