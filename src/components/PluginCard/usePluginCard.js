import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useMessage } from 'naive-ui'

export function usePluginCard(props) {
  const showPluginDetails = ref(false)
  const showFallbackLogo = ref(false)
  const isTextOverflow = ref(false)
  const nameContainer = ref(null)
  const nameTextEl = ref(null)
  const pluginNameEl = ref(null)
  const cardRef = ref(null)
  const resizeObserver = ref(null)
  const isCopied = ref(false)
  const message = useMessage()

  const displayName = computed(() => {
    const rawName = props.plugin?.name || ''
    return rawName.replace(/^astrbot_plugin_/i, '')
  })

  const handleLogoError = (event) => {
    if (event && event.target) {
      event.target.style.display = 'none'
    }
    showFallbackLogo.value = true
  }

  watch(
    () => props.plugin.logo,
    () => {
      showFallbackLogo.value = false
    }
  )

  const updateMarqueeAnimation = (containerWidth, textWidth) => {
    if (pluginNameEl.value) {
      const translateDistance = textWidth - containerWidth + 20
      pluginNameEl.value.style.setProperty('--translate-distance', `-${translateDistance}px`)
    }
  }

  // Measure title width and tune marquee when needed.
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

  // Re-trigger entrance animation after pagination reshuffles cards.
  const replayCardAppearAnimation = () => {
    const element = cardRef.value && (cardRef.value.$el || cardRef.value)
    if (!element) {
      return
    }
    element.style.animation = 'none'
    void element.offsetWidth
    element.style.animation = ''
  }

  onMounted(() => {
    checkTextOverflow()
    if (nameContainer.value && window.ResizeObserver) {
      resizeObserver.value = new ResizeObserver(() => {
        checkTextOverflow()
      })
      resizeObserver.value.observe(nameContainer.value)
    } else {
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
    } else {
      window.removeEventListener('resize', checkTextOverflow)
    }
  })

  const copyRepoUrl = async (event) => {
    event?.stopPropagation()
    if (!props.plugin.repo) {
      return
    }
    try {
      await navigator.clipboard.writeText(props.plugin.repo)
      isCopied.value = true
      setTimeout(() => {
        isCopied.value = false
      }, 2000)
    } catch (error) {
      message.error('复制失败，请手动复制')
    }
  }

  const openUrl = (url, event) => {
    event?.stopPropagation()
    if (url) {
      window.open(url, '_blank')
    }
  }

  const showDetails = () => {
    showPluginDetails.value = true
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
