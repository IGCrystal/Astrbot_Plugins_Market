<template>
  <div class="plugin-detail-page">
    <submit-header
      :is-dark-mode="isDarkMode"
      title="插件详情"
      @go-back="handleGoBack"
      @toggle-theme="toggleTheme"
    />

    <n-layout class="plugin-detail-layout">
      <section class="detail-container">

        <plugin-detail-header
          :plugin="plugin"
          :plugin-id="pluginId"
          :detail-display-name="detailDisplayName"
          :detail-title-attr="detailTitleAttr"
          :normalized-version="normalizedVersion"
          :formatted-updated-at="formattedUpdatedAt"
          :stars-value="starsValue"
          :is-repo-copied="isRepoCopied"
          :show-fallback-logo="showFallbackLogo"
          :on-open-url="openUrl"
          :on-copy-repo-url="copyRepoUrl"
          :on-handle-logo-error="handleLogoError"
        />

        <plugin-detail-readme
          :readme-html="sanitizedReadmeHtml"
          :asset-base-url="readmeAssetBaseUrl"
          :is-readme-loading="isReadmeLoading"
          :readme-error="readmeError"
          :is-readme-unavailable="isReadmeUnavailable"
          @refresh="handleRefreshReadme"
        />

        <plugin-comment
          v-if="plugin?.repo"
          :repo="plugin.repo"
          :plugin-name="plugin?.name || '未知插件'"
          :theme="commentTheme"
        />
      </section>

      <app-footer />
    </n-layout>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { createError, useAsyncData, useHead, useRequestURL, useRuntimeConfig, useSeoMeta } from 'nuxt/app'
import {
  NLayout
} from 'naive-ui'

import SubmitHeader from '@/components/SubmitPage/SubmitHeader.vue'
import AppFooter from '@/components/AppFooter/index.vue'
import PluginComment from '@/components/ui/PluginComment.vue'
import PluginDetailHeader from '@/components/PluginDetail/PluginDetailHeader.vue'
import PluginDetailReadme from '@/components/PluginDetail/PluginDetailReadme.vue'
import { usePluginStore } from '@/stores/plugins'
import type { PluginRecord } from '@/types/plugin'

const route = useRoute()
const router = useRouter()
const pluginStore = usePluginStore()
const {
  isDarkMode,
  searchQuery,
  selectedTag,
  currentPage,
  sortBy
} = storeToRefs(pluginStore)

const pluginId = computed(() => String(route.params.id))

const { data: pluginData } = await useAsyncData(`plugin-${pluginId.value}`, () =>
  $fetch<PluginRecord>(`/api/plugins/${pluginId.value}`)
)

if (!pluginData.value) {
  throw createError({
    statusCode: 404,
    message: '未找到对应插件'
  })
}

pluginStore.upsertPlugin(pluginData.value)

const plugin = computed(() => pluginStore.getPluginById(pluginId.value))

if (!plugin.value) {
  throw createError({
    statusCode: 404,
    message: '插件数据不可用'
  })
}

function basicSanitizeHtml(html: string): string {
  if (!html) return ''

  html = html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
  html = html.replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')

  html = html.replace(/\s(on\w+)\s*=\s*"[^"]*"/gi, '')
  html = html.replace(/\s(on\w+)\s*=\s*'[^']*'/gi, '')
  html = html.replace(/\s(on\w+)\s*=\s*[^\s>]+/gi, '')

  html = html.replace(/(href|src)\s*=\s*"javascript:[^"]*"/gi, '$1="#"')
  html = html.replace(/(href|src)\s*=\s*'javascript:[^']*'/gi, `$1='#'`)

  html = html.replace(/<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi, '')

  html = html.replace(/\s(srcdoc)\s*=\s*"[^"]*"/gi, '')
  html = html.replace(/\s(srcdoc)\s*=\s*'[^']*'/gi, '')

  return html
}

function stripTags(input = ''): string {
  return input.replace(/<\/?[^>]+(>|$)/g, '').replace(/\s+/g, ' ').trim()
}

