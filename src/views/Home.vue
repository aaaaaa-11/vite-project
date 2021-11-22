<template>
  <div class="home-page fullscreen fullscreen-hidden">
    <router-view />
  </div>
</template>

<script>
export default {
  computed: {
  }
}
</script>

<style lang="less">
.home-page {
  background-color: @bgc;
}
</style>