<template>
  <div class="edit-box">
    <div class="head hover-active" @click="onAction">
      <a-popover title="原图" trigger="hover">
        <ReloadOutlined :style="{color:`${editType === 'reload' ? '#02a7f0' : ''}`}"/>
      </a-popover>
      <a-popover title="裁剪" trigger="hover">
        <ScissorOutlined v-if="!clip" :style="{color:`${editType === 'scissor' ? '#02a7f0' : ''}`}"/>
        <a-popconfirm
          v-else
          title="应用裁剪结果？"
          ok-text="确定"
          cancel-text="取消"
          @confirm="confirmCrop"
          @cancel="cancelCrop"
        >
          <ScissorOutlined :style="{color:`${editType === 'scissor' ? '#02a7f0' : ''}`}"/>
        </a-popconfirm>
      </a-popover>
      <a-popover title="拖拽" trigger="hover">
        <DragOutlined :style="{color:`${editType === 'drag' ? '#02a7f0' : ''}`}"/>
      </a-popover>
      <a-popover title="矩形" trigger="hover">
        <BorderOutlined :style="{color:`${editType === 'border' ? '#02a7f0' : ''}`}"/>
      </a-popover>
      <a-popover title="折线" trigger="hover">
        <StockOutlined :style="{color:`${editType === 'stock' ? '#02a7f0' : ''}`}"/>
      </a-popover>
      <a-popover title="下一步" trigger="hover">
          <RedoOutlined :style="{color:`${editType === 'redo' ? '#02a7f0' : ''}`}"/>
      </a-popover>
      <a-popover title="上一步" trigger="hover">
          <UndoOutlined :style="{color:`${editType === 'undo' ? '#02a7f0' : ''}`}"/>
      </a-popover>
      <a-popover title="放大" trigger="hover">
        <ZoomInOutlined :style="{color:`${editType === 'zoom-in' ? '#02a7f0' : ''}`}"/>
      </a-popover>
      <a-popover title="缩小" trigger="hover">
        <ZoomOutOutlined :style="{color:`${editType === 'zoom-out' ? '#02a7f0' : ''}`}"/>
      </a-popover>
      <a-popover title="清空" trigger="hover">
        <DeleteOutlined :style="{color:`${editType === 'delete' ? '#02a7f0' : ''}`}"/>
      </a-popover>
    </div>
    <div class="canvas-box">
      <canvas
        id="img-editor"
        width="800"
        height="400"
      ></canvas>
      <a-spin tip="Loading..." class="loading" v-if="spinning"></a-spin>
      <img :src="imgSrc" alt="图片" id="img" width="800px">
    </div>
  </div>
</template>

