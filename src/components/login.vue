<template>
  <form class="wrapper">
    <label for="username">Имя пользователя</label>
    <input type="text" name="username" id="username" />
    <label for="password">Пароль</label>
    <input type="password" name="password" id="password" />
    <div
      class="button"
      @click="login"
    >
      Вход
    </div>
    <div
      class="error red"
      v-if="error !== ''"
    >
      {{ error }}
    </div>
  </form>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import sha256 from 'crypto-js/sha256'
import Base64 from 'crypto-js/enc-base64'

export default {
  name: 'Login',
  data () {
    return {
      error: '',
    }
  },
  computed: mapGetters(['parseProject', 'getUser']),
  methods: {
    ...mapActions(['setUser', 'setCurrentProject', 'setCurrentPage']),
    login () {
      this.$fetch(
        '/api',
        {
          target: 'login',
          username: document.getElementById('username').value,
          password: Base64.stringify(sha256(document.getElementById('password').value)),
        }
      ).then(
        response => response.json()
      ).then(
        response => {
          if (response.status === 2)
            this.setData()
          else
            if (typeof(response.status) === 'number') /* eslint-disable-line */
              this.error = 'Ошибка: ' + response.text /* eslint-disable-line */
            else /* eslint-disable-line */
              this.error = 'Неизвестная ошибка' /* eslint-disable-line */
        }
      )
    },
    setData () {
      this.setUser({
        name: this.$cookie.get('name'),
        login: this.$cookie.get('login'),
        project: this.parseProject(this.$cookie.get('project')),
      })
      this.setCurrentPage({
        code: 'stat',
        name: 'Общая',
        privacy: 0,
      })
      this.setCurrentProject(this.$parent.project.filter(p => p.code === this.getUser.project[0].code)[0])
    },
  },
  created () {
    if (this.$cookie.get('login') && this.getUser.login === undefined)
      this.setData()
  },
}
</script>

<style lang="sass" scoped>
.wrapper
  position: absolute
  z-index: 11000
  display: flex
  align-self: center
  width: 300px
  margin: 15% auto auto auto
  padding: 20px

input, label, div
  margin: 5px

.button
  background: #13aa13
  padding: 10px
  text-align: center
</style>
