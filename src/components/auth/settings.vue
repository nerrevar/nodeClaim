<template>
  <form class="wrapper">
    <div
      class="logout"
      @click="logout"
    >
      Выйти
    </div>
    <!-- <div class="field_wrapper">
      <label for="password">Пароль</label>
      <input
        type="password"
        name="password"
        id="password"
      />
    </div>
    <button
      @click="updateUserInfo"
    >
      Сохранить
    </button>
    <div
      class="response_status"
      v-if="response !== ''"
    >
      <span
        class="green"
        v-show="response === 'True'"
      >
        Информация обновлена
      </span>
      <span
        class="red"
        v-show="response === 'False'"
      >
        Ошибка: {{ response }}
      </span>
    </div> -->
  </form>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'UserSettengs',
  data () {
    return {
      response: '',
    }
  },
  methods: {
    ...mapActions(['setUser']),
    updateUserInfo () {
      fetch(
        'update_user_info',
        {
          method: 'POST',
          mode: 'same-origin',
          body: new FormData(document.querySelector('form')),
          credentials: 'include',
        }
      ).then(
        response => response.text()
      ).then(
        response => {
          this.response = response
          setTimeout(
            () => {
              this.response = ''
            },
            10000
          )
        }
      )
    },
    logout () {
      this.$fetch(
        '/api',
        {
          target: 'logout',
        }
      ).then(
        response => response.json()
      ).then(
        response => {
          if (response.status === 90)
            this.setUser({})
        }
      )
    },
  },
}
</script>

<style lang="sass" scoped>
.logout
  background: red
  color: white
  width: 200px
  padding: 10px
  text-align: center
  margin-bottom: 20px
</style>
