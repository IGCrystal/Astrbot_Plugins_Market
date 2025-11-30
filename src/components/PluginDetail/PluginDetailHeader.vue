<template>
  <div class="detail-header">
    <div class="detail-header__primary">
      <div class="detail-logo">
        <img
          v-if="props.plugin?.logo && !props.showFallbackLogo"
          :src="props.plugin.logo"
          :alt="`${props.plugin?.name} logo`"
          loading="lazy"
          @error="handleLogoError"
        />
        <extension-puzzle-outline v-else class="detail-logo__placeholder" aria-hidden="true" />
      </div>
      <div class="detail-meta">
        <div
          class="detail-title-row"
          :class="{ 'detail-title-row--marquee': isClientReady && isTitleOverflow }"
          ref="detailTitleContainer"
        >
          <h1
            class="detail-title"
            :class="{ 'detail-title--marquee': isClientReady && isTitleOverflow }"
            ref="detailTitleEl"
            :title="props.detailTitleAttr"
            role="heading"
            aria-level="1"
          >
            {{ props.detailDisplayName }}
          </h1>
        </div>
        <div class="detail-title-divider" aria-hidden="true"></div>
        <div class="detail-meta__body">
          <p v-if="hasDescription" class="detail-description">{{ props.plugin?.desc }}</p>
          <div class="detail-tags" role="list">
            <n-tag
              v-for="tag in pluginTags"
              :key="tag"
              size="small"
              :bordered="false"
              type="info"
              class="detail-tag"
              role="listitem"
            >
              {{ tag }}
            </n-tag>
          </div>
        </div>
      </div>
    </div>
    <div class="detail-meta__stats">
      <div class="meta-item" v-if="props.normalizedVersion">
        <n-icon size="18" aria-hidden="true">
          <pricetag-outline />
        </n-icon>
        <span class="meta-label">版本</span>
        <span class="meta-value">v{{ props.normalizedVersion }}</span>
      </div>
      <div class="meta-item">
        <n-icon size="18" aria-hidden="true">
          <person-outline />
        </n-icon>
        <span class="meta-label">作者</span>
        <span class="meta-value">{{ props.plugin?.author || '未知' }}</span>
      </div>
      <div class="meta-item">
        <n-icon size="18" aria-hidden="true">
          <star-sharp />
        </n-icon>
        <span class="meta-label">Star</span>
        <span class="meta-value">{{ props.starsValue }}</span>
      </div>
      <div class="meta-item" v-if="props.formattedUpdatedAt">
        <n-icon size="18" aria-hidden="true">
          <time-outline />
        </n-icon>
        <span class="meta-label">更新</span>
        <span class="meta-value">{{ props.formattedUpdatedAt }}</span>
      </div>
    </div>
    <div class="detail-header__actions">
      <n-button
        type="primary"
        size="small"
        :disabled="repoDisabled"
        @click="handleOpenRepo"
        aria-label="查看仓库"
        class="repo-button"
      >
        <template #icon>
          <extension-puzzle-outline class="button-icon" aria-hidden="true" />
        </template>
        <template #default>
          <span class="button-label">查看仓库</span>
        </template>
      </n-button>
      <n-button
        size="small"
        secondary
        :disabled="repoDisabled"
        @click="handleCopyRepo"
        aria-label="复制仓库链接"
      >
        <template #icon>
          <component
            :is="props.isRepoCopied ? CheckmarkOutline : LinkOutline"
            class="button-icon"
            aria-hidden="true"
          />
        </template>
        <template #default>
          <span class="button-label">{{ props.isRepoCopied ? '已复制' : '复制链接' }}</span>
        </template>
      </n-button>
      <n-button
        v-if="props.plugin?.social_link"
        size="small"
        secondary
        @click="handleOpenSocial"
        aria-label="访问作者主页"
      >
        <template #icon>
          <person-outline class="button-icon" aria-hidden="true" />
        </template>
        <template #default>
          <span class="button-label">作者主页</span>
        </template>
      </n-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch, nextTick } from 'vue'
import { NButton, NIcon, NTag } from 'naive-ui'
import {
  ExtensionPuzzleOutline,
  PersonOutline,
  StarSharp,
  TimeOutline,
  CheckmarkOutline,
  LinkOutline,
  PricetagOutline
} from '@vicons/ionicons5'
import type { PluginRecord } from '@/types/plugin'

interface Props {
  plugin: PluginRecord | null
  pluginId: string
  detailDisplayName: string
  detailTitleAttr?: string
  normalizedVersion: string | null
  formattedUpdatedAt: string | null
  starsValue: number
  isRepoCopied: boolean
  showFallbackLogo: boolean
  onOpenUrl?: (url?: string | null) => void
  onCopyRepoUrl?: () => void
  onHandleLogoError?: () => void
}

