<template>
  <div class="loading"></div>
</template>

<script>
export default {
  
}
</script>

<style lang="stylus" scoped>
.loading {
    margin: 0 auto;
    border-radius: 50%;
    width: 150px
    height: 150px;
    border: 1rem solid #ccc
    border-top-color: #389AB9;
    animation: spins 1s infinite linear;

  }


  @keyframes spins {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>

