import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'

const routes = [
  {
    name: 'home',
    path: '/',
    component: Home,
    redirect: {
      name: 'changePageSize'
    },
    children: [
      {
        name: 'changePageSize',
        path: 'changePageSize',
        component: () => import('../views/ChangePageSize.vue')
      },
      {
        name: 'imageEditor',
        path: 'imageEditor',
        component: () => import('../views/ImageEditor/Index.vue')
      }
    ]
  }
]

export default createRouter({
  routes,
  history: createWebHashHistory()
})