const props = withDefaults(defineProps<Props>(), {
  detailDisplayName: '',
  detailTitleAttr: undefined,
  normalizedVersion: null,
  formattedUpdatedAt: null
})

const pluginTags = computed(() => props.plugin?.tags ?? [])
const hasDescription = computed(() => Boolean(props.plugin?.desc))
const repoDisabled = computed(() => !props.plugin?.repo)

const detailTitleContainer = ref<HTMLElement | null>(null)
const detailTitleEl = ref<HTMLElement | null>(null)
const isTitleOverflow = ref(false)
const isClientReady = ref(false)
let titleResizeObserver: ResizeObserver | null = null
let listeningWindowResize = false

const updateTitleOverflowState = () => {
  if (!import.meta.client) return
  const container = detailTitleContainer.value
  const titleEl = detailTitleEl.value

  if (!container || !titleEl) {
    isTitleOverflow.value = false
    return
  }

  const containerWidth = container.clientWidth
  const textWidth = titleEl.scrollWidth

  isTitleOverflow.value = textWidth > containerWidth

  if (isTitleOverflow.value) {
    const translateDistance = Math.max(textWidth - containerWidth + 24, 0)
    titleEl.style.setProperty('--translate-distance', `-${translateDistance}px`)
  } else {
    titleEl.style.removeProperty('--translate-distance')
  }
}

const scheduleTitleOverflowCheck = () => {
  if (!import.meta.client) return
  nextTick(() => {
    updateTitleOverflowState()
  })
}

const handleOpenRepo = () => {
  if (repoDisabled.value) return
  props.onOpenUrl?.(props.plugin?.repo ?? null)
}

const handleCopyRepo = () => {
  if (repoDisabled.value) return
  props.onCopyRepoUrl?.()
}

const handleOpenSocial = () => {
  if (!props.plugin?.social_link) return
  props.onOpenUrl?.(props.plugin.social_link)
}

const handleLogoError = () => {
  props.onHandleLogoError?.()
}

if (import.meta.client) {
  watch(
    () => props.detailDisplayName,
    () => {
      if (!isClientReady.value) return
      scheduleTitleOverflowCheck()
    }
  )

  watch(
    () => props.pluginId,
    () => {
      if (!isClientReady.value) return
      scheduleTitleOverflowCheck()
    }
  )

  watch(detailTitleContainer, (el, prev) => {
    if (!isClientReady.value) return
    if (titleResizeObserver && prev) {
      titleResizeObserver.unobserve(prev)
    }
    if (titleResizeObserver && el) {
      titleResizeObserver.observe(el)
    }
    scheduleTitleOverflowCheck()
  })
}

if (import.meta.client) {
  onMounted(async () => {
    isClientReady.value = true
    await nextTick()
    scheduleTitleOverflowCheck()
    if (typeof window === 'undefined') return
    const win = window as Window & typeof globalThis
    if (typeof ResizeObserver !== 'undefined') {
      titleResizeObserver = new ResizeObserver(() => {
        updateTitleOverflowState()
      })
      if (detailTitleContainer.value) {
        titleResizeObserver.observe(detailTitleContainer.value)
      }
    } else {
      win.addEventListener('resize', scheduleTitleOverflowCheck)
      listeningWindowResize = true
    }
  })
}

onBeforeUnmount(() => {
  if (!import.meta.client) return
  if (titleResizeObserver && detailTitleContainer.value) {
    titleResizeObserver.unobserve(detailTitleContainer.value)
    titleResizeObserver.disconnect()
    titleResizeObserver = null
  }
  if (typeof window !== 'undefined') {
    const win = window as Window & typeof globalThis
    if (typeof ResizeObserver === 'undefined' && listeningWindowResize) {
      win.removeEventListener('resize', scheduleTitleOverflowCheck)
      listeningWindowResize = false
    }
  }
})
</script>

<style scoped>
.detail-header {
  display: flex;
  flex-direction: column;
  gap: 24px;
  background: var(--n-color);
  border: 2px solid var(--primary-color);
  border-radius: 16px;
  padding: 24px;
}

.detail-header__primary {
  display: flex;
  gap: 24px;
  align-items: stretch;
  flex-wrap: wrap;
}

.detail-logo {
  flex: 0 0 180px;
  max-width: 180px;
  min-width: 160px;
  min-height: 180px;
  height: auto;
  border-radius: 16px;
  background: rgba(148, 163, 184, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  align-self: stretch;
}

.detail-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.detail-logo__placeholder {
  width: 72%;
  height: 72%;
  max-width: 90px;
  max-height: 90px;
  color: var(--primary-color);
  margin: auto;
  display: block;
}

.detail-meta {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-title {
  margin: 0;
  font-size: 30px;
  font-weight: 600;
  color: var(--text-color-1);
  font-family: 'Lexend', 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  letter-spacing: 0.01em;
  flex: 1 1 auto;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  position: relative;
  display: inline-block;
}

.detail-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: nowrap;
  width: 100%;
  position: relative;
  overflow: hidden;
}

.detail-title-row--marquee::before,
.detail-title-row--marquee::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  width: 24px;
  pointer-events: none;
  z-index: 1;
}

