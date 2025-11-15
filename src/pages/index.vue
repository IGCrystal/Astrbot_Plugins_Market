<template>
  <n-layout class="main-layout">
    <app-header
      v-model="isDarkMode"
      v-model:search-query="searchQuery"
      v-model:selected-tag="selectedTag"
      v-model:current-page="currentPage"
      v-model:sort-by="sortBy"
      :tag-options="tagOptions"
      :total-pages="totalPages"
    />
    <div class="top-pagination-wrapper">
      <pagination-skeleton v-if="isLoading" :total-pages="totalPages" />
      <app-pagination
        v-else-if="totalPages > 1"
        v-model="currentPage"
        :total-pages="totalPages"
        class="top-pagination"
      />
    </div>

    <!-- 随机排序时的工具条 -->
    <div v-if="sortBy === 'random'" class="grid-toolbar">
      <div class="grid-toolbar-inner">
        <span class="toolbar-tip">随机推荐</span>
        <n-button size="small" tertiary @click="refreshRandomOrder">
          <template #icon>
            <n-icon><sync-outline /></n-icon>
          </template>
          换一换
        </n-button>
      </div>
    </div>

    <main class="plugins-grid" :class="{ 'is-loading': isLoading }">
      <!-- 加载状态 -->
      <template v-if="isLoading">
        <plugin-card-skeleton
          v-for="index in skeletonCount"
          :key="`skeleton-${index}`"
          :tag-widths="skeletonTagWidths"
          :icon-count="skeletonIconCount"
        />
      </template>
      
      <!-- 空状态提示 -->
      <div v-else-if="!isLoading && filteredPlugins.length === 0" class="empty-state">
        <div class="empty-icon">
          <n-icon size="48" :component="SearchOutline" />
        </div>
        <h3 class="empty-title">没有找到相关插件哦</h3>
        <p class="empty-description">
          <span v-if="searchQuery || selectedTag">
            试试调整搜索内容呢
          </span>
          <span v-else>
            当前没有可用的插件数据
          </span>
        </p>
      </div>
      
      <!-- 插件卡片 -->
      <template v-else>
        <plugin-card
          v-for="(plugin, index) in paginatedPlugins"
          :key="`${plugin.id || plugin.name}-${filterKey}-${randomSeed}`"
          :plugin="plugin"
          :index="index"
          :seed="randomSeed"
        />
      </template>
    </main>
    <div class="bottom-pagination-wrapper">
      <pagination-skeleton v-if="isLoading" :total-pages="totalPages" />
      <app-pagination
        v-else-if="totalPages > 1"
        v-model="currentPage"
        :total-pages="totalPages"
      />
    </div>
    <app-footer />
  </n-layout>
</template>

<script setup>
import { computed } from 'vue'
import { useHead } from '#imports'
import { storeToRefs } from 'pinia'
import { NLayout, NIcon, NButton } from 'naive-ui'
import { SearchOutline, SyncOutline } from '@vicons/ionicons5'
import { usePluginStore } from '@/stores/plugins'
import PaginationSkeleton from '@/components/ui/PaginationSkeleton.vue'
import PluginCardSkeleton from '@/components/ui/PluginCardSkeleton.vue'
import AppHeader from '@/components/AppHeader/index.vue'
import AppFooter from '@/components/AppFooter/index.vue'
import AppPagination from '@/components/AppPagination/index.vue'
import PluginCard from '@/components/PluginCard/index.vue'

const store = usePluginStore()
const { 
  isDarkMode,
  searchQuery,
  selectedTag,
  currentPage,
  sortBy,
  tagOptions,
  totalPages,
  paginatedPlugins,
  isLoading,
  filteredPlugins,
  randomSeed
} = storeToRefs(store)

const cleanObject = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((entry) => cleanObject(entry))
      .filter((entry) => {
        if (entry === undefined || entry === null) return false
        if (typeof entry === 'string') return entry.trim() !== ''
        if (Array.isArray(entry)) return entry.length > 0
        if (typeof entry === 'object') return Object.keys(entry).length > 0
        return true
      })
  }

  if (value && typeof value === 'object') {
    return Object.entries(value).reduce((acc, [key, val]) => {
      const cleaned = cleanObject(val)
      if (cleaned === undefined || cleaned === null) return acc
      if (typeof cleaned === 'string' && cleaned.trim() === '') return acc
      if (Array.isArray(cleaned) && cleaned.length === 0) return acc
      if (typeof cleaned === 'object' && !Array.isArray(cleaned) && Object.keys(cleaned).length === 0) return acc
      acc[key] = cleaned
      return acc
    }, {})
  }

  return value
}

