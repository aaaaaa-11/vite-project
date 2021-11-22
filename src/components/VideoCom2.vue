<template>
  <video ref="videoPlayer" class="video-js" data-setup='{}'>
    <!-- <source id='videoid' :src="videosrc" :type="type"> -->
  </video>
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
  mounted () {
    const self = this
    this.player = videojs(
      this.$refs.videoPlayer,
      this.options,
      function onPlayerReady () {
      }
    )
  },
  beforeMount () {
    this.stop()
  },
  methods: {
    stop () {
      this.player && this.player.dispose()
      this.player = null
    },
    play () {
      console.log(this.options)
      this.player = videojs(this.$refs.videoPlayer, this.options)
      this.player && this.player.src({
        src: this.url
      })
      setTimeout(() => {
        this.player && this.player.play().then(() => {
          console.log('ok');
        }).catch(() => {
          console.log('不支持自动播放');
        })
      }, 500)
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