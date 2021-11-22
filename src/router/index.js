import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '@/views/Home.vue'

const routes = [
  {
    name: 'home',
    path: '/',
    component: Home,
    redirect: {
      name: 'video'
    },
    children: [
      {
        name: 'video',
        path: '/video',
        component: () => import('@/views/Video/Index.vue')
      }
    ]
  }
]

export default createRouter({
  routes,
  history: createWebHashHistory()
})
