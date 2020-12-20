<template>
  <div class="wrapper">
    <div
      v-if="zero === true"
    >
      Нет записей
    </div>
    <table
      cellspacing=0
      v-if="zero !== true"
    >
      <thead>
        <tr>
          <th>Номер Анкеты</th>
          <th>Вопрос</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(item, index) in number"
          :item="item"
          :key="index"
        >
          <td>{{ item.number }}</td>
          <td>{{ item.question }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'ClaimNumber',
  data () {
    return {
      zero: false,
      number: [],
      question: {},
    }
  },
  computed: mapGetters(['getCurrentProject', 'getCurrentPage', 'getUser', 'getStartDate', 'getEndDate']),
  methods: {
    fetchNumbers () {
      let login = this.getCurrentPage.login ? this.getCurrentPage.login : this.getUser.login
      this.$fetch(
        '/api',
        {
          target: 'formNumbers',
          projectCode: this.getCurrentProject.code,
          login: login,
        }
      ).then(
        response => response.json()
      ).then(
        response => {
          if (response.status === 20) {
            for (let q of response.question)
              this.question[q._id] = q
            if (response.claim.length === 0)
              this.zero = true
            else
              response.claim.map(c => this.number.push({
                number: c.formId,
                question: `${this.question[c.questionId].number}. ${this.question[c.questionId].text}`,
              }))
          }
          else
            console.log(response)
        }
      )
    },
  },
  mounted () {
    this.fetchNumbers()
  },
  watch: {
    getStartDate: function () {
      this.fetchNumbers()
    },
    getEndDate: function () {
      this.fetchNumbers()
    },
  },
}
</script>

<style lang="sass" scoped>
td, th
  border: 1px solid black
  padding: 5px
</style>
