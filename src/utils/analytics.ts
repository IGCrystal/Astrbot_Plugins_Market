import type { PluginRecord } from '@/types/plugin'
import type { AnalyticsEventPayload, PluginSnapshot, AnalyticsEventType } from '@/types/analytics'

const CLIENT_ID_STORAGE_KEY = 'astrbot-client-id'
const EVENT_ENDPOINT = '/api/analytics/events'
const TRACK_DELAY_MS = 400

const isBrowser = typeof window !== 'undefined'

const getRandomId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

export const ensureClientId = (): string | null => {
  if (!isBrowser) return null
  try {
    const stored = window.localStorage.getItem(CLIENT_ID_STORAGE_KEY)
    if (stored) {
      return stored
    }
    const nextId = getRandomId()
    window.localStorage.setItem(CLIENT_ID_STORAGE_KEY, nextId)
    return nextId
  } catch (error) {
    console.warn('Unable to access localStorage for analytics client id', error)
    return null
  }
}

let pendingTimer: ReturnType<typeof setTimeout> | null = null

const queue: Array<AnalyticsEventPayload & { clientId?: string | null; githubLogin?: string | null }> = []

let accountLogin: string | null = null

export const setAnalyticsIdentity = (login: string | null) => {
  if (!login) {
    accountLogin = null
    return
  }
  const normalized = login.trim()
  accountLogin = normalized.length > 0 ? normalized : null
}

const flushQueue = () => {
  if (!isBrowser || queue.length === 0) return
  const events = queue.splice(0, queue.length)
  events.forEach((data) => {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 4000)
    fetch(EVENT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ ...data, timestamp: Date.now() }),
      signal: controller.signal
    }).catch((error) => {
      console.warn('Failed to send analytics event', error)
    }).finally(() => {
      clearTimeout(timeout)
    })
  })
}

const scheduleFlush = () => {
  if (pendingTimer) {
    clearTimeout(pendingTimer)
  }
  pendingTimer = setTimeout(() => {
    pendingTimer = null
    flushQueue()
  }, TRACK_DELAY_MS)
}

export const trackEvent = (payload: AnalyticsEventPayload & { eventType: AnalyticsEventType }) => {
  if (!isBrowser) return
  const clientId = ensureClientId()
  queue.push({ ...payload, clientId, githubLogin: accountLogin })
  scheduleFlush()
}

export const buildPluginSnapshot = (plugin: PluginRecord): PluginSnapshot => ({
  id: plugin.id,
  name: plugin.name,
  display_name: plugin.display_name,
  desc: plugin.desc,
  author: plugin.author,
  repo: plugin.repo,
  homepage: plugin.homepage,
  social_link: plugin.social_link,
  stars: plugin.stars,
  version: plugin.version,
  tags: Array.isArray(plugin.tags) ? plugin.tags.slice(0, 12) : []
})
