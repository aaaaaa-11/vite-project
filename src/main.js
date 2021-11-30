import { createApp } from 'vue'
import App from './App.vue'
import router from '@/router'
import store from '@/store'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'
import moment from 'moment'
import 'moment/dist/locale/zh-cn'
import './assets/less/index.less'
import './assets/less/theme.less'
import config from '../public/config'
moment.locale('zh-cn')

const app = createApp(App)

window.config = config

app.use(router)
app.use(store)
app.use(Antd )

app.mount('#app')
