import { defineNuxtConfig } from 'nuxt/config'

const runtimeEnv = (globalThis as {
  process?: { env?: Record<string, string | undefined> }
}).process?.env ?? {}

const nitroPreset = runtimeEnv.NITRO_PRESET ?? (runtimeEnv.VERCEL ? 'vercel' : 'node-server')

export default defineNuxtConfig({
  srcDir: 'src',
  modules: ['@pinia/nuxt', 'nuxtjs-naive-ui'],
  css: ['@/assets/theme.css'],
  imports: {
    dirs: ['stores']
  },
  build: {
    transpile: ['@giscus/vue', 'naive-ui', 'vueuc', '@css-render/vue3-ssr']
  },
  vite: {
    ssr: {
      noExternal: ['naive-ui', 'vueuc']
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) {
              return undefined
            }

            if (id.includes('naive-ui') || id.includes('vueuc')) {
              return 'ui-vendor'
            }

            if (id.includes('@vicons')) {
              return 'icons'
            }

            if (id.includes('highlight.js')) {
              return 'code-highlight'
            }

            if (id.includes('@giscus')) {
              return 'comments'
            }

            return 'vendor'
          }
        }
      }
    }
  },
  nitro: {
    preset: nitroPreset
  }
})