import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'

const routes = [
  {
    name: 'home',
    path: '/',
    component: Home
  }
]

export default createRouter({
  routes,
  history: createWebHashHistory()
})
