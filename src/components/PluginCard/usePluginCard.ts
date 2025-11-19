import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useMessage } from 'naive-ui'
import type { PluginRecord } from '@/types/plugin'
import type { AnalyticsEventType } from '@/types/analytics'
import { trackEvent, buildPluginSnapshot } from '@/utils/analytics'

export type PluginCardProps = {
  plugin: PluginRecord
  index: number
  seed: number
}

export function usePluginCard(props: PluginCardProps) {
  const showPluginDetails = ref(false)
  const showFallbackLogo = ref(false)
  const isTextOverflow = ref(false)
  const nameContainer = ref<HTMLElement | null>(null)
  const nameTextEl = ref<HTMLElement | null>(null)
  const pluginNameEl = ref<HTMLElement | null>(null)
  const cardRef = ref<HTMLElement | null>(null)
  const resizeObserver = ref<ResizeObserver | null>(null)
  const isCopied = ref(false)
  const message = useMessage()

  const displayName = computed(() => {
    const rawName = props.plugin?.name || ''
    return rawName.replace(/^astrbot_plugin_/i, '')
  })
  const snapshot = computed(() => buildPluginSnapshot(props.plugin))

  const emitPluginEvent = (eventType: AnalyticsEventType, metadata?: Record<string, unknown>) => {
    trackEvent({
      eventType,
      pluginId: props.plugin.id,
      pluginName: displayName.value,
      pluginSnapshot: snapshot.value,
      metadata
    })
  }

  const handleLogoError = (event?: Event) => {
    const target = event?.target as HTMLElement | undefined
    if (target) {
      target.style.display = 'none'
    }
    showFallbackLogo.value = true
  }

  watch(
    () => props.plugin.logo,
    () => {
      showFallbackLogo.value = false
    }
  )

  const updateMarqueeAnimation = (containerWidth: number, textWidth: number) => {
    if (pluginNameEl.value) {
      const translateDistance = textWidth - containerWidth + 20
      pluginNameEl.value.style.setProperty('--translate-distance', `-${translateDistance}px`)
    }
  }

  const checkTextOverflow = () => {
    nextTick(() => {
      if (!nameContainer.value || !nameTextEl.value) {
        return
      }
      const containerWidth = nameContainer.value.clientWidth
      const textWidth = nameTextEl.value.scrollWidth
      const wasOverflow = isTextOverflow.value

      isTextOverflow.value = textWidth > containerWidth

      if (isTextOverflow.value && wasOverflow !== isTextOverflow.value) {
        updateMarqueeAnimation(containerWidth, textWidth)
      }
    })
  }

  const replayCardAppearAnimation = () => {
    const element = cardRef.value
    if (!element) {
      return
    }
    element.style.animation = 'none'
    void element.offsetWidth
    element.style.animation = ''
  }

  onMounted(() => {
    checkTextOverflow()
    if (nameContainer.value && typeof window !== 'undefined' && 'ResizeObserver' in window) {
      resizeObserver.value = new ResizeObserver(() => {
        checkTextOverflow()
      })
      resizeObserver.value.observe(nameContainer.value)
    } else if (typeof window !== 'undefined') {
      window.addEventListener('resize', checkTextOverflow)
    }
  })

  watch(
    [
      () => props.index,
      () => props.seed
    ],
    () => {
      replayCardAppearAnimation()
    },
    { immediate: true }
  )

  onUnmounted(() => {
    if (resizeObserver.value) {
      resizeObserver.value.disconnect()
    } else if (typeof window !== 'undefined') {
      window.removeEventListener('resize', checkTextOverflow)
    }
  })

  const copyRepoUrl = async (event?: Event) => {
    event?.stopPropagation()
    if (!props.plugin.repo) {
      return
    }
    try {
      await navigator.clipboard.writeText(props.plugin.repo)
      isCopied.value = true
      emitPluginEvent('copy_repo', { repo: props.plugin.repo })
      setTimeout(() => {
        isCopied.value = false
      }, 2000)
    } catch (error) {
      message.error('复制失败，请手动复制')
    }
  }

  const openUrl = (url?: string, event?: Event) => {
    event?.stopPropagation()
    if (url) {
      window.open(url, '_blank')
      if (url === props.plugin.repo) {
        emitPluginEvent('visit_repo', { repo: url })
      } else {
        emitPluginEvent('visit_author', { url })
      }
    }
  }

  const showDetails = () => {
    showPluginDetails.value = true
    emitPluginEvent('view_details')
  }

  return {
    showPluginDetails,
    displayName,
    showFallbackLogo,
    handleLogoError,
    nameContainer,
    nameTextEl,
    pluginNameEl,
    cardRef,
    isTextOverflow,
    copyRepoUrl,
    openUrl,
    showDetails,
    isCopied
  }
}
