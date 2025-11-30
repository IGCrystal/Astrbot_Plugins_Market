import type { PluginRecord } from '@/types/plugin'

export type PluginApiPayload = Partial<PluginRecord> & {
  tags?: string[] | string
}

export type PluginApiResponse = Record<string, PluginApiPayload>

export const normalizeTags = (value?: string[] | string): string[] => {
  if (!value) return []
  if (Array.isArray(value)) return value.filter(Boolean)
  return [value]
}

export const toPluginRecord = (entry: [string, PluginApiPayload]): PluginRecord => {
  const [machineName, details] = entry
  const displayName = details.display_name || details.name || machineName
  return {
    ...details,
    id: machineName,
    name: displayName,
    display_name: displayName,
    tags: normalizeTags(details.tags)
  }
}
