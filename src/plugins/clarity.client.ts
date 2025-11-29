import { defineNuxtPlugin, useRuntimeConfig } from 'nuxt/app'
import Clarity from '@microsoft/clarity'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const clarityProjectId = config.public?.clarityProjectId

  if (typeof clarityProjectId !== 'string' || clarityProjectId.length === 0) {
    if (import.meta.dev) {
      console.warn('[Clarity] Missing NUXT_PUBLIC_CLARITY_PROJECT_ID. Clarity is disabled.')
    }
    return
  }

  try {
    Clarity.init(clarityProjectId)
  } catch (error) {
    if (import.meta.dev) {
      console.warn('[Clarity] Failed to initialise', error)
    }
  }
})
