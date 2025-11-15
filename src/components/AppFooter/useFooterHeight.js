import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'

export function useFooterHeight() {
  const footerRef = ref(null)
  const footerHeight = ref(0)
  let resizeObserver
  let resizeHandler = null

  const resolveElement = () =>
    footerRef.value instanceof HTMLElement ? footerRef.value : footerRef.value?.$el

  const setFooterHeightVar = (value) => {
    if (typeof document === 'undefined') return
    if (value > 0) {
      document.documentElement.style.setProperty('--app-footer-height', `${value}px`)
    } else {
      document.documentElement.style.removeProperty('--app-footer-height')
    }
  }

  const updateFooterHeight = () => {
    const el = resolveElement()
    if (!(el instanceof HTMLElement)) return
    const height = el.getBoundingClientRect().height
    footerHeight.value = height
    setFooterHeightVar(height)
  }

  const attachObserver = () => {
    if (typeof ResizeObserver === 'undefined') return
    const el = resolveElement()
    if (!(el instanceof HTMLElement)) return
    resizeObserver = new ResizeObserver(() => {
      updateFooterHeight()
    })
    resizeObserver.observe(el)
  }

  const detachObserver = () => {
    if (!resizeObserver) return
    resizeObserver.disconnect()
    resizeObserver = undefined
  }

  onMounted(() => {
    nextTick(() => {
      updateFooterHeight()
      attachObserver()
    })

    if (typeof window === 'undefined') return
    resizeHandler = () => updateFooterHeight()
    window.addEventListener('resize', resizeHandler)
  })

  onBeforeUnmount(() => {
    if (typeof window !== 'undefined' && resizeHandler) {
      window.removeEventListener('resize', resizeHandler)
    }
    detachObserver()
    setFooterHeightVar(0)
  })

  return { footerRef, footerHeight }
}
