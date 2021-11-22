<template>
  <div class="video-page fullscreen">
    <div class="content flex flex-column flex-column-between">
      <div class="input-wrap flex flex-align f18">
        <a-input class="btn btn-white input f18" placeholder="播放地址" v-model:value="input"></a-input>
        <a-select class="type-select f18 btn btn-white" placeholder="类型选择" v-model:value="type" :options="types"></a-select>
        <a-button class="btn btn-green play-btn" @click="play">播放</a-button>
      </div>
      <div class="video-wrap">
        <video-com ref="video" v-show="" :options="videoOptions" />
      </div>
    </div>
  </div>
</template>

<script>
import VideoCom from '../../components/VideoCom.vue'
export default {
  components: { VideoCom },
  data () {
    return {
      input: '',
      type: 'video/mp4',
      playing: false,
      videoOptions: {
        liveui: true,
        muted: true,
				autoplay: true,
				controls: true,
				sources: [
					{
						src: '',
            type: ''
					}
				]
			},
      types: [
        {
          label: 'm3u8',
          value: 'application/x-mpegURL'
        },
        {
          label: 'mp4',
          value: 'video/mp4'
        },
        {
          label: 'flv',
          value: 'rtmp/flv'
        }
      ]
    }
  },
  methods: {
    play () {
      this.stop()
      this.$nextTick(() => {
        this.$refs.video.url = 'http://vjs.zencdn.net/v/oceans.mp4'
        this.$refs.video.type = this.type
        this.$refs.video.play()
      })
      setTimeout(() => {
        this.$refs.video.url = 'https://media.w3.org/2010/05/sintel/trailer.mp4'
        this.$refs.video.play()
      }, 3000)
    },
    stop () {
      this.videoOptions.sources[0].src = ''
      this.videoOptions.sources[0].type = ''
      this.playing = false
    }
  }
}
</script>

<style lang="less">
.video-page {
  padding: 10vh 0 20vh;
  .content {
    width: 40%;
    min-width: 800px;
    height: 100%;
    margin: auto;
    .input-wrap {
      height: 50px;
      .type-select .ant-select-selector {
        border-radius: @borderRadius;
        border: none;
        height: 50px;
        line-height: 50px;
      }
      .input {
        flex: 1;
      }
      .type-select {
        width: 100px;
        margin: 0 10px;
        .ant-select-selection-item {
          line-height: 50px;
        }
      }
      .play-btn {
        width: 100px;
      }
    }
    .video-wrap {
      width: 100%;
      margin-top: 20px;
      flex: 1;
      border: 1px solid;
      border-radius: @borderRadius;
      padding: 10px;
    }
  }
}
</style>