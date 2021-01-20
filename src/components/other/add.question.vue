<template>
  <div class="wrapper">
    <span>Год: </span>
    <select
      id="yearQuestion"
      :value="(new Date()).getFullYear()"
    >
      <option>2020</option>
      <option>2021</option>
      <option>2022</option>
    </select>
    <span>Месяц: </span>
    <select
      id="monthQuestion"
      :value="(new Date()).getMonth()"
    >
      <option
        v-for="(item, index) in month"
        :item="item"
        :value="index"
        :key="index"
      >
        {{ item }}
      </option>
    </select>
    <span>Вопросы (формат: номер. текст): </span>
    <textarea id="questionsText"></textarea>
    <div>
      <button
        @click="addQuestions"
      >
        Добавить
      </button>
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
          :class="{green: response.status === 50, red: response.status !== 50}"
          v-show="response.status !== undefined"
        >
          {{ response.text }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'QuestionsAdd',
  data () {
    return {
      month: {
        0: 'Январь',
        1: 'Февраль',
        2: 'Март',
        3: 'Апрель',
        4: 'Май',
        5: 'Июнь',
        6: 'Июль',
        7: 'Август',
        8: 'Сентябрь',
        9: 'Октябрь',
        10: 'Ноябрь',
        11: 'Декабрь',
      },
      pending: false,
      response: {},
      showResponse: false,
    }
  },
  computed: mapGetters(['getCurrentProject']),
  methods: {
    addQuestions () {
      let year = parseInt(document.getElementById('yearQuestion').value)
      let month = parseInt(document.getElementById('monthQuestion').value)
      try {
        let questions = document.getElementById('questionsText').value.trim().split('\n').map(q => {
          q = {
            number: parseInt(q.split('.')[0].trim()),
            text: q.split('.')[1].trim(),
            year: year,
            month: month,
          }
          return q
        })
        this.$fetch(
          '/api',
          {
            target: 'addQuestions',
            projectCode: this.getCurrentProject.code,
            questions: questions,
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
          status: 101,
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
textarea
  height: 400px
</style>
