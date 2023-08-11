import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '../views/Home.vue'
// 按需加载提交页，降低首屏 JS
const SubmitPlugin = () => import('../views/SubmitPlugin.vue')

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/submit',
    name: 'SubmitPlugin',
    component: SubmitPlugin
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
