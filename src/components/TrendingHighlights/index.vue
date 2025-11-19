<template>
  <section class="trend-wrapper" aria-label="热门趋势">
    <div class="trend-section">
      <div class="trend-header">
        <div>
          <p class="trend-eyebrow">热门趋势</p>
          <h2>最受欢迎的插件</h2>
        </div>
        <n-button tertiary size="small" @click="handleRefresh" :loading="pending">
          刷新
        </n-button>
      </div>

      <client-only>
        <div v-if="pending" class="trend-grid" aria-busy="true">
          <div
            v-for="index in 3"
            :key="`trend-skeleton-${index}`"
            class="trend-card-shell"
          >
            <plugin-card-skeleton
              :tag-widths="skeletonTagWidths"
              :icon-count="2"
            />
          </div>
        </div>

        <div v-else-if="error" class="trend-error" role="alert">
          无法加载热门趋势数据
          <n-button text size="tiny" @click="handleRefresh">重试</n-button>
        </div>

        <div v-else-if="items.length" class="trend-grid">
          <div
            v-for="(item, index) in items"
            :key="item.pluginId || index"
            class="trend-card-shell"
          >
            <plugin-card
              :plugin="item.plugin"
              :index="index"
              :seed="index"
            >
              <template #links-extra>
                <div class="trend-links-extra">
                  <n-tag size="small" type="info" :bordered="false" class="trend-links-tag">
                    30天 {{ item.stats.total }} 次互动
                  </n-tag>
                </div>
              </template>
            </plugin-card>
          </div>
        </div>

        <p v-else class="trend-empty">暂无趋势数据</p>

        <template #fallback>
          <div class="trend-grid" aria-busy="true">
            <div
              v-for="index in 3"
              :key="`trend-fallback-${index}`"
              class="trend-card-shell"
            >
              <plugin-card-skeleton
                :tag-widths="skeletonTagWidths"
                :icon-count="2"
              />
            </div>
          </div>
        </template>
      </client-only>
    </div>

  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { NButton, NTag } from 'naive-ui'
import { usePluginStore } from '@/stores/plugins'
import type { PluginRecord } from '@/types/plugin'
import PluginCard from '@/components/PluginCard/index.vue'
import PluginCardSkeleton from '@/components/ui/PluginCardSkeleton.vue'

type TrendingResponse = {
  periodDays: number
  total: number
  items: Array<{
    pluginId: string
    pluginName?: string | null
    pluginSnapshot?: {
      display_name?: string
      name?: string
      desc?: string
      author?: string
      repo?: string
      homepage?: string
      social_link?: string
      tags?: string[]
    }
    stats: {
      total: number
      copyCount: number
      visitCount: number
      authorVisitCount: number
      detailViews: number
      latestEventAt: string
    }
  }>
}

const store = usePluginStore()
const skeletonTagWidths = ['72px', '56px', '64px']

const {
  data,
  pending,
  error,
  refresh
} = await useFetch<TrendingResponse>('/api/analytics/trending', {
  query: {
    limit: 3,
    periodDays: 30
  },
  default: () => ({
    periodDays: 30,
    total: 0,
    items: []
  })
})

const items = computed(() => {
  const entries = data.value?.items ?? []
  const pluginMap = new Map<string, PluginRecord>()
  const pluginList = store.plugins || []
  pluginList.forEach((plugin) => {
    const key = plugin.id || plugin.name
    if (key) {
      pluginMap.set(key, plugin)
    }
  })

  return entries.slice(0, 3).map((item) => {
    const fallback: PluginRecord = {
      id: item.pluginId,
      name: item.pluginSnapshot?.name || item.pluginName || item.pluginId,
      display_name: item.pluginSnapshot?.display_name || item.pluginSnapshot?.name || item.pluginName || item.pluginId,
      desc: item.pluginSnapshot?.desc,
      author: item.pluginSnapshot?.author,
      repo: item.pluginSnapshot?.repo,
      homepage: item.pluginSnapshot?.homepage,
      social_link: item.pluginSnapshot?.social_link,
      logo: undefined,
      stars: undefined,
      version: undefined,
      tags: Array.isArray(item.pluginSnapshot?.tags) ? item.pluginSnapshot?.tags.slice(0, 4) : [],
      updated_at: undefined
    }
    const plugin = pluginMap.get(item.pluginId) ?? fallback
    const displayName = plugin.display_name || plugin.name || plugin.id
    const normalizedTags = Array.isArray(plugin.tags) ? plugin.tags.slice(0, 4) : []
    return {
      ...item,
      plugin,
      displayName,
      author: plugin.author ?? null,
      description: plugin.desc ?? '——',
      tags: normalizedTags
    }
  })
})

const handleRefresh = () => {
  refresh()
}

</script>

<style scoped>
.trend-wrapper {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  box-sizing: border-box;
}

.trend-section {
  padding: 0 0 16px;
  border: none;
  background: transparent;
  margin-bottom: 16px;
}

.trend-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.trend-eyebrow {
  font-size: 13px;
  color: var(--text-tertiary);
  margin: 0 0 4px;
}

.trend-header h2 {
  margin: 0;
  font-size: 20px;
}

.trend-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  width: 100%;
  justify-content: flex-start;
}

.trend-card-shell {
  position: relative;
  flex: 1 1 360px;
  max-width: 420px;
  min-width: 300px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.trend-card-shell :deep(.plugin-card-wrapper) {
  width: 100%;
}

.trend-links-extra {
  display: flex;
  align-items: center;
  margin-left: auto;
  padding-left: 12px;
}

.trend-links-tag {
  background-color: var(--bg-n-tag) !important;
  color: var(--text-n-tag) !important;
  transition: background-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
}

.trend-card-shell :deep(.plugin-card-wrapper:hover .plugin-links ~ .trend-links-extra .trend-links-tag) {
  background-color: var(--primary-color) !important;
  color: var(--text-tag) !important;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.18);
}

.trend-error,
.trend-empty {
  margin: 0;
  padding: 16px;
  border-radius: 12px;
  background: rgba(255, 0, 0, 0.05);
  color: var(--text-color-1);
}

@media (max-width: 768px) {
  .trend-grid {
    gap: 16px;
  }

  .trend-card-shell {
    min-width: 0;
    max-width: 100%;
  }
}
</style>
