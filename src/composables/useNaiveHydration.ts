import { onMounted, ref } from 'vue'

const isNaiveHydrated = ref(false)
let hasScheduledHydration = false
const HYDRATION_SCROLL_CLASS = 'hydration-lock'

const toggleScrollLock = (locked: boolean) => {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  const body = document.body
  root?.classList.toggle(HYDRATION_SCROLL_CLASS, locked)
  body?.classList.toggle(HYDRATION_SCROLL_CLASS, locked)
}

const markHydrated = () => {
  isNaiveHydrated.value = true
  toggleScrollLock(false)
}

export function useNaiveHydration() {
  onMounted(() => {
    if (isNaiveHydrated.value) {
      toggleScrollLock(false)
      return
    }

    toggleScrollLock(true)

    if (hasScheduledHydration) return
    hasScheduledHydration = true

    if (typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(markHydrated)
      })
    } else {
      markHydrated()
    }
  })

  return { isNaiveHydrated }
}
