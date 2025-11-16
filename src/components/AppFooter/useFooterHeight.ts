import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import type { Ref } from 'vue'

const resolveElement = <T extends HTMLElement>(target: Ref<T | null | undefined> | Ref<{ $el?: T }> ) => {
  const value = target.value
  if (!value) return null
  if (value instanceof HTMLElement) return value
  if ('$el' in value && value.$el instanceof HTMLElement) {
    return value.$el
  }
  return null
}

const setFooterHeightVar = (value: number) => {
  if (typeof document === 'undefined') return
  if (value > 0) {
    document.documentElement.style.setProperty('--app-footer-height', `${value}px`)
  } else {
    document.documentElement.style.removeProperty('--app-footer-height')
  }
}

export function useFooterHeight() {
  const footerRef = ref<HTMLElement | null>(null)
  const footerHeight = ref(0)
  let resizeObserver: ResizeObserver | undefined
  let resizeHandler: (() => void) | null = null

  const updateFooterHeight = () => {
    const el = resolveElement(footerRef)
    if (!el) return
    const height = el.getBoundingClientRect().height
    footerHeight.value = height
    setFooterHeightVar(height)
  }

  const attachObserver = () => {
    if (typeof ResizeObserver === 'undefined') return
    const el = resolveElement(footerRef)
    if (!el) return
    resizeObserver = new ResizeObserver(() => {
      updateFooterHeight()
    })
    resizeObserver.observe(el)
  }

  const detachObserver = () => {
    resizeObserver?.disconnect()
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
