import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import { useCookie } from 'nuxt/app'
import type { PluginRecord } from '@/types/plugin'
import { normalizeTags } from '@/utils/plugins/transform'

export type SortOption = 'default' | 'stars' | 'updated' | 'random'
type TagOption = { label: string; value: string }

const isClient = typeof window !== 'undefined'

function stableHash(input: string, seedNumber: number): number {
  let h = (Math.floor(seedNumber * 1e9) ^ 5381) >>> 0
  for (let i = 0; i < input.length; i += 1) {
    h = (((h << 5) + h) + input.charCodeAt(i)) >>> 0
  }
  return h >>> 0
}

const applyThemeClass = (dark: boolean) => {
  if (!isClient) return
  const root = document.documentElement
  const body = document.body
  const theme = dark ? 'dark' : 'light'
  root.classList.toggle('dark', dark)
  body?.classList.toggle('dark', dark)
  root.setAttribute('data-theme', theme)
}

export const usePluginStore = defineStore('plugins', () => {
  const themeCookie = useCookie<string | null>('theme-preference')
  const savedTheme = themeCookie.value ?? (isClient ? window.localStorage.getItem('theme-preference') : null)

  const plugins = ref<PluginRecord[] | null>(null)
  const searchQuery = ref('')
  const selectedTag = ref<string | null>(null)
  const currentPage = ref(1)
  const pageSize = ref(12)
  const isDarkMode = ref(savedTheme === 'dark')
  const isLoading = ref(true)
  const sortBy = ref<SortOption>('default')
  const randomSeed = ref(0)

  if (isClient) {
    if (savedTheme) {
      window.localStorage.setItem('theme-preference', savedTheme)
      applyThemeClass(savedTheme === 'dark')
    } else {
      const prefersDark = document.documentElement.classList.contains('dark')
      const preferredTheme = prefersDark ? 'dark' : 'light'
      isDarkMode.value = prefersDark
      themeCookie.value = preferredTheme
      window.localStorage.setItem('theme-preference', preferredTheme)
      applyThemeClass(prefersDark)
    }
  }

  watch(isDarkMode, (newValue) => {
    const theme = newValue ? 'dark' : 'light'
    themeCookie.value = theme
    if (isClient) {
      window.localStorage.setItem('theme-preference', theme)
      applyThemeClass(newValue)
    }
  })

  watch(sortBy, (value) => {
    if (value === 'random') {
      randomSeed.value = Math.random()
    }
  })

  const toggleTheme = () => {
    isDarkMode.value = !isDarkMode.value
  }

  const allTags = computed(() => {
    const tags = new Set<string>()
    if (plugins.value) {
      plugins.value.forEach((plugin) => {
        plugin.tags?.forEach((tag) => tags.add(tag))
      })
    }
    return Array.from(tags).sort()
  })

  const tagOptions = computed<TagOption[]>(() =>
    allTags.value.map((tag) => ({ label: tag, value: tag }))
  )

  const filteredPlugins = computed<PluginRecord[]>(() => {
    if (!plugins.value) return []

    const searchValue = searchQuery.value.trim().toLowerCase()

    let filtered = plugins.value.filter((plugin) => {
      if (!searchValue && !selectedTag.value) return true

      const matchesSearch = !searchValue || [
        plugin.name,
        plugin.display_name,
        plugin.id,
        plugin.desc,
        plugin.author
      ].some((field) => field?.toLowerCase().includes(searchValue))

      const matchesTag = !selectedTag.value || plugin.tags.includes(selectedTag.value)

      return matchesSearch && matchesTag
    })

    if (sortBy.value === 'stars') {
      filtered = filtered.sort((a, b) => (b.stars ?? 0) - (a.stars ?? 0))
    } else if (sortBy.value === 'updated') {
      filtered = filtered.sort((a, b) => {
        const dateA = a.updated_at ? new Date(a.updated_at).getTime() : 0
        const dateB = b.updated_at ? new Date(b.updated_at).getTime() : 0
        return dateB - dateA
      })
    } else if (sortBy.value === 'random') {
      filtered = filtered.sort((a, b) => {
        const ha = stableHash(a.id || a.name || '', randomSeed.value)
        const hb = stableHash(b.id || b.name || '', randomSeed.value)
        return ha - hb
      })
    } else {
      filtered = filtered.sort((a, b) => {
        const list = plugins.value ?? []
        const indexA = list.findIndex((p) => (p.id || p.name) === (a.id || a.name))
        const indexB = list.findIndex((p) => (p.id || p.name) === (b.id || b.name))
        return indexA - indexB
      })
    }

    return filtered
  })

  const totalPages = computed(() => {
    if (sortBy.value === 'random') {
      return filteredPlugins.value.length > 0 ? 1 : 0
    }
    return Math.ceil(filteredPlugins.value.length / pageSize.value)
  })

  const paginatedPlugins = computed(() => {
    if (sortBy.value === 'random') {
      return filteredPlugins.value.slice(0, pageSize.value)
    }
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return filteredPlugins.value.slice(start, end)
  })

  const loadPlugins = async () => {
    isLoading.value = true
    try {
      const response = await fetch('/api/plugins', { cache: 'no-store' })
      if (!response.ok) {
        throw new Error(`Failed to load plugins: ${response.status}`)
      }
      const data = (await response.json()) as PluginRecord[]
      setPlugins(data)
    } catch (error) {
      console.error('Error loading plugins:', error)
      plugins.value = []
    } finally {
      isLoading.value = false
    }
  }

  const setPlugins = (data: PluginRecord[]) => {
    plugins.value = data.map((plugin) => ({
      ...plugin,
      tags: normalizeTags(plugin.tags)
    }))
    isLoading.value = false
  }

  const upsertPlugin = (record: PluginRecord) => {
    const normalized = {
      ...record,
      tags: normalizeTags(record.tags)
    }
    if (!plugins.value) {
      plugins.value = [normalized]
      return
    }
    const index = plugins.value.findIndex((item) => item.id === normalized.id)
    if (index === -1) {
      plugins.value.push(normalized)
    } else {
      plugins.value.splice(index, 1, normalized)
    }
  }

  const pluginMap = computed(() => {
    if (!plugins.value) return new Map<string, PluginRecord>()
    return new Map(plugins.value.map((plugin) => [plugin.id, plugin]))
  })

  const getPluginById = (id: string) => pluginMap.value.get(id) ?? null

  const setDarkMode = (value: boolean) => {
    isDarkMode.value = value
  }

  const setSearchQuery = (query: string) => {
    searchQuery.value = query
  }

  const setSelectedTag = (tag: string | null) => {
    selectedTag.value = tag
  }

  const setCurrentPage = (page: number) => {
    currentPage.value = page
  }

  const setSortBy = (value: SortOption) => {
    sortBy.value = value
    if (value === 'random') {
      randomSeed.value = Math.random()
    }
    currentPage.value = 1
  }

  const refreshRandomOrder = () => {
    if (sortBy.value === 'random') {
      randomSeed.value = Math.random()
    }
  }

  return {
    plugins,
    searchQuery,
    selectedTag,
    currentPage,
    isDarkMode,
    sortBy,
    isLoading,
    randomSeed,
    pageSize,
    allTags,
    tagOptions,
    filteredPlugins,
    totalPages,
    paginatedPlugins,
    loadPlugins,
    setPlugins,
    upsertPlugin,
    getPluginById,
    setDarkMode,
    setSearchQuery,
    setSelectedTag,
    setCurrentPage,
    setSortBy,
    toggleTheme,
    refreshRandomOrder
  }
})
