<template>
  <div class="image-editor-page">
    <div class="img-list">
      <img class="img-item" :id="`img${index}`" :src="i" alt="" v-for="(i, index) in imgList" :key="index" @click="selectImg(i, index)">
    </div>
    <div class="tool-bar">
      <span class="text-left title">工具栏</span>
      <a-button @click="handleClick('rect')">矩形</a-button>
      <a-button @click="handleClick('zoomIn')">放大</a-button>
      <a-button @click="handleClick('zoomOut')">缩小</a-button>
      <a-button @click="handleClick('prev')">上一步</a-button>
      <a-button @click="handleClick('next')">下一步</a-button>
      <a-button @click="handleClick('clear')">清空</a-button>
      <a-button @click="handleClick('reload')">还原</a-button>
      <a-button @click="handleClick('export')">导出</a-button>
    </div>
    <div class="canvas-box">
      <canvas
        ref="canvas"
        id="img-editor"
        width="800"
        height="400"
      ></canvas>
      <a-spin tip="Loading..." class="loading" v-if="spinning"></a-spin>
    </div>
  </div>
</template>

<script>
import { fabric } from 'fabric'
import dayjs from 'dayjs'
// import {} from '@ant-design/icons-vue'
import catPic from '../cat.jpg'
const rectConfig = {
  stroke: '#ff00ff',
  fill: '',
  strokeWidth: 2
}
export default {
  data () {
    return {
      imgList: [
        catPic
      ],
      imgSrc: '',
      editType: 'drag',
      canvas: null,
      moving: false,
      recordTimer: null,
      spinning: false,
      mouseFrom: {
        x: 0,
        y: 0
      },
      mouseTo: {
        x: 0,
        y: 0
      },
      width: 800,
      height: 400,
      scaleX: 1,
      scaleY: 1,
      stateArr: [],
      stateIdx: -1
    }
  },
  created () {},
  computed: {},
  mounted () {
    this.initCanvas()
  },
  beforeUnmount () {
    this.initData()
  },
  methods: {
    initCanvas () {
      this.canvas = new fabric.Canvas(this.$refs.canvas)
      this.$nextTick(() => {
        this.canvas.on('mouse:down', this.onDown)
        this.canvas.on('mouse:move', this.onMove)
        this.canvas.on('mouse:up', this.onUp)
        this.canvas.on('after:render', this.record)
        this.canvas.on('selection:created', this.onSelect)
        this.canvas.on('selection:updated', this.onSelect)
        this.canvas.on('selection:cleared', this.onClearSelect)
      })
    },
    selectImg (src, index) {
      this.$message.success('选中图片')
      this.spinning = true
      this.initData()
      this.imgSrc = src
      this.drawImg(`img${index}`)
    },
    initData () {
      this.editType = 'drag'
      this.mouseFrom = { x: 0, y: 0 }
      this.mouseTo = { x: 0, y: 0 }
      clearTimeout(this.recordTimer)
      this.recordTimer = null
      this.scaleX = 1
      this.scaleY = 1
    },
    handleClick (type) {
      switch (type) {
        case 'rect':
          this.canvas.selection = false
          break
        case 'zoomIn':
          this.zoom(1)
          break
        case 'zoomOut':
          this.zoom(-1)
          break
        case 'next':
          this.tapHistoryBtn(1)
          break
        case 'prev':
          this.tapHistoryBtn(-1)
          break
        case 'export':
          this.export()
          break
        default:
          this.drag()
          break
      }
    },
    zoom (flag){
      let zoom = this.canvas.getZoom()
      if (flag > 0) {
        // 放大
        zoom *= 1.1
      } else {
        // 缩小
        zoom *= 0.9
      }
      // zoom 不能大于 20 不能小于0.01
      zoom = zoom > 20 ? 20 : zoom
      zoom = zoom < 0.01 ? 0.01 : zoom
      this.canvas.setZoom(zoom)
    },
    // 撤销 或 还原
    tapHistoryBtn (flag) {
      let stateIdx = this.stateIdx + flag
      // 判断是否已经到了第一步操作
      if (stateIdx < 0) return
      // 判断是否已经到了最后一步操作
      if (stateIdx >= this.stateArr.length) return
      if (this.stateArr[stateIdx]) {
        this.canvas.loadFromJSON(this.stateArr[stateIdx])
        if (this.canvas.getObjects().length > 0) {
          this.canvas.getObjects().forEach(item => {
            item.set('selectable', false)
          })
        }
        this.stateIdx = stateIdx
      }
    },
    drag (options) {
      this.editType = 'drag'
      const delta = new fabric.Point(options.e.movementX, options.e.movementY)
      this.canvas.relativePan(delta)
    },
    clearAll () {
      // 获取画布中的所有对象
      const children = this.canvas.getObjects()
      if (children.length > 0) {
      // 移除所有对象
        this.canvas.remove(...children)
      }
    },
    onDown (options) {
      // 记录鼠标起点
      this.moving = true
      this.mouseFrom.x = options.e.clientX - this.canvas._offset.left
      this.mouseFrom.y = options.e.clientY - this.canvas._offset.top
    },
    onMove (options) {
      // 记录终点坐标
      this.mouseTo.x = options.e.clientX - this.canvas._offset.left
      this.mouseTo.y = options.e.clientY - this.canvas._offset.top
      if (this.editType === 'drag' && this.moving) {
        this.drag(options)
      }
    },
    onUp (options) {
      this.moving = false
      if (this.editType === 'rect') {
        this.drawRect()
      }
    },
    onSelect (e) { // 监听选中画框时，联动右侧标签选中
      // this.$emit('rectSelected', e.target.id)
    },
    onClearSelect (e) { // 监听取消选中画框时，联动右侧标签取消选中
      // this.$emit('rectUnselected')
    },
    record () {
      this.canvas.toJSON(['id'])
      // setTimeout(() => {
      //   this.stateArr.push(JSON.stringify(canvas))
      //   this.stateIdx++
      // }, 500)
      if (this.recordTimer) {
        clearTimeout(this.recordTimer)
        this.recordTimer = null
      }
      this.recordTimer = setTimeout(() => {
        this.stateArr.push(JSON.stringify(this.canvas))
        this.stateIdx++
      }, 1000)
    },
    drawRect () {
      // 计算矩形长度
      const left = this.getTransformedPosX(this.mouseFrom.x)
      const top = this.getTransformedPosX(this.mouseFrom.y)
      const width = this.mouseTo.x - this.mouseFrom.x
      const height = this.mouseTo.y - this.mouseFrom.y
      const id = dayjs().format('YYYYMMDDHHmmssSSS')
      const canvasObj = new fabric.Rect({
        id,
        left,
        top,
        width,
        height,
        ...rectConfig
      })
      canvasObj.toObject = (function (toObject) {
        return function () {
          return fabric.util.object.extend(toObject.call(this), {
            id
          })
        }
      })(canvasObj.toObject)
      // const rect = {
      //   id: canvasObj.id,
      //   item: canvasObj,
      //   selectable: true
      // }
      // this.$emit('rectSelected', rect.id)
      // this.$store.commit('addRects', rect)
      this.canvas.add(canvasObj)
      this.editType = 'drag'
    },
    // 根据画布的移动缩放，处理相对画布的坐标
    getTransformedPosX (x) {
      const zoom = Number(this.canvas.getZoom())
      return (x - this.canvas.viewportTransform[4]) / zoom
    },
    getTransformedPosY (y) {
      const zoom = Number(this.canvas.getZoom())
      return (y - this.canvas.viewportTransform[5]) / zoom
    },
    drawImg (id) {
      this.canvas.setWidth(800)
      this.canvas.setHeight(400)
      const imgElement = document.getElementById(id) // 声明我们的图片
      if (imgElement.naturalWidth / imgElement.naturalHeight < (this.width / this.height)) {
        this.height = this.canvas.height
        this.width = imgElement.naturalWidth * this.canvas.height / imgElement.naturalHeight
      } else {
        this.width = this.canvas.width
        this.height = imgElement.naturalHeight * this.canvas.width / imgElement.naturalWidth
      }
      this.scaleX = this.width / imgElement.naturalWidth
      this.scaleY = this.height / imgElement.naturalHeight
      fabric.Image.fromURL(this.imgSrc, (img, err) => {
        this.spinning = false
        if (err) {
          this.canvas.setBackgroundColor('rgba(85, 107, 198, 0.6)', this.canvas.renderAll.bind(this.canvas))
        } else {
          this.canvas.setBackgroundImage(img, this.canvas.renderAll.bind(this.canvas), {
            scaleX: this.scaleX,
            scaleY: this.scaleY,
            crossOrigin: 'annoymous'
          })
        }
      })
    },
    export () {
      // 因为我们需要给初始视口区域外的部分添加背景色，所以通过克隆画布去实现，不修改原画布
      this.canvas.clone(cvs => {
        //遍历所有对对象，获取最小坐标，最大坐标，根据画布中图形的最小坐标与最大坐标计算导出内容的左上角坐标以及导出内容的宽高
        let top = 0
        let left = 0
        let width = this.canvas.width
        let height = this.canvas.height

        const objects = cvs.getObjects()
        if (objects.length > 0 ) {
          let rect = objects[0].getBoundingRect()
          let minX = rect.left
          let minY = rect.top
          let maxX = rect.left + rect.width
          let maxY = rect.top + rect.height
          for (let i = 1; i<objects.length; i++) {
            rect = objects[i].getBoundingRect()
            minX = Math.min(minX, rect.left)
            minY= Math.min(minY, rect.top)
            maxX = Math.max(maxX, rect.left + rect.width)
            maxY= Math.max(maxY, rect.top + rect.height)
          }
          // 给上下左右添加100px的间距，这样导出的图形不会刚好贴合最边缘的图形而是有一定的间隙。
          top = minY - 100
          left = minX - 100
          width = maxX - minX + 200
          height = maxY - minY + 200
          // 给当前画布添加颜色与背景色相同的矩形，解决初始视口外区域底色为透明的问题。
          cvs.sendToBack(new fabric.Rect({
            left,
            top,
            width,
            height,
            stroke: 'rgba(0,0,0,0)',
            fill: this.bgColor,
            strokeWidth: 0
          }))
        }
        // 将画布导出成base64格式数据
        const dataURL = cvs.toDataURL({
          format: 'png',
          multiplier: cvs.getZoom(),
          left,
          top,
          width,
          height
        })
        console.log(dataURL)
        return dataURL
      })
    }
  }
}
</script>

<style lang="less">
.image-editor-page {
  .img-list {
    padding: 20px;
    display: flex;
    .img-item {
      width: 100px;
      height: 100px;
    }
  }
  .tool-bar {
    display: flex;
    .title {
      margin-right: 50px;
    }
  }
}
</style>
