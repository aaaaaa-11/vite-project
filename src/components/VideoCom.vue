<template>
  <video ref="videoPlayer" class="video-js" controls data-setup='{}'></video>
</template>

<script>
import videojs from 'video.js'
import 'video.js/dist/video-js.css'
export default {
  props: {
    options: {
      type: Object,
      default () {
        return {}
      }
    }
  },
  data () {
    return {
      player: null,
      url: '',
      type: ''
    }
  },
  beforeUnmount () {
    this.stop()
  },
  methods: {
    initPlayer () {
      this.player = videojs(
        this.$refs.videoPlayer,
        this.options,
        function onPlayerReady () {
        }
      )
      // setTimeout(() => {
      //   console.log(this.player.play)
      //   this.player && this.player.play().then(() => {
      //     console.log('ok')
      //   }).catch(e => {
      //     console.log('不支持自动播放')
      //   })
      // }, 500)
    },
    stop () {
      this.player && this.player.dispose()
      this.player = null
    }
  }
}
</script>

<style lang="less" scoped>
.video-js {
  width: 100%;
  height: 100%;
}
</style>