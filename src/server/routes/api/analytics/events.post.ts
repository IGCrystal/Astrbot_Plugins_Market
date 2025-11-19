import { defineEventHandler, readBody, createError } from 'h3'
import { getAnalyticsEventsCollection } from '@/server/utils/mongo'
import type { AnalyticsEventType, AnalyticsEventPayload, PluginSnapshot } from '@/types/analytics'

const VALID_EVENT_TYPES: ReadonlySet<AnalyticsEventType> = new Set([
  'copy_repo',
  'visit_repo',
  'visit_author',
  'view_details',
  'search',
  'page_view'
])

type IncomingAnalyticsEvent = AnalyticsEventPayload & {
  clientId?: string | null
  pluginTags?: string[]
  timestamp?: number
}

const sanitizeSnapshot = (snapshot?: PluginSnapshot | null): PluginSnapshot | null => {
  if (!snapshot) return null
  return {
    id: snapshot.id ?? undefined,
    name: snapshot.name ?? undefined,
    display_name: snapshot.display_name ?? undefined,
    desc: snapshot.desc ?? undefined,
    author: snapshot.author ?? undefined,
    repo: snapshot.repo ?? undefined,
    homepage: snapshot.homepage ?? undefined,
    social_link: snapshot.social_link ?? undefined,
    stars: typeof snapshot.stars === 'number' ? snapshot.stars : undefined,
    version: snapshot.version ?? undefined,
    tags: Array.isArray(snapshot.tags)
      ? snapshot.tags
          .map((tag) => (typeof tag === 'string' ? tag.trim() : ''))
          .filter((tag) => Boolean(tag))
          .slice(0, 16)
      : []
  }
}

const sanitizeMetadata = (metadata?: Record<string, unknown> | null) => {
  if (!metadata || typeof metadata !== 'object') return null
  const entries = Object.entries(metadata).filter(([key, value]) => {
    if (typeof key !== 'string' || key.length > 48) return false
    return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
  })
  if (!entries.length) return null
  return Object.fromEntries(entries.slice(0, 12))
}

export default defineEventHandler(async (event) => {
  const body = await readBody<IncomingAnalyticsEvent | null>(event)

  if (!body || typeof body.eventType !== 'string') {
    throw createError({ statusCode: 400, message: 'Invalid analytics payload' })
  }

  if (!VALID_EVENT_TYPES.has(body.eventType as AnalyticsEventType)) {
    throw createError({ statusCode: 400, message: 'Unsupported analytics event' })
  }

  const trimmedPluginId = typeof body.pluginId === 'string' ? body.pluginId.trim().slice(0, 128) : null
  const trimmedPluginName = typeof body.pluginName === 'string' ? body.pluginName.trim().slice(0, 256) : null
  const sanitizedSnapshot = sanitizeSnapshot(body.pluginSnapshot)
  const pluginTags = Array.isArray(body.pluginTags)
    ? body.pluginTags.filter((tag) => typeof tag === 'string' && tag.trim().length > 0).slice(0, 16)
    : sanitizedSnapshot?.tags ?? undefined

  const searchQuery = typeof body.searchQuery === 'string' ? body.searchQuery.trim().slice(0, 256) : null
  const metadata = sanitizeMetadata(body.metadata ?? undefined)
  const clientId = typeof body.clientId === 'string' ? body.clientId.slice(0, 128) : null
  const githubLogin = typeof body.githubLogin === 'string' ? body.githubLogin.trim().toLowerCase().slice(0, 128) : null

  const timestampValue = typeof body.timestamp === 'number' && Number.isFinite(body.timestamp)
    ? new Date(body.timestamp)
    : new Date()

  const doc = {
    eventType: body.eventType as AnalyticsEventType,
    clientId,
    pluginId: trimmedPluginId,
    pluginName: trimmedPluginName,
    pluginSnapshot: sanitizedSnapshot,
    pluginTags,
    searchQuery,
    metadata,
    githubLogin,
    createdAt: timestampValue,
    timestamp: timestampValue.getTime()
  }

  const collection = await getAnalyticsEventsCollection()
  await collection.insertOne(doc)

  return { success: true }
})
