import { defineNuxtPlugin, useRuntimeConfig } from 'nuxt/app'

const CLARITY_ORIGIN = 'https://www.clarity.ms'
const PING_TIMEOUT_MS = 2000

const isClient = () => typeof window !== 'undefined'

export default defineNuxtPlugin(async () => {
  const config = useRuntimeConfig()
  const clarityProjectId = config.public?.clarityProjectId

  if (typeof clarityProjectId !== 'string' || clarityProjectId.length === 0) {
    if (import.meta.dev) {
      console.warn('[Clarity] Missing NUXT_PUBLIC_CLARITY_PROJECT_ID. Clarity is disabled.')
    }
    return
  }

  if (!isClient()) {
    return
  }

  const loadClarity = async () => {
    try {
      const clarityModule = await import('@microsoft/clarity')
      const clarity = clarityModule.default ?? clarityModule
      clarity.init(clarityProjectId)
    } catch (error) {
      if (import.meta.dev) {
        console.warn('[Clarity] Failed to initialise', error)
      }
    }
  }

  if (typeof fetch !== 'function' || typeof AbortController === 'undefined') {
    await loadClarity()
    return
  }

  const clarityScriptUrl = `${CLARITY_ORIGIN}/tag/${clarityProjectId}?ref=nuxt`

  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), PING_TIMEOUT_MS)

  let clarityReachable = true

  try {
    await fetch(clarityScriptUrl, {
      method: 'GET',
      mode: 'no-cors',
      cache: 'no-store',
      signal: controller.signal
    })
  } catch (error) {
    clarityReachable = false

    if (import.meta.dev) {
      console.warn('[Clarity] clarity.ms unreachable. Clarity is disabled for this session.', error)
    }
  } finally {
    window.clearTimeout(timeout)
  }

  if (!clarityReachable) {
    return
  }

  await loadClarity()
})
