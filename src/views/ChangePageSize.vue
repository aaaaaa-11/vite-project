<template>
  <div class="change-page-size-page fullscreen">
    <img src="./cat.jpg" alt="" id="container" class="container">
    <div class="content">
      宽度：<a-input-number v-model:value="width"></a-input-number>
      高度：<a-input-number v-model:value="height"></a-input-number>
      宽 / 高<p>{{height ? (width / height).toFixed(2) : '-'}}</p>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
export default {
  data () {
    return {
      width: document.documentElement.offsetWidth, // 默认显示视口宽高
      height: document.documentElement.offsetHeight
    }
  },
  computed: {
    ...mapState(['title'])
  },
  watch: {
    width (val) {
      const el = document.getElementById('container')
      if (el) {
        el.style.width = val + 'px'
      }
    },
    height (val) {
      const el = document.getElementById('container')
      if (el) {
        el.style.height = val + 'px'
      }
    }
  }
}
</script>

<style lang="less">
.change-page-size-page {
  position: relative;
  .content {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: auto;
    width: 20%;
    height: 200px;
  }
  .container {
    width: 100%;
    height: 100%;
  }
}
</style>