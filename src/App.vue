<template>
  <n-config-provider
    :theme="theme"
    :theme-overrides="isDarkMode ? darkThemeOverrides : lightThemeOverrides"
    :hljs="highlightConfig.hljs"
  >
    <n-message-provider>
      <div class="app-container" :class="{ dark: isDarkMode }">
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
import { storeToRefs } from 'pinia'
import { darkTheme } from 'naive-ui'
import BackToTop from '@/components/ui/BackToTop.vue'
import { highlightConfig } from '@/utils/highlight'
import { lightThemeOverrides } from '@/utils/config/lightTheme'
import { darkThemeOverrides } from '@/utils/config/darkTheme'
import { usePluginStore } from '@/stores/plugins'
import { Analytics } from '@vercel/analytics/vue'
import { SpeedInsights } from '@vercel/speed-insights/vue'

const route = useRoute()
const store = usePluginStore()
const { isDarkMode, plugins } = storeToRefs(store)

const theme = computed(() => (isDarkMode.value ? darkTheme : null))
const isSubmitPage = computed(() => route.path === '/submit')

onMounted(() => {
  if (!plugins.value) {
    store.loadPlugins()
  }
})
</script>

<style>
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

.app-container {
  min-height: 100vh;
  background: var(--body-color, #f5f5f5);
  display: flex;
  flex-direction: column;
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