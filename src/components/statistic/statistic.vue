<template>
  <div class="wrapper_2">
    <div
      class="total bold"
      v-if="checkPrivacy"
    >
      Всего ошибок: {{ totalCount }}
    </div>
    <div class="wrapper">
      <div class="table">
        <div class="table_row bold head">
          <div class="table_cell">ФИО</div>
          <div class="table_cell small">Логин</div>
          <div
            class="table_cell"
            v-for="(q, index) in question"
            :key="index"
            :q="q"
          >
            <div>{{ q.number }}</div>
            <div>{{ q.text }}</div>
          </div>
          <div class="table_cell">Итого</div>
        </div>
        <div
          class="table_block"
          v-for="(group, index) in group"
          :key="index"
          :group="group"
        >
          <div class="table_row">
            <div class="table_cell bold">{{ group.name }}</div>
            <div class="table_cell bold small" v-if="checkPrivacy()">{{ group.totalCount }}</div>
            <div
              class="table_cell noborder"
              v-for="(q, q_index) in question"
              :key="q_index"
            ></div>
            <div class="table_cell noborder"></div>
          </div>
          <div
            class="table_row"
            v-for="(kv, kv_index) in group.kv"
            :key="kv_index"
            :kv="kv"
          >
            <div class="table_cell">{{ kv.name }}</div>
            <div
              class="table_cell sticky link small"
              @click="redirectNumber($event)"
            >
              {{ kv.login }}
            </div>
            <div
              class="table_cell"
              v-for="(q, q_index) in question"
              :key="q_index"
              :q="q"
            >
              {{ kv.questionCount[q.number] || 0 }}
            </div>
            <div class="table_cell">{{ kv.totalCount }}</div>
          </div>
          <div
            class="table_row bold"
            v-if="getUser.role !== 'kv'"
          >
            <div class="table_cell"></div>
            <div class="table_cell small">Итого</div>
            <div
              class="table_cell"
              v-for="(q, index) in question"
              :key="index"
              :q="q"
            >
              <span v-text="group.questionCount[q.number]"></span>
            </div>
            <div class="table_cell">
              <span v-text="group.totalCount"></span>
            </div>
          </div>
        </div>
        <div
          class="table_row bold"
          v-if="!['captain', 'kv'].includes(getUser.role)"
        >
          <div class="table_cell"></div>
          <div class="table_cell small">Итого</div>
          <div
            class="table_cell"
            v-for="(q, index) in question"
            :key="index"
            :q="q"
          >
            {{ q.totalCount }}
          </div>
          <div class="table_cell noborder"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'Statistic',
  data () {
    return {
      question: {},
      group: {},
      questionCount: {},
      totalCount: 0,
    }
  },
  computed: mapGetters(['getCurrentProject', 'getUser', 'getDate']),
  methods: {
    ...mapActions(['setCurrentPage']),
    fetchClaims () {
      this.$fetch(
        '/api',
        {
          target: 'stat',
          projectCode: this.getCurrentProject.code,
          month: this.getDate.month,
          year: this.getDate.year,
          user: this.getUser,
          userPermissions: this.getUser.project.filter(p => p.code === this.getCurrentProject.code)[0],
        }
      ).then(
        response => response.json()
      ).then(
        response => { // question, claim, user, group
          if (response.status === 10) {
            this.question = response.question.sort((a, b) => a.number > b.number)
            for (let g of response.group) {
              this.group[g] = {
                kv: [],
                questionCount: {},
                totalCount: 0,
              }
              this.group[g].name = g
            }
            for (let user of response.user) {
              let userGroup = user.project.filter(p => p.code === this.getCurrentProject.code)[0].group
              let group = this.group[userGroup]
              user.totalCount = 0
              user.questionCount = {}
              for (let q of this.question) {
                if (this.questionCount[q.number] === undefined)
                  this.questionCount[q.number] = 0
                if (group.questionCount[q.number] === undefined)
                  group.questionCount[q.number] = 0
                response.claim.filter(c => c.userId === user._id && c.questionId === q._id).map(c => {
                  if (user.questionCount[q.number] === undefined)
                    user.questionCount[q.number] = 1
                  else
                    user.questionCount[q.number]++
                  user.totalCount++
                  group.questionCount[q.number]++
                  group.totalCount++
                  this.questionCount[q.number]++
                  this.totalCount++
                })
                if (user.questionCount[q.number] === undefined)
                  user.questionCount[q.number] = 0
              }
              group.kv.push(user)
            }
          }
          else
            console.log(response)
        }
      )
    },
    redirectNumber (e) {
      this.setCurrentPage({
        name: 'Номера анкет',
        type: 'single',
        code: 'claim_number',
        privacy: 0,
        login: e.target.innerText.trim(),
      })
    },
    checkPrivacy () {
      switch (this.getUser.project.filter(p => p.code === this.getCurrentProject.code)[0].role) {
        case 'kv': return false
        default: return true
      }
    },
  },
  created () {
    this.fetchClaims()
  },
  watch: {
    getDate: function () {
      this.fetchClaims()
    },
  },
}
</script>

<style scoped lang="sass">
.wrapper
  display: flex
  flex-flow: row nowrap

.table
  display: flex
  flex: 1 0 auto
  flex-flow: column nowrap

.table_row
  display: flex
  flex: 1 0
  flex-flow: row nowrap
  align-self: stretch

.table_cell
  display: flex
  flex: 1 0
  flex-flow: column nowrap
  border: 1px solid grey
  padding: 3px
  max-width: 300px

.small
  max-width: 150px

.noborder
  border: 0!important
  padding: 4px!important

.head
  position: sticky
  top: 0
  background: white
  z-index: 11

.sticky
  position: sticky
  left: 0
  background: white

.link
  color: blue

.bold
  font-weight: 800
</style>
