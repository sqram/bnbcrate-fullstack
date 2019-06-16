<template>
  <v-app>
    <Nav />
    <Dialog :content='$store.state.dialogs.content' />
    <Nuxt />
  </v-app>
</template>

<script>
import Nav from '~/components/Nav'
import Dialog from '~/components/Dialog'
export default {
  components: {
    Nav,
    Dialog
  },

  
}
</script>

<style lang="stylus">
  h1, h2, h3, h4
    color $blue

  // Headline on top of each page
  // Extra padding bottom is to counter container's
  // top padding
  header
    text-align center
    margin 2em 0 3em 0

</style>
