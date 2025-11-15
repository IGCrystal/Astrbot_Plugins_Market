import { onMounted, ref } from 'vue'

const isNaiveHydrated = ref(false)
let hasScheduledHydration = false

export function useNaiveHydration() {
  onMounted(() => {
    if (isNaiveHydrated.value || hasScheduledHydration) return
    hasScheduledHydration = true
    const markHydrated = () => {
      isNaiveHydrated.value = true
    }
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
