<template>
  <div class="wrapper">
    <Login
      v-if="getUser.login === undefined"
    ></Login>
    <Header
      :class="{ hidden: getUser.login === undefined }"
      :project="project"
    ></Header>
    <DatePicker
      :class="{ hidden: getUser.login === undefined }"
      v-show="['stat', 'stat_kv', 'stat_question', 'claim_number'].includes(getCurrentPage.code)"
    ></DatePicker>
    <component
      class="content"
      :class="{ hidden: this.getUser.login === undefined }"
      :is="getCurrentPageLocal"
    ></component>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import Login from './login'
import Header from './header/header'
import DatePicker from './other/date.picker'
import Statistic from './statistic/statistic'
import StatisticKv from './statistic/statistic.kv'
import StatisticQuestion from './statistic/statistic.question'
import ClaimNumber from './other/claim.number'
import AddError from './other/add.error'
import AddErrorMultiple from './other/add.error.multiple'
import UserAdd from './user/add'
import UserCheck from './user/check'
import QuestionsAdd from './other/add.question'
import UserSettings from './auth/settings'

export default {
  name: 'AppIndex',
  data () {
    return {
      project: [
        {
          code: 'mk',
          name: 'Магнит Косметик',
          menu: [
            {
              name: 'Статистика',
              type: 'multiple',
              privacy: 0,
              submenu: [
                {
                  code: 'stat',
                  name: 'Общая',
                  privacy: 0,
                },
                {
                  code: 'stat_kv',
                  name: 'Статистика по КВ',
                  privacy: 2,
                },
                {
                  code: 'stat_question',
                  name: 'Статистика по вопросам',
                  privacy: 2,
                }
              ],
            },
            {
              name: 'Номера анкет',
              type: 'single',
              code: 'claim_number',
              privacy: 0,
            },
            // {
            //   name: 'Добавить ошибку',
            //   type: 'single',
            //   code: 'add_error',
            //   privacy: 2,
            // },
            {
              name: 'Добавить ошибки списком',
              type: 'single',
              code: 'add_error_multiple',
              privacy: 2,
            },
            {
              name: 'Пользователь',
              type: 'multiple',
              privacy: 3,
              submenu: [
                {
                  name: 'Добавить пользователя',
                  code: 'user_add',
                  privacy: 3,
                }
                // {
                //   name: 'Сверка',
                //   code: 'user_check',
                //   privacy: 3,
                // }
              ],
            },
            {
              name: 'Добавить вопросы',
              type: 'single',
              privacy: 3,
              code: 'questions_add',
            }
          ],
        }
      ],
    }
  },
  components: {
    Login,
    Header,
    DatePicker,
    Statistic,
    StatisticKv,
    StatisticQuestion,
    ClaimNumber,
    AddError,
    AddErrorMultiple,
    UserAdd,
    UserCheck,
    QuestionsAdd,
    UserSettings,
  },
  computed: {
    ...mapGetters(['getCurrentPage', 'getUser']),
    getCurrentPageLocal: function () {
      switch (this.getCurrentPage.code) {
        case 'stat': {
          document.title = 'Статистика'
          return 'Statistic'
        }
        case 'stat_kv': {
          document.title = 'Статистика по КВ'
          return 'StatisticKv'
        }
        case 'stat_question': {
          document.title = 'Статистика по вопросам'
          return 'StatisticQuestion'
        }
        case 'claim_number': {
          document.title = 'Анкеты с ошибками'
          return 'ClaimNumber'
        }
        case 'add_error': {
          document.title = 'Добавить ошибку'
          return 'AddError'
        }
        case 'add_error_multiple': {
          document.title = 'Добавить ошибки списком'
          return 'AddErrorMultiple'
        }
        case 'user_add': {
          document.title = 'Добавить пользователя'
          return 'UserAdd'
        }
        case 'user_check': {
          document.title = 'Сверка пользователей'
          return 'UserCheck'
        }
        case 'questions_add': {
          document.title = 'Добавить вопросы'
          return 'QuestionsAdd'
        }
        case 'user_settings': {
          document.title = 'Пользовательские настройки'
          return 'UserSettings'
        }
        default: {
          document.title = 'Авторизация'
          return 'Login'
        }
      }
    },
  },
  methods: mapActions(['setCurrentProject', 'setUser', 'setCurrentPage']),
}
</script>

<style lang="sass">
*
  margin: 0
  padding: 0
  box-sizing: border-box

.hidden
  visibility: hidden

.wrapper
  display: flex
  flex-flow: column nowrap

.content
  padding: 10px

#app
  font-family: Avenir, Helvetica, Arial, sans-serif
  -webkit-font-smoothing: antialiased
  -moz-osx-font-smoothing: grayscale
  text-align: center
  color: #2c3e50
  margin-top: 60px

.closed
  display: none

.black
  color: black

.green
  color: green

.red
  color: red
</style>
