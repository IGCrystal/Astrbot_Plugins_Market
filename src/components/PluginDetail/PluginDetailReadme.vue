<template>
  <div class="detail-readme">
    <h2 class="section-title">插件说明</h2>
    <div v-if="props.isReadmeLoading" class="detail-readme__state">
      <n-spin size="medium">
        <template #description>正在加载 README...</template>
      </n-spin>
    </div>
    <div v-else-if="props.readmeError" class="detail-readme__state">
      <n-empty description="加载 README 失败">
        <template #extra>
          <n-button size="small" @click="emitRefresh">重试</n-button>
        </template>
      </n-empty>
    </div>
    <div v-else-if="props.isReadmeUnavailable" class="detail-readme__state detail-readme__state--muted">
      <n-empty description="插件未提供 README" />
    </div>
        <article
          v-else
          class="markdown-content"
          v-html="processedReadmeHtml"
        ></article>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NButton, NEmpty, NSpin } from 'naive-ui'

interface Props {
  readmeHtml: string
  isReadmeLoading: boolean
  readmeError: Error | null | undefined
  isReadmeUnavailable: boolean
  assetBaseUrl?: string | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'refresh'): void
}>()

const emitRefresh = () => {
  emit('refresh')
}

const normalizedAssetBaseUrl = computed(() => {
  const base = props.assetBaseUrl?.trim()
  if (!base) return null
  return base.endsWith('/') ? base : `${base}/`
})

const processedReadmeHtml = computed(() => {
  const html = props.readmeHtml || ''
  const baseUrl = normalizedAssetBaseUrl.value
  if (!baseUrl) return html

  return html.replace(/(<img\b[^>]*?\ssrc=)(["'])([^"']+)(\2)/gi, (match, prefix, quote, value) => {
    const src = value.trim()
    if (!src || src.startsWith('#')) return match
    if (/^(?:[a-z][a-z0-9+\-.]*:|\/\/)/i.test(src)) return match
    if (src.startsWith('data:')) return match

    const normalizedSrc = src.startsWith('/') ? src.slice(1) : src
    try {
      const resolved = new URL(normalizedSrc, baseUrl).toString()
      return `${prefix}${quote}${resolved}${quote}`
    } catch {
      return `${prefix}${quote}${baseUrl}${normalizedSrc}${quote}`
    }
  })
})
</script>

<style scoped>
.detail-readme {
  margin-top: 32px;
  background: var(--n-color);
  border: 2px solid var(--primary-color);
  border-radius: 16px;
  padding: 24px;
}

.section-title {
  margin: -24px -24px 20px;
  font-size: 20px;
  font-weight: 600;
  color: var(--text-color-1);
  padding: 16px 24px;
  background: rgba(148, 163, 184, 0.12);
  border-radius: 16px 16px 0 0;
  border-bottom: 1px solid var(--border-base);
}

.detail-readme__state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.detail-readme__state--muted {
  color: var(--text-color-3);
}

.markdown-content {
  color: var(--text-color-2);
  line-height: 1.7;
  word-break: break-word;
}

.markdown-content :deep(p) {
  margin: 0 0 1.1em;
}

.markdown-content :deep(a) {
  color: var(--primary-color);
  text-decoration: none;
  transition: color 0.2s ease;
}

.markdown-content :deep(a:hover) {
  text-decoration: underline;
}

.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4),
.markdown-content :deep(h5),
.markdown-content :deep(h6) {
  color: var(--text-color-1);
  font-weight: 600;
  line-height: 1.3;
  margin: 1.6em 0 0.8em;
}

.markdown-content :deep(h1) {
  font-size: 28px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.4em;
}

.markdown-content :deep(h2) {
  font-size: 24px;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.3em;
}

.markdown-content :deep(h3) {
  font-size: 20px;
}

.markdown-content :deep(h4) {
  font-size: 18px;
}

.markdown-content :deep(h5) {
  font-size: 16px;
}

.markdown-content :deep(h6) {
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.markdown-content :deep(blockquote) {
  margin: 1.2em 0;
  padding: 0.75em 1.2em;
  border-left: 4px solid var(--primary-color);
  background: rgba(148, 163, 184, 0.12);
  border-radius: 0 8px 8px 0;
  color: var(--text-color-2);
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin: 0 0 1.2em 1.6em;
  padding-left: 0.3em;
}

.markdown-content :deep(li) {
  margin-bottom: 0.5em;
}

.markdown-content :deep(li::marker) {
  color: var(--primary-color);
}

.markdown-content :deep(ul ul),
.markdown-content :deep(ol ul),
.markdown-content :deep(ol ol),
.markdown-content :deep(ul ol) {
  margin-top: 0.5em;
}

.markdown-content :deep(hr) {
  border: none;
  height: 1px;
  background: var(--border-base);
  margin: 2.4em 0;
}

.markdown-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1.6em 0;
  font-size: 14px;
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
  border: 1px solid var(--border-base);
  padding: 12px 16px;
  text-align: left;
}

.markdown-content :deep(th) {
  background: rgba(148, 163, 184, 0.15);
  color: var(--text-color-1);
}

.markdown-content :deep(tr:nth-child(2n) td) {
  background: rgba(148, 163, 184, 0.08);
}

.markdown-content :deep(img) {
  max-width: 100%;
  border-radius: 8px;
}

.markdown-content :deep(pre) {
  background: rgba(148, 163, 184, 0.12);
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
}

.markdown-content :deep(code) {
  font-family: Consolas, 'Courier New', monospace;
}

.markdown-content :deep(:not(pre) > code) {
  background: rgba(148, 163, 184, 0.18);
  border-radius: 6px;
  padding: 0.15em 0.4em;
  margin: 0 0.15em;
  font-size: 0.95em;
  color: var(--text-color-1);
}

.markdown-content :deep(pre code) {
  background: transparent;
  padding: 0;
  color: inherit;
}

.markdown-content :deep(strong) {
  color: var(--text-color-1);
}

.markdown-content :deep(em) {
  font-style: italic;
}

@media (max-width: 768px) {
  .detail-readme {
    padding: 20px;
  }

  .section-title {
    margin: -20px -20px 16px;
    padding: 14px 20px;
  }
}
</style>
