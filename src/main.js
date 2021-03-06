import { createApp } from 'vue'
import App from './App.vue'
import router from '@/router'
import store from '@/store'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'
import moment from 'moment'
import 'moment/dist/locale/zh-cn'
moment.locale('zh-cn')
import './assets/less/index.less'

const app = createApp(App)

app.use(router)
app.use(store)
app.use(Antd )

app.mount('#app')