const filterKey = computed(() => {
  return `${searchQuery.value}-${selectedTag.value}-${sortBy.value}-${currentPage.value}`
})

const structuredData = computed(() => {
  if (!filteredPlugins.value || filteredPlugins.value.length === 0) {
    return null
  }

  const itemListElement = filteredPlugins.value
    .map((plugin, index) => {
      const name = plugin.display_name || plugin.name || plugin.id
      if (!name) return null

      const description = typeof plugin.desc === 'string' ? plugin.desc.replace(/\s+/g, ' ').trim() : undefined
      const url = plugin.repo || plugin.homepage || plugin.social_link
      const keywords = Array.isArray(plugin.tags) && plugin.tags.length ? plugin.tags.join(', ') : undefined
      const stars = Number(plugin.stars)
      const aggregateRating = !Number.isNaN(stars) && stars > 0
        ? {
            '@type': 'AggregateRating',
            ratingValue: stars,
            ratingCount: Math.max(Math.round(stars), 1)
          }
        : undefined

      const item = cleanObject({
        '@type': 'SoftwareApplication',
        name,
        description,
        applicationCategory: 'Chatbot Plugin',
        operatingSystem: 'AstrBot Framework',
        url,
        keywords,
        image: plugin.logo,
        softwareVersion: plugin.version,
        author: plugin.author
          ? {
              '@type': 'Person',
              name: plugin.author
            }
          : undefined,
        aggregateRating
      })

      return cleanObject({
        '@type': 'ListItem',
        position: index + 1,
        item
      })
    })
    .filter(Boolean)

  if (!itemListElement.length) {
    return null
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'AstrBot 插件列表',
    description: 'AstrBot 插件市场提供的社区插件列表',
    itemListElement
  }
})

useHead(() => {
  if (!structuredData.value) {
    return { script: [] }
  }

  return {
    script: [
      {
        key: 'plugins-ld',
        type: 'application/ld+json',
        innerHTML: JSON.stringify(structuredData.value)
      }
    ],
    __dangerouslyDisableSanitizersByTagID: {
      'plugins-ld': ['innerHTML']
    }
  }
})

const skeletonCount = 12
const skeletonTagWidths = ['72px', '56px', '64px']
const skeletonIconCount = 2

const { refreshRandomOrder } = store
</script>

<style scoped>
.main-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.grid-toolbar {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}
.grid-toolbar-inner {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 4px 0 8px;
}
.toolbar-tip {
  color: var(--text-tertiary);
  font-size: 13px;
}

.plugins-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  max-width: 1400px;
  min-height: calc(
    100vh
    - var(--app-header-height, 0px)
    - var(--app-sticky-header-height, 0px)
    - var(--app-footer-height, 0px)
  );
  gap: 24px;
  padding: 20px;
  margin: 0 auto;
  animation: gridAppear 0.3s ease-out;
  animation-delay: 0.7s;
  animation-fill-mode: backwards;
  align-content: start;  
  align-items: start;   
}

.plugins-grid.is-loading {
  animation: none;
  animation-delay: 0s;
}

@keyframes gridAppear {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 平板和中等屏幕 */
@media (max-width: 1024px) and (min-width: 769px) {
  .plugins-grid {
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 20px;
    padding: 18px;
  }
}

/* 小平板屏幕 */
@media (max-width: 768px) and (min-width: 481px) {
  .plugins-grid {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 18px;
    padding: 16px;
  }
}

/* 手机屏幕 */
@media (max-width: 480px) {
  .plugins-grid {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 16px;
  }
}

.plugins-grid > * {
  max-width: 500px;
  justify-self: center;
}

.empty-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-height: 300px;
  padding-top: 80px;
  text-align: center;
  color: var(--text-color-2);
}

.empty-icon {
  margin-bottom: 16px;
  opacity: 0.6;
  color: var(--text-color-3);
}

.empty-title {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--text-color-1);
}

.empty-description {
  margin: 0;
  font-size: 14px;
  color: var(--text-color-2);
  opacity: 0.8;
}
</style>
