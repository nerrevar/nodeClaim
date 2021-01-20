<template>
  <div class="wrapper">
    <span>Год: </span>
    <select
      id="year"
      :value="(new Date()).getFullYear()"
      @change="dateChange"
    >
      <option>2020</option>
      <option>2021</option>
      <option>2022</option>
    </select>
    <span>Месяц: </span>
    <select
      id="month"
      :value="(new Date()).getMonth()"
      @change="dateChange"
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
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'DatePicker',
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
    }
  },
  methods: {
    ...mapActions(['setDate']),
    dateChange () {
      this.setDate({
        month: document.getElementById('month').value,
        year: document.getElementById('year').value,
      })
    },
  },
}
</script>

<style scoped lang="sass">
.wrapper
  display: flex
  flex: 0 0
  flex-flow: row nowrap
  margin: 5px 0 20px 0
  align-items: center

input
  margin: 0 10px 0 5px
</style>
