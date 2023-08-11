import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  base: './',  // 使用相对路径，这样本地和 GitHub Pages 都能正常工作
  assetsInclude: ['**/*.md'],  // 允许导入 Markdown 文件
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'pinia', 'naive-ui'],
          icons: ['@vicons/ionicons5'],
          markdown: ['marked']
        }
      }
    }
  },
  server: {
    host: '0.0.0.0',  // 允许局域网访问
    port: 3000  // 指定端口号
  }
})
