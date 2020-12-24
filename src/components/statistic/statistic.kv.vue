<template>
  <table cellspacing=0 >
    <thead>
      <tr>
        <th>ФИО</th>
        <th>Логин</th>
        <th>Всего ошибок</th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="(kv, index) of countArr"
        :key="index"
        :kv="kv"
      >
        <td>{{ kv.name }}</td>
        <td>{{ kv.login }}</td>
        <td>{{ kv.count }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'StatisticKv',
  data: function () {
    return {
      countArr: [],
    }
  },
  computed: mapGetters(['getCurrentProject', 'getDate']),
  methods: {
    fetchStat () {
      this.$fetch(
        '/api',
        {
          target: 'statKv',
          projectCode: this.getCurrentProject.code,
          month: this.getDate.month,
          year: this.getDate.year,
        }
      ).then(
        response => response.json()
      ).then(
        response => {
          if (response.status === 11) {
            for (let kv of response.user)
              this.countArr.push({
                name: kv.name,
                login: kv.login,
                count: response.claim.filter(c => c.userId === kv._id).length,
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
    getDate: function () {
      this.fetchStat()
    },
  },
}
</script>

<style lang="sass" scoped>
th, td
  padding: 5px
  text-align: left
  border: 1px solid black
</style>