function extractHeroSnippetFromHtml(html = '', maxLen = 150): string {
  if (!html) return ''

  const pMatch = html.match(/<p[^>]*>([\s\S]*?)<\/p>/i)
  if (pMatch && pMatch[1]) {
    const text = stripTags(pMatch[1])
    return text.length <= maxLen ? text : `${text.slice(0, maxLen).trim()}…`
  }

  const plain = stripTags(html)
  return plain.length <= maxLen ? plain : `${plain.slice(0, maxLen).trim()}…`
}

const {
  data: readmeData,
  pending: readmePending,
  error: readmeError,
  refresh: refreshReadme
} = await useAsyncData(`plugin-readme-${pluginId.value}`, async () => {
  if (!Boolean(plugin.value?.repo)) {
    return { html: '', assetBaseUrl: null }
  }

  const res = await $fetch<{ html: string; assetBaseUrl?: string | null }>(`/api/plugins/${pluginId.value}/readme`).catch(() => {
    return { html: '', assetBaseUrl: null }
  })

  const raw = res?.html ?? ''
  const sanitized = basicSanitizeHtml(raw)

  return {
    html: sanitized,
    assetBaseUrl: res?.assetBaseUrl ?? null
  }
}, {
  default: () => ({ html: '', assetBaseUrl: null })
})

const sanitizedReadmeHtml = computed(() => readmeData.value?.html ?? '')
const readmeAssetBaseUrl = computed(() => readmeData.value?.assetBaseUrl ?? null)
const hasReadmeContent = computed(() => (sanitizedReadmeHtml.value || '').trim().length > 0)
const isServer = import.meta.env.SSR
const isReadmeLoading = computed(() => {
  if (!Boolean(plugin.value?.repo)) return false
  if (readmeError.value) return false
  if (hasReadmeContent.value) return false
  return readmePending.value || isServer
})
const isReadmeUnavailable = computed(() => {
  if (!Boolean(plugin.value?.repo)) return true
  if (readmeError.value) return false
  if (isReadmeLoading.value) return false
  return !hasReadmeContent.value
})
const heroSnippet = computed(() => {
  const html = sanitizedReadmeHtml.value
  const snippetFromReadme = extractHeroSnippetFromHtml(html, 160)
  if (snippetFromReadme && snippetFromReadme.length > 0) return snippetFromReadme
  const desc = plugin.value?.desc ?? ''
  return desc.length > 0 ? (desc.length <= 160 ? desc : `${desc.slice(0, 160).trim()}…`) : '查看 AstrBot 插件的详细介绍与使用说明。'
})
const detailDisplayName = computed(() => {
  const displayName = plugin.value?.display_name?.trim()
  if (displayName) return displayName
  const rawName = plugin.value?.name?.trim() ?? ''
  if (!rawName) return ''
  const simplified = rawName.replace(/^astrbot_plugin_/i, '').trim()
  return simplified || rawName
})

const detailTitleAttr = computed(() => detailDisplayName.value || undefined)

const showFallbackLogo = ref(false)

const starsValue = computed(() => {
  const value = Number(plugin.value?.stars ?? 0)
  return Number.isFinite(value) ? Math.max(value, 0) : 0
})

const isRepoCopied = ref(false)
let copyResetTimer: number | null = null

watch(() => plugin.value?.logo, () => {
  showFallbackLogo.value = false
})

watch(pluginId, () => {
  isRepoCopied.value = false
  showFallbackLogo.value = false
})

const handleLogoError = () => {
  showFallbackLogo.value = true
}

const handleRefreshReadme = () => {
  refreshReadme()
}

const toggleTheme = () => {
  pluginStore.toggleTheme()
}

const handleGoBack = () => {
  router.push('/')
}

const openUrl = (url?: string | null) => {
  if (!url) return
  if (!import.meta.client) return
  window.open(url, '_blank', 'noopener')
}

const copyRepoUrl = async () => {
  if (!plugin.value?.repo || !import.meta.client || !navigator?.clipboard) return
  try {
    await navigator.clipboard.writeText(plugin.value.repo)
    isRepoCopied.value = true
    if (copyResetTimer !== null) {
      window.clearTimeout(copyResetTimer)
    }
    copyResetTimer = window.setTimeout(() => {
      isRepoCopied.value = false
      copyResetTimer = null
    }, 2000)
  } catch (error) {
    console.error('Failed to copy repository url:', error)
  }
}

