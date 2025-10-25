import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import sitemap from 'vite-plugin-sitemap'
import externalSitemaps from './sitemaps.config.js'

export default defineConfig({
  plugins: [
    vue(),
    sitemap({
      hostname: process.env.VITE_SITE_URL || 'https://plugins.astrbot.app',
      dynamicRoutes: ['/submit'],
      externalSitemaps,
      generateRobotsTxt: true,
      readable: true
    })
  ],
  base: './',
  assetsInclude: ['**/*.md'],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src')
    }
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          const rel = id.split('node_modules/')[1];
          const parts = rel.split('/');
          const pkg = parts[0].startsWith('@') ? `${parts[0]}/${parts[1]}` : parts[0];

          if (pkg === 'vue' || pkg === 'vue-router') return 'vue';
          if (pkg === 'pinia') return 'pinia';
          if (pkg === 'naive-ui') return 'naive';
          if (pkg.startsWith('@vicons')) return 'icons';
          if (pkg === 'highlight.js') return 'hljs';
          if (pkg === 'axios') return 'axios';
          if (pkg === 'marked') return 'markdown';
          return 'vendor';
        }
      }
    }
  },
  server: {
    host: '0.0.0.0',
    port: 3000
  }
})
