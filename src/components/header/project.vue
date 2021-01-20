<template>
  <div class="project_button">
    <div
      class="button_wrapper"
      @click="menuToggle"
    >
      <span class="project_text">
        <img class="logo" src="mk.jpg" alt="" />
        {{ getCurrentProject.name }}
      </span>
    </div>
    <div
      class="menu"
      :class="{closed: !opened}"
    >
      <div
        class="menu_item"
        v-for="(item, index) in project"
        :key="index"
        :item="item"
        @click="setCurrentProjectLocal(item)"
      >
        <img class="logo" src="mk.jpg" alt="" />
        <span class="item_text">{{ item.name }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'Project',
  props: ['project'],
  data: function () {
    return {
      opened: false,
    }
  },
  computed: mapGetters(['getCurrentProject']),
  methods: {
    ...mapActions(['setCurrentProject']),
    menuToggle: function () {
      this.opened = !this.opened
    },
    setCurrentProjectLocal: function (item) {
      this.opened = false
      this.setCurrentProject(item)
    },
  },
}
</script>

<style scoped lang="sass">
.logo
  max-width: 24px

.button_wrapper
  font-size: 30px
  padding: 20px
  display: flex
  flex-flow: row nowrap
  justify-content: space-between

.menu
  position: absolute
  z-index: 16
  background: white
  font-size: 20px

.menu_item
  padding: 10px
  margin: 5px
  border: 1px solid lightgrey
</style>
