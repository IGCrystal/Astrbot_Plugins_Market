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
      v-html="props.readmeHtml"
    ></article>
  </div>
</template>

<script setup lang="ts">
import { NButton, NEmpty, NSpin } from 'naive-ui'

interface Props {
  readmeHtml: string
  isReadmeLoading: boolean
  readmeError: Error | null | undefined
  isReadmeUnavailable: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'refresh'): void
}>()

const emitRefresh = () => {
  emit('refresh')
}
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
