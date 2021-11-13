<template>
  <div class="home-page fullscreen">
    <a-page-header :title="title" class="page-header"></a-page-header>
    <a-date-picker />
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  computed: {
    ...mapState(['title'])
  }
}
</script>

<style lang="less">
.page-header {
  font-size: @f;
}
</style>