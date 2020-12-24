<template>
  <table>
    <thead>
      <tr>
        <th>Вопрос</th>
        <th>Всего ошибок</th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="(item, index) in countArr"
        :key="index"
        :item="item"
      >
        <td>{{ item.question }}</td>
        <td>{{ item.count }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'StatisticQuestion',
  data () {
    return {
      countArr: [],
    }
  },
  computed: mapGetters(['getCurrentProject', 'getUser', 'getStartDate', 'getEndDate']),
  methods: {
    fetchStat () {
      this.$fetch(
        '/api',
        {
          target: 'statQ',
          projectCode: this.getCurrentProject.code,
        }
      ).then(
        response => response.json()
      ).then(
        response => {
          if (response.status === 12) {
            for (let q of response.question)
              this.countArr.push({
                question: `${q.number}. ${q.text}`,
                count: response.claim.filter(c => c.questionId === q._id).length,
              })
            this.countArr.sort((a, b) => a.count > b.count)
          }
          else
            console.log(response)
        }
      )
    },
  },
  mounted () {
    this.fetchStat()
  },
  watch: {
    getStartDate: function () {
      this.fetchStat()
    },
    getEndDate: function () {
      this.fetchStat()
    },
  },
}
</script>
