import { ref, computed, onMounted, onUnmounted } from 'vue'
import { helpContent } from '../../../utils/helpContent'

const MOBILE_BREAKPOINT = 768
const isClient = typeof window !== 'undefined'

export function useHelpButton() {
  const isMobile = ref(isClient ? window.innerWidth <= MOBILE_BREAKPOINT : false)
  const showHelp = ref(false)
  const showHelpText = ref(false)
  const panelUrl = ref('')

  const modalStyle = computed(() => {
    if (isMobile.value) {
      return {
        width: '100%',
        maxWidth: 'none'
      }
    }
    return {
      width: '90%',
      maxWidth: '600px'
    }
  })

  const updateIsMobile = () => {
    if (!isClient) {
      return
    }
    isMobile.value = window.innerWidth <= MOBILE_BREAKPOINT
  }

  const toggleHelp = () => {
    showHelp.value = !showHelp.value
  }

  const openPanelUrl = () => {
    if (!panelUrl.value) {
      return
    }

    let url = panelUrl.value
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`
    }
    if (isClient) {
      window.open(url, '_blank')
    }
  }

  onMounted(() => {
    updateIsMobile()
    if (isClient) {
      window.addEventListener('resize', updateIsMobile)
    }
  })

  onUnmounted(() => {
    if (isClient) {
      window.removeEventListener('resize', updateIsMobile)
    }
  })

  return {
    helpContent,
    isMobile,
    modalStyle,
    showHelp,
    showHelpText,
    panelUrl,
    toggleHelp,
    openPanelUrl
  }
}
