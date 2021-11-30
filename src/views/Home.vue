<template>
  <div class="home-page fs12 fullscreen">
    <h3 class="fs18">{{title}}</h3>
    <a-button @click="changeTheme('blue')" class="fs14">切换主题（蓝）</a-button>
    <a-button @click="changeTheme('green')" class="fs14">切换主题（绿）</a-button>
    <a-button @click="changeTheme('elder')" class="fs14">长辈版</a-button>
    <a-button @click="changeTheme('normal')" class="fs14">普通版</a-button>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  computed: {
    ...mapState(['title'])
  },
  methods: {
    changeTheme (theme) {
      if (window.config.ableChangeTheme) {
        const el = document.getElementById('themeBody')
        el && el.setAttribute('class', 'theme-' + theme)
      }
    }
  }
}
</script>

<style lang="less">
</style>