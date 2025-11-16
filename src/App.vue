<template>
  <n-config-provider
    :theme="theme"
    :theme-overrides="isDarkMode ? darkThemeOverrides : lightThemeOverrides"
    :hljs="highlightConfig.hljs"
  >
    <n-global-style />
    <n-message-provider>
      <div
        v-if="!isNaiveHydrated"
        class="hydration-gradient"
        aria-hidden="true"
      ></div>
      <div
        class="app-container"
        :class="{ dark: isDarkMode, 'app-container--hidden': !isNaiveHydrated }"
        :style="containerStyle"
      >
        <BackToTop v-if="!isSubmitPage" />
        <NuxtPage />
      </div>
    </n-message-provider>
  </n-config-provider>
  <Analytics />
  <SpeedInsights />
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from '#vue-router'
import { useHead } from '#imports'
import { storeToRefs } from 'pinia'
import { darkTheme } from 'naive-ui'
import BackToTop from '@/components/ui/BackToTop.vue'
import { highlightConfig } from '@/utils/highlight'
import { lightThemeOverrides } from '@/utils/config/lightTheme'
import { darkThemeOverrides } from '@/utils/config/darkTheme'
import { usePluginStore } from '@/stores/plugins'
import { Analytics } from '@vercel/analytics/vue'
import { SpeedInsights } from '@vercel/speed-insights/vue'
import { useNaiveHydration } from '@/composables/useNaiveHydration'

const route = useRoute()
const store = usePluginStore()
const { isDarkMode, plugins } = storeToRefs(store)
const { isNaiveHydrated } = useNaiveHydration()

const containerStyle = computed(() => (
  isNaiveHydrated.value
    ? undefined
    : {
        visibility: 'hidden',
        pointerEvents: 'none'
      }
))

const theme = computed(() => (isDarkMode.value ? darkTheme : null))
const isSubmitPage = computed(() => route.path === '/submit')

const themeInitScript = `!function(){try{var t='theme-preference',e='data-theme',n=document.documentElement,r=document.body||document.getElementsByTagName('body')[0],o=function(i){i==='dark'?(n.classList.add('dark'),r&&r.classList.add('dark')):(n.classList.remove('dark'),r&&r.classList.remove('dark')),n.setAttribute(e,i)};var a=function(){var i=document.cookie.match(/(?:^|; )theme-preference=([^;]+)/);return i?decodeURIComponent(i[1]):null}();var l=null;try{l=window.localStorage.getItem(t)}catch(i){}var s=l||a;!s&&window.matchMedia&&(s=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');o(s==='dark'?'dark':'light')}catch(t){}}();`

useHead({
  script: [
    {
      key: 'theme-init',
      innerHTML: themeInitScript,
      tagPosition: 'head',
      tagPriority: 'critical'
    }
  ],
  __dangerouslyDisableSanitizersByTagID: {
    'theme-init': ['innerHTML']
  }
})

onMounted(() => {
  if (!plugins.value) {
    store.loadPlugins()
  }
})
</script>

<style>
body {
  margin: 0;
  font-family: "Lexend", "Noto Sans SC", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

html.hydration-lock,
html.hydration-lock body,
body.hydration-lock {
  overflow: hidden;
}

.app-container {
  min-height: 100vh;
  background: var(--body-color, #f5f5f5);
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
}

.app-container--hidden {
  visibility: hidden;
  pointer-events: none;
}

.hydration-gradient {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.main-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

@keyframes gridAppear {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.plugins-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 28px;
  padding: 20px;
  max-width: 100%;
  margin: 0 auto;
  animation: gridAppear 0.3s ease-out;
  animation-delay: 0.7s;
  animation-fill-mode: backwards;
}

@media (max-width: 768px) {
  .app-container {
    padding: 0;
  }
  
  .plugins-grid {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 16px;
  }
}
</style>
