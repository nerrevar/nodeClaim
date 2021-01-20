<template>
  <div class="wrapper">
    <span class="header2">{{ collectionName }}</span>
    <div
      class="document"
      v-for="(doc, index) in docs"
      :key="index"
    >
      <div
        class="property"
        v-for="(value, index) in doc"
        :key="index"
      >
        <span class="index">{{ index }}</span>
        <span>: {{ value }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CollectionDetails',
  props: ['collectionName'],
  data () {
    return {
      docs: [],
    }
  },
  created () {
    fetch(
      '/admin/collections',
      {
        method: 'POST',
        mode: 'same-origin',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ collectionName: this.collectionName }),
      }
    ).then(
      response => response.json()
    ).then(
      response => {
        if (response.status === 11)
          this.docs = response.documents
      }
    )
  },
}
</script>

<style lang="sass" scoped>
.header2
  font-size: 1.4em
  padding: 0.1em

.document
  padding: 0.3em
  border: 1px dotted lightgrey

.index
  display: inline-block
  width: 200px
</style>
