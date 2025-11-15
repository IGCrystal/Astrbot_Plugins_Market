import { defineNuxtPlugin } from 'nuxt/app'
import naive from 'naive-ui'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(naive)
})