<script>
import { fabric } from 'fabric'
import { mapState } from 'vuex'
import { ReloadOutlined, ScissorOutlined, DragOutlined, BorderOutlined, StockOutlined, RedoOutlined, UndoOutlined, ZoomInOutlined, ZoomOutOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'
let canvas = null
let zoom = 1
let imgInstance = null
let clipPath = null
export default {
  name: 'EditBox',
  components: {
    ReloadOutlined,
    ScissorOutlined,
    DragOutlined,
    BorderOutlined,
    StockOutlined,
    RedoOutlined,
    UndoOutlined,
    ZoomInOutlined,
    ZoomOutOutlined,
    DeleteOutlined
  },
  props: {
    imgSrc: {
      type: String,
      default: ''
    },
  },
  computed: {
    ...mapState(['rects'])
  },
  data () {
    return {
      editType: 'tailor',
      spinning: false,
      mouseFrom: {
        x: 0,
        y: 0
      },
      mouseTo: {
        x: 0,
        y: 0
      },
      rectConfig: {
        stroke: '#ff00ff',
        fill: '',
        strokeWidth: 2
      },
      recordTimer: null,
      stateIdx: -1,
      stateArr: [], // 保存历史记录
      moving: false,
      clip: false,
      nowClip: {
        x: 0,
        y: 0
      },
      width: 800,
      height: 400
    }
  },
  created () {
  },
  mounted () {
    this.initCanvas()
    // const imgElement = document.getElementById('img') // 声明我们的图片
    // imgElement.onload = () => {
    //   this.drawImg()
    // }
  },
  watch: {
    imgSrc (newValue, oldValue) {
      if (newValue !== oldValue) {
        this.spinning = true
        setTimeout(() => {
          this.initData()
          this.drawImg()
        }, 300)
      }
    }
  },
  methods: {
    initCanvas () {
      canvas = new fabric.Canvas('img-editor')
      this.$nextTick(() => {
        canvas.on('mouse:down', this.onDown)
        canvas.on('mouse:move', this.onMove)
        canvas.on('mouse:up', this.onUp)
        // canvas.on('after:render', this.record)
        canvas.on('selection:created', this.onSelect)
        canvas.on('selection:updated', this.onSelect)
        canvas.on('selection:cleared', this.onClearSelect)
      })
    },
    initData () {
      this.$store.commit('clearRects')
      this.stateArr = []
      this.stateIdx = -1
      // clearTimeout(this.recordTimer)
      // this.recordTimer = null
      this.clip = false
      this.nowClip = {
        x: 0,
        y: 0
      }
      this.clearAll()
    },
    onSelect (e) { // 监听选中画框时，联动右侧标签选中
      this.$emit('rectSelected', e.target.id)
    },
    onClearSelect (e) { // 监听取消选中画框时，联动右侧标签取消选中
      this.$emit('rectUnselected')
    },
    selectRect (rect) { // 右侧标签聚焦时，对应画框选中
      const children = canvas.getObjects()
      const item = children.find(c => c.id === rect.id) // 查找当前选中的画框（防止回退后，对应画框没了）
      if (item) {
        canvas.setActiveObject(item)
        canvas.requestRenderAll()
      } else {
        this.$message.error('没有找到对应的画框')
        console.log(rect)
      }
    },
    record () {
      canvas.toJSON(['id'])
      setTimeout(() => {
        this.stateArr.push(JSON.stringify(canvas))
        this.stateIdx++
      }, 500)
      // if (this.recordTimer) {
      //   clearTimeout(this.recordTimer)
      //   this.recordTimer = null
      // }
      // this.recordTimer = setTimeout(() => {
      //   this.stateArr.push(JSON.stringify(canvas))
      //   this.stateIdx++
      // }, 1000)
    },
    onDown (options) {
      // 记录鼠标起点
      this.moving = true
      this.mouseFrom.x = options.e.clientX - canvas._offset.left
      this.mouseFrom.y = options.e.clientY - canvas._offset.top
    },
    onMove (options) {
      // 记录终点坐标
      this.mouseTo.x = options.e.clientX - canvas._offset.left
      this.mouseTo.y = options.e.clientY - canvas._offset.top
      if (this.editType === 'drag' && this.moving) {
        this.drag(options)
      }
    },
    onUp (options) {
      this.moving = false
      if (this.editType === 'border') {
        this.drawRect()
        this.record()
      }
    },
    onAction (e) {
      console.log(e.target.getAttribute('data-icon'))
      const type = e.target.getAttribute('data-icon')
      if (!type) return
      this.editType = type
      if (type === 'zoom-in') {
        this.zoom(1)
      }
      if (type === 'zoom-out') {
        this.zoom(-1)
      }
      if (type === 'redo') {
        this.tapHistoryBtn(1)
      }
      if (type === 'undo') {
        this.tapHistoryBtn(-1)
      }
      if (type === 'delete') {
        this.clearAll()
      }
      if (type === 'scissor') {
        this.crop()
      } else {
        this.clip = false
      }
      if (type === 'reload') {
        this.drawImg()
      }
    },
    confirmCrop () {
      const newImgCrop = clipPath.getBoundingRect()
      canvas.setWidth(newImgCrop.width)
      canvas.setHeight(newImgCrop.height)
      const x = newImgCrop.left + this.nowClip.x
      const y = newImgCrop.top + this.nowClip.y
      console.log(imgInstance)
      imgInstance.set({
        cropX: x,
        cropY: y,
        width: newImgCrop.width,
        height: newImgCrop.height
      })
      this.nowClip.x = x
      this.nowClip.y = y
      clipPath.set({
        left: 0,
        top: 0
      })
      clipPath.setCoords()
      canvas.renderAll()
      this.cancelCrop()
      this.record()
    },
    cancelCrop () {
      canvas.remove(clipPath) // 移除裁剪时添加的遮罩框
      this.clip = false
      imgInstance = null
      clipPath = null
    },
    crop () {
      if (!this.clip && !clipPath) { // 添加裁剪遮罩层（选择框）
        const imgEl = document.getElementById('img')
        canvas.setWidth(this.width)
        canvas.setHeight(this.height)
        clipPath = new fabric.Rect({
          width: this.width,
          height: this.height,
          fill: 'rgba(178, 178, 178, 0.4)'
        })
        canvas.add(clipPath)
        this.clip = true
      }
    },
    drag (options) {
      const delta = new fabric.Point(options.e.movementX, options.e.movementY)
      canvas.relativePan(delta)
      // if (this.recordTimer) {
      //   clearTimeout(this.recordTimer)
      //   this.recordTimer = null
      // }
      // this.recordTimer = setTimeout(this.record, 100)
      // const vpt = canvas.viewportTransform
      // // 通过计算鼠标的距离修改视口左上角的坐标
      // vpt[4] += this.mouseTo.x - this.mouseFrom.x
      // vpt[5] += this.mouseTo.y - this.mouseFrom.y
      // // 视口坐标修改完成后对画布进行重新渲染
      // canvas.requestRenderAll()
    },
    zoom (flag) {
      if (flag > 0) {
        // 放大
        zoom *= 1.1
      } else {
        zoom *= 0.9
      }
      // 限制缩放范围
      zoom = zoom > 20 ? 20 : zoom
      zoom = zoom < 0.01 ? 0.01 : zoom
      canvas.setZoom(zoom)
    },
    // 撤销/还原
    tapHistoryBtn (flag) {
      const stateIdx = this.stateIdx + flag
      if (stateIdx < 0) {
        this.$message.warn('已经是第一步了')
        return
      }
      if (stateIdx >= this.stateArr.length) {
        this.$message.warn('已经是最后一步了')
        return
      }
      if (this.stateArr[stateIdx]) {
        canvas.loadFromJSON(this.stateArr[stateIdx], () => {
          const children = canvas.getObjects()
          this.rects.map(r => { // 如果标签对应的画框还在，则可选，否则不可选
            const rect = children.find(c => r.id === c.id)
            r.selectable = rect ? true : false
          })
          // if (children.length > 0) {
          //   children.forEach(i => {
          //     i.set('selectable', false)
          //   })
          // }
          this.stateIdx = stateIdx
        })
      }
    },
    drawRect () {
      // 计算矩形长度
      let left = this.getTransformedPosX(this.mouseFrom.x)
      let top = this.getTransformedPosX(this.mouseFrom.y)
      let width = this.mouseTo.x - this.mouseFrom.x
      let height = this.mouseTo.y - this.mouseFrom.y
      const id = dayjs().format('YYYYMMDDHHmmssSSS')
      const canvasObj = new fabric.Rect({
        id,
        left,
        top,
        width,
        height,
        ...this.rectConfig
      })
      canvasObj.toObject = (function (toObject) {
        return function () {
          return fabric.util.object.extend(toObject.call(this), {
            id
          })
        }
      })(canvasObj.toObject)
      const rect = {
        id: canvasObj.id,
        item: canvasObj,
        selectable: true
      }
      this.$emit('rectSelected', rect.id)
      this.$store.commit('addRects', rect)
      canvas.add(canvasObj)
      this.editType = 'tailor'
    },
    drawImg () {
      // console.log('drawimg')
      const imgElement = document.getElementById('img') // 声明我们的图片
      // imgElement.onload = () => {
      //   // this.width = canvas.width
      //   // this.height = Number((imgElement.naturalHeight / imgElement.naturalWidth * canvas.width).toFixed(0))
        
      // }
      // if (imgElement.naturalWidth / imgElement.naturalHeight < 2) {
      //   this.height = canvas.height
      //   this.width = imgElement.naturalWidth * canvas.height / imgElement.naturalHeight
      // } else {
      //   this.width = canvas.width
      //   this.height = imgElement.naturalHeight * canvas.width / imgElement.naturalWidth
      // }
      // this.spinning = false
      // canvas.add(imgInstance)
      // this.record()
      fabric.Image.fromURL(this.imgSrc, (img, err) => {
        this.spinning = false
        if (err) {
          canvas.setBackgroundColor('rgba(85, 107, 198, 0.6)', canvas.renderAll.bind(canvas))
        } else {
          if (img.width / img.height < 2) {
            this.height = canvas.height
            this.width = img.width * canvas.height / img.height
          } else {
            this.width = canvas.width
            this.height = img.height * canvas.width / img.width
          }
          imgInstance = new fabric.Image(imgElement, {
            zIndex: -1,
            scaleX: this.width / imgElement.naturalWidth,
            scaleY: this.height / imgElement.naturalHeight,
            selectable: false
          })
          canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
            scaleX: this.width / img.width,
            scaleY: this.height / img.height,
            crossOrigin: 'annoymous'
          })
        }
        this.record()
      })
    },
    clearAll () {
      const children = canvas.getObjects()
      if (children.length > 0) {
        canvas.remove(...children)
        this.record()
      }
    },
    // 根据画布的移动缩放，处理相对画布的坐标
    getTransformedPosX (x) {
      const zoom = Number(canvas.getZoom())
      return (x - canvas.viewportTransform[4]) / zoom
    },
    getTransformedPosY (y) {
      const zoom = Number(canvas.getZoom())
      return (y - canvas.viewportTransform[5]) / zoom
    }
  }
}
</script>

<style lang="less" scoped>
.edit-box {
  flex: 1;
  border-right: 1px solid #ddd;
  display: flex;
  flex-direction: column;
  .head {
    height: 40px;
    background-color: #f7f7f7;
    width: 100%;
    border-bottom: 1px solid #ddd;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    span {
      margin: 8px;
      padding: 2px;
      cursor: pointer;
      position: relative;
    }
  }
  .canvas-box {
    flex: 1;
    position: relative;
    #img-editor {
      cursor: pointer;
    }
    .loading {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      height: 100%;
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background-color: rgba(0, 0, 0, 0.1);
      transition: all 0.3s cubic-bezier(0.78, 0.14, 0.15, 0.86)!important;
    }
  }
}
</style>