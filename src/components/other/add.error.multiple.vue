<template>
  <form class="wrapper">
    <p>Формат: логин, текст вопроса, номер анкеты</p>
    <label>Список ошибок: </label>
    <textarea type="text" id="error_list"></textarea>
    <input type="checkbox" id="prev" name="prev" />
    <label for="prev">Отнести к прошлому месяцу</label>
    <div>
      <button @click="addError($event)">Добавить</button>
      <div
        class="requestStatus"
        v-if="pending"
      >
        Запрос выполняется...
      </div>
      <div
        class="responseStatus"
        v-if="showResponse && !pending"
      >
        <span
          :class="{green: response.status === 31, red: response.status !== 31}"
          v-show="response.status !== undefined"
        >
          {{ response.text }}
        </span>
      </div>
    </div>
  </form>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'AddErrorMultiple',
  data () {
    return {
      response: {},
      pending: false,
      showResponse: false,
    }
  },
  computed: mapGetters(['getCurrentProject']),
  methods: {
    addError (e) {
      e.preventDefault()
      this.pending = true
      try {
        this.$fetch(
          '/claimApi',
          {
            target: 'writeErrorMultiple',
            projectCode: this.getCurrentProject.code,
            errorList: document.getElementById('error_list').value.trim().split('\n').map(
              el => {
                let arr = el.trim().split(';')
                return {
                  login: arr[0].trim(),
                  questionText: arr[1].trim(),
                  formId: arr[2].trim(),
                }
              }
            ),
            prev: document.getElementById('prev').checked,
          }
        ).then(
          response => response.json()
        ).then(
          response => {
            this.pending = false
            this.response = response
            this.showResponse = true
            setTimeout(
              () => {
                this.showResponse = false
              },
              10000
            )
          }
        )
      }
      catch (e) {
        this.pending = false
        this.showResponse = true
        this.response = {
          status: 100,
          text: 'Неправильный формат данных',
        }
        setTimeout(
          () => {
            this.showResponse = false
          },
          10000
        )
        console.error(e)
      }
    },
  },
}
</script>

<style lang="sass" scoped>
.wrapper
  display: flex
  flex: 1 0
  flex-flow: row wrap

label
  width: 90%

input
  width: 100%

textarea
  width: 100%
  height: 300px

#prev
  width: 16px
  margin: 5px

button
  width: 200px
  height: 30px
</style>
