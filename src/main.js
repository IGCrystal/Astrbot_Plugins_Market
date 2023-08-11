import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { create, NConfigProvider } from 'naive-ui'
import App from './App.vue'
import './assets/theme.css'
import router from './router'
import { highlightConfig } from './plugins/highlight'

// 创建 naive-ui 实例
const naive = create({
  components: [NConfigProvider],
})

const app = createApp(App)

// 使用 naive-ui
app.use(naive)
app.use(createPinia())
app.use(router)

app.mount('#app')
