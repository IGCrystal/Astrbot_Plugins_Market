import { defineNuxtPlugin, useRuntimeConfig } from 'nuxt/app'
import { watch } from 'vue'
import Clarity from '@microsoft/clarity'

import { useClarityConsent } from '@/composables/useClarityConsent'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const clarityProjectId = config.public?.clarityProjectId || import.meta.env.NUXT_PUBLIC_CLARITY_PROJECT_ID
  const consent = useClarityConsent()

  nuxtApp.provide('clarityConsent', consent)

  if (import.meta.dev) {
    console.info('[Clarity] resolved projectId =', clarityProjectId)
  }

  if (typeof clarityProjectId !== 'string' || clarityProjectId.length === 0) {
    if (import.meta.dev) {
      console.warn('[Clarity] Missing NUXT_PUBLIC_CLARITY_PROJECT_ID. Clarity consent mode disabled.')
    }
    return
  }

  let clarityLoaded = false

  const enableClarity = () => {
    if (clarityLoaded) {
      try {
        Clarity.consent(true)
      } catch (error) {
        if (import.meta.dev) {
          console.warn('[Clarity] Failed to grant consent state', error)
        }
      }
      return
    }

    try {
      Clarity.init(clarityProjectId)
      Clarity.consent(true)
      clarityLoaded = true
    } catch (error) {
      if (import.meta.dev) {
        console.warn('[Clarity] Failed to initialise with consent mode', error)
      }
    }
  }

  const disableClarity = () => {
    if (!clarityLoaded) {
      return
    }

    try {
      Clarity.consent(false)
    } catch (error) {
      if (import.meta.dev) {
        console.warn('[Clarity] Failed to revoke consent state', error)
      }
    }
  }

  watch(
    () => consent.status.value,
    (status) => {
      if (status === 'granted') {
        enableClarity()
        return
      }

      if (status === 'denied') {
        disableClarity()
      }
    },
    { immediate: true }
  )
})