.detail-title-row--marquee::before {
  left: 0;
  background: linear-gradient(to right, var(--n-color) 0%, transparent 100%);
}

.detail-title-row--marquee::after {
  right: 0;
  background: linear-gradient(to left, var(--n-color) 0%, transparent 100%);
}

.detail-title--marquee {
  padding-right: 24px;
  animation: detailTitleMarquee 6s ease-in-out infinite;
}

@keyframes detailTitleMarquee {
  0%,
  15% {
    transform: translateX(0);
  }
  50%,
  65% {
    transform: translateX(var(--translate-distance, 0));
  }
  100% {
    transform: translateX(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .detail-title--marquee {
    animation: none;
    transform: translateX(0);
  }
}

.detail-title-divider {
  width: 100%;
  height: 1px;
  background: var(--border-base);
  margin: 4px 0 8px;
}

.detail-meta__body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.detail-tag {
  background-color: var(--primary-color) !important;
  color: var(--text-tag) !important;
  border: none !important;
  padding: 2px 8px !important;
  transition: transform 0.2s ease;
}

.detail-tag:hover {
  transform: scale(1.05);
  opacity: 0.92;
}

.detail-description {
  margin: 0;
  color: var(--text-color-2);
  line-height: 1.6;
}

.detail-meta__stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
  width: 100%;
  margin-top: 8px;
  align-items: stretch;
}

.meta-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 12px;
  background: rgba(148, 163, 184, 0.12);
  color: var(--text-color-2);
  font-size: 14px;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  text-align: center;
}

.meta-label {
  font-weight: 600;
  color: var(--text-color-1);
}

.meta-value {
  color: var(--text-color-2);
}

.detail-header__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.detail-header__actions :deep(.n-button__content) {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.detail-header__actions :deep(.n-button__icon) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.detail-header__actions :deep(.repo-button) {
  background-color: var(--primary-color) !important;
  border-color: var(--primary-color) !important;
  color: var(--text-tag, #fff) !important;
}

.detail-header__actions :deep(.repo-button:hover) {
  filter: brightness(0.95);
}

.detail-header__actions :deep(.repo-button:focus-visible) {
  box-shadow: 0 0 0 3px rgba(148, 163, 184, 0.35);
}

.detail-header__actions :deep(.repo-button .n-button__icon) {
  color: inherit;
}

.button-icon {
  width: 1em;
  height: 1em;
  display: inline-block;
}

.detail-header__actions :deep(.button-label) {
  margin-left: 4px;
}

@media (max-width: 1024px) {
  .detail-meta__stats {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .detail-logo__placeholder {
    max-width: 50px;
    max-height: 50px;
  }
}

@media (max-width: 768px) {
  .detail-header {
    padding: 20px;
  }

  .detail-header__primary {
    flex-direction: row;
    align-items: flex-start;
    text-align: left;
    gap: 16px;
  }

  .detail-logo {
    flex: 0 0 110px;
    max-width: 110px;
    min-width: 110px;
    min-height: 110px;
    height: 110px;
    align-self: flex-start;
  }

  .detail-meta {
    width: 100%;
    gap: 4px;
    align-items: flex-start;
  }

  .detail-title {
    font-size: 26px;
  }

  .detail-title-divider {
    width: 100%;
    margin: 4px 0 8px;
  }

  .detail-meta__body {
    align-items: flex-start;
  }

  .detail-description {
    text-align: left;
  }

  .detail-header__actions {
    justify-content: flex-start;
    gap: 8px;
    width: 100%;
  }

  .detail-header__actions :deep(.n-button__content) {
    gap: 0;
  }

  .detail-header__actions :deep(.n-button) {
    padding: 0;
    width: 42px;
    height: 42px;
    min-width: 42px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .detail-header__actions :deep(.n-button__icon) {
    margin: 0;
  }

  .detail-header__actions :deep(.button-label) {
    display: none;
  }

  .detail-header__actions :deep(.repo-button) {
    padding: 0 18px;
    width: auto;
    min-width: 0;
  }

  .detail-header__actions :deep(.repo-button .n-button__content) {
    gap: 6px;
  }

  .detail-header__actions :deep(.repo-button .button-label) {
    display: inline;
  }

  .meta-item {
    flex-direction: row;
    align-items: center;
    width: 100%;
    min-width: 0;
    justify-content: flex-start;
    text-align: left;
  }
}

@media (max-width: 440px) {
  .detail-meta__stats {
    grid-template-columns: repeat(1, minmax(0, 1fr));
    gap: 12px;
    width: 100%;
    margin-top: 8px;
    align-items: stretch;
  }
}
</style>