const normalizedVersion = computed(() => {
  const version = plugin.value?.version?.replace(/^v/i, '').trim()
  return version && version.length > 0 ? version : null
})

const formattedUpdatedAt = computed(() => {
  const updated = plugin.value?.updated_at
  if (!updated) return null
  const date = new Date(updated)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
})

const commentTheme = computed(() => (isDarkMode.value ? 'dark' : 'light'))
const runtimeConfig = useRuntimeConfig()
const requestURL = useRequestURL()
const siteOrigin = computed(() => {
  const configured = runtimeConfig.public.siteUrl?.replace(/\/$/, '')
  if (configured) return configured
  return `${requestURL.protocol}//${requestURL.host}`
})

const canonicalUrl = computed(() => `${siteOrigin.value}/plugins/${pluginId.value}`)

useHead(() => ({
  link: [
    {
      rel: 'canonical',
      href: canonicalUrl.value
    }
  ]
}))

useSeoMeta({
  title: `${pluginData.value.name} - 插件详情 | AstrBot 插件市场 [社区]`,
  description: heroSnippet.value,
  ogTitle: `${pluginData.value.name} - 插件详情 | AstrBot 插件市场 [社区]`,
  ogDescription: heroSnippet.value,
  ogUrl: canonicalUrl.value,
  ogImage: pluginData.value.logo || undefined,
})

const structuredData = computed(() => {
  const toAbsoluteUrl = (url?: string) => {
    if (!url || typeof url !== 'string') return undefined
    const trimmed = url.trim()
    if (/^https?:\/\//i.test(trimmed)) return trimmed
    if (trimmed.startsWith('//')) return `https:${trimmed}`
    const baseUrl = siteOrigin.value.replace(/\/+$/, '')
    const normalizedPath = trimmed.startsWith('/')
      ? trimmed
      : `/${trimmed}`
    return `${baseUrl}${normalizedPath}`
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: plugin.value?.name,
    description: heroSnippet.value || plugin.value?.desc,
    applicationCategory: 'Chatbot Plugin',
    operatingSystem: 'AstrBot Framework',
    url: canonicalUrl.value,
    image: toAbsoluteUrl(plugin.value?.logo),
    softwareVersion: normalizedVersion.value || undefined,
    author: plugin.value?.author
      ? {
          '@type': 'Person',
          name: plugin.value.author
        }
      : undefined,
    keywords: plugin.value?.tags?.join(', ') || undefined,
    interactionStatistic: starsValue.value > 0
      ? {
          '@type': 'InteractionCounter',
          interactionType: 'https://schema.org/LikeAction',
          userInteractionCount: starsValue.value
        }
      : undefined
  }
})

useHead(() => ({
  script: [
    {
      key: `plugin-schema-${pluginId.value}`,
      type: 'application/ld+json',
      innerHTML: JSON.stringify(structuredData.value)
    }
  ],
  __dangerouslyDisableSanitizersByTagID: {
    [`plugin-schema-${pluginId.value}`]: ['innerHTML']
  }
}))

const initialFilterState = {
  search: searchQuery.value,
  tag: selectedTag.value,
  sort: sortBy.value,
  page: currentPage.value
}
const hasRedirected = ref(false)

if (import.meta.client) {
  watch(
    [searchQuery, selectedTag, sortBy, currentPage],
    ([search, tag, sort, page]) => {
      if (hasRedirected.value) return
      if (
        search !== initialFilterState.search ||
        tag !== initialFilterState.tag ||
        sort !== initialFilterState.sort ||
        page !== initialFilterState.page
      ) {
        hasRedirected.value = true
        router.push('/')
      }
    }
  )
}

onBeforeUnmount(() => {
  if (!import.meta.client || copyResetTimer === null) return
  window.clearTimeout(copyResetTimer)
  copyResetTimer = null
})
</script>

<style scoped>
.plugin-detail-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--body-color);
}

.plugin-detail-layout {
  flex: 1;
  display: flex;
  flex-direction: column;
}

:deep(.page-header .header-content) {
  max-width: 960px;
}

.detail-container {
  max-width: 960px;
  width: 100%;
  margin: 0 auto;
  padding: 32px 20px 64px;
  box-sizing: border-box;
}

@media (max-width: 768px) {
  .detail-container {
    padding: 24px 16px 48px;
  }
}
</style>
