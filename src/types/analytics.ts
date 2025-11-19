import type { PluginRecord } from './plugin'

export type AnalyticsEventType =
  | 'copy_repo'
  | 'visit_repo'
  | 'visit_author'
  | 'view_details'
  | 'search'
  | 'page_view'

export type PluginSnapshot = Partial<
  Pick<
    PluginRecord,
    'id' | 'name' | 'display_name' | 'desc' | 'author' | 'repo' | 'homepage' | 'social_link' | 'stars' | 'version' | 'tags'
  >
>

export type AnalyticsEventPayload = {
  eventType: AnalyticsEventType
  pluginId?: string | null
  pluginName?: string | null
  pluginSnapshot?: PluginSnapshot | null
  searchQuery?: string | null
  metadata?: Record<string, unknown> | null
  githubLogin?: string | null
}
