import { createError } from 'h3'
import { toPluginRecord, type PluginApiResponse } from '@/utils/plugins/transform'
import type { PluginRecord } from '@/types/plugin'

const CACHE_TTL_MS = 1000 * 60 * 10 // 10 minutes

interface CacheEntry {
  timestamp: number
  data: PluginRecord[]
}

let cache: CacheEntry | null = null

const fetchRemotePlugins = async (): Promise<PluginRecord[]> => {
  const remoteData = await $fetch<PluginApiResponse>('https://api.soulter.top/astrbot/plugins', {
    cache: 'no-store'
  })
  if (!remoteData || typeof remoteData !== 'object') {
    throw createError({
      statusCode: 502,
      message: '插件数据源返回异常'
    })
  }
  return Object.entries(remoteData).map(toPluginRecord)
}

export const fetchPluginsWithCache = async (): Promise<PluginRecord[]> => {
  const cached = cache
  const now = Date.now()

  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data
  }

  const data = await fetchRemotePlugins()
  cache = {
    timestamp: now,
    data
  }
  return data
}

export const getPluginById = async (id: string): Promise<PluginRecord | null> => {
  const plugins = await fetchPluginsWithCache()
  return plugins.find((plugin) => plugin.id === id) ?? null
}
