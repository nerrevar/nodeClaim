<template>
  <form>
    <label for="name">ФИО</label>
    <input type="text" id="name" name="name" />
    <label for="username">Имя пользователя</label>
    <input type="text" id="login" name="login" />
    <select id="project">
      <option
        v-for="(item, index) in projects"
        :item="item"
        :key="index"
        :value="item.code"
      >
        {{ item.name }}
      </option>
    </select>
    <label for="group">Группа</label>
    <input type="text" id="group" list="groupList" />
    <label for="role">Роль</label>
    <select
      id="role"
      value="kv"
      @change="changeRole($event.target.value)"
    >
      <option
        v-for="(role, index) in roles"
        :key="index"
        :value="role"
        :role="role"
      >
        {{ role }}
      </option>
    </select>
    <p
      v-if="isCaptainSelected"
    >
      Капитан команды:
    </p>
    <input
      type="text"
      list="groupList"
      id="captain"
      v-if="isCaptainSelected"
    />
    <datalist id="groupList">
      <option
        v-for="(group, index) in groups"
        :key="index"
        :value="group"
        :group="group"
      >
        {{ group }}
      </option>
    </datalist>
    <button
      @click="addUser($event)"
    >
      Добавить
    </button>
    <div
      class="response_status"
      v-if="response.status !== undefined"
    >
      <span
        :class="{green: response.status === 40, red: response.status === 114}"
      >
        {{ response.text }}
      </span>
    </div>
  </form>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'UserAdd',
  data () {
    return {
      projects: [],
      groups: [],
      roles: ['kv', 'captain', 'view', 'work'],
      response: {},
      isCaptainSelected: false,
    }
  },
  computed: mapGetters(['getCurrentProject']),
  methods: {
    addUser (e) {
      e.preventDefault()
      this.$fetch(
        '/api',
        {
          target: 'addUser',
          projectCode: document.getElementById('project').value,
          user: {
            name: document.getElementById('name').value.trim(),
            login: document.getElementById('login').value.trim(),
            project: [{
              code: document.getElementById('project').value,
              group: document.getElementById('group').value,
              role: document.getElementById('role').value,
              captain: document.getElementById('role').value === 'captain' ? document.getElementById('captain').value : '',
            }],
          },
        }
      ).then(
        response => response.json()
      ).then(
        response => {
          this.response = response
          setTimeout(
            () => {
              this.response = {}
            },
            10000
          )
        }
      )
    },
    changeRole (val) {
      if (val === 'captain')
        this.isCaptainSelected = true
      else
        this.isCaptainSelected = false
    },
  },
  created () {
    this.$parent.project.map(p => this.projects.push({ code: p.code, name: p.name }))
    this.$fetch(
      '/api',
      {
        target: 'getGroups',
        projectCode: this.getCurrentProject.code,
      }
    ).then(
      response => response.json()
    ).then(
      response => this.groups = response.groups
    )
  },
}
</script>

<style lang="sass" scoped>
form
  display: flex
  flex: 1 0
  flex-flow: column nowrap
  padding: 10px

input, select, button
  width: 50%
  margin: 10px 0
</style>
