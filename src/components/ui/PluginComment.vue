<template>
  <div class="plugin-comment">
    <div class="plugin-comment__header">
    </div>
    <div
      class="giscus"
      ref="giscusRef"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'

const props = withDefaults(defineProps<{
  repo: string
  theme?: 'light' | 'dark'
  pluginName: string
}>(), {
  theme: 'light'
})

const giscusRef = ref<HTMLDivElement | null>(null)

// 加载 Giscus
function loadGiscus() {
  if (!giscusRef.value) return

  const iframe = giscusRef.value.querySelector('iframe')
  if (iframe) {
    iframe.remove()
  }

  const script = document.createElement('script')
  script.src = 'https://giscus.app/client.js'
  script.setAttribute('data-repo', 'Neo-Life/AAA_Neko')
  script.setAttribute('data-repo-id', 'R_kgDOQFHosg')
  script.setAttribute('data-category', 'General')
  script.setAttribute('data-category-id', 'DIC_kwDOQFHoss4Cxt7u')
  script.setAttribute('data-mapping', 'specific')
  script.setAttribute('data-term', `plugin:${props.pluginName}`)
  script.setAttribute('data-strict', '1')
  script.setAttribute('data-reactions-enabled', '1')
  script.setAttribute('data-emit-metadata', '0')
  script.setAttribute('data-input-position', 'bottom')
  script.setAttribute('data-theme', props.theme === 'dark' ? 'dark_tritanopia' : 'light_tritanopia')
  script.setAttribute('data-lang', 'zh-CN')
  script.setAttribute('data-loading', 'lazy')
  script.crossOrigin = 'anonymous'
  script.async = true

  giscusRef.value.appendChild(script)
}

watch(() => props.theme, () => {
  loadGiscus()
})

watch(() => props.pluginName, () => {
  nextTick(() => {
    loadGiscus()
  })
})

const updateGiscusTheme = (theme: 'light' | 'dark') => {
  const iframe = document.querySelector<HTMLIFrameElement>('iframe.giscus-frame')
  const contentWindow = iframe?.contentWindow
  if (!contentWindow) return

  contentWindow.postMessage({
    giscus: {
      setConfig: {
        theme: theme === 'dark' ? 'dark_tritanopia' : 'light_tritanopia'
      }
    }
  }, 'https://giscus.app')
}

onMounted(() => {
  loadGiscus()
})

watch(() => props.theme, (newTheme) => {
  nextTick(() => {
    updateGiscusTheme(newTheme)
  })
}, { immediate: false })
</script>

<style scoped>
.plugin-comment {
  margin: var(--modal-padding) calc(-1 * var(--modal-padding));
  padding: var(--modal-padding);
  border-top: 1px solid var(--n-border-color);
  background-color: var(--n-color);
}

.plugin-comment__header {
  margin-bottom: 16px;
}

.plugin-comment__header :deep(h3) {
  margin: 0;
}

.giscus {
  margin-top: 16px;
}
</style>
