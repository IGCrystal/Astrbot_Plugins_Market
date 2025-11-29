import { computed } from 'vue'
import { useCookie } from 'nuxt/app'

const COOKIE_NAME = 'clarity-consent'
const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365

type ConsentValue = 'granted' | 'denied'
export type ClarityConsentStatus = ConsentValue | 'unknown'

export const useClarityConsent = () => {
  const consentCookie = useCookie<ConsentValue | undefined>(COOKIE_NAME, {
    path: '/',
    sameSite: 'lax',
    maxAge: ONE_YEAR_IN_SECONDS
  })

  const status = computed<ClarityConsentStatus>(() => {
    if (consentCookie.value === 'granted') {
      return 'granted'
    }

    if (consentCookie.value === 'denied') {
      return 'denied'
    }

    return 'unknown'
  })

  const grant = () => {
    consentCookie.value = 'granted'
  }

  const deny = () => {
    consentCookie.value = 'denied'
  }

  return {
    status,
    grant,
    deny
  }
}
