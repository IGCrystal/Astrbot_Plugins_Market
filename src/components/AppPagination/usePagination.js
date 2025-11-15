import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

export function usePagination(props, emit) {
  const paginationRef = ref(null)
  const quickJumperId = ref(`pagination-quick-jumper-${Math.random().toString(36).slice(2, 11)}`)
  const screenWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 0)

  const showQuickJumper = computed(() => screenWidth.value > 768 && props.totalPages > 10)

  const pageSlot = computed(() => {
    if (screenWidth.value <= 480) {
      return 3
    }
    if (screenWidth.value <= 768) {
      return 5
    }
    return 7
  })

  const handlePageChange = (page) => {
    emit('update:modelValue', page)
  }

  const updateQuickJumperAttrs = () => {
    const input = paginationRef.value?.$el?.querySelector('.n-pagination-quick-jumper input')
    if (!input) return
    input.setAttribute('id', quickJumperId.value)
    input.setAttribute('aria-labelledby', 'pagination-goto-label')
    input.setAttribute('role', 'spinbutton')
    input.setAttribute('aria-valuemin', '1')
    input.setAttribute('aria-valuemax', props.totalPages.toString())
    input.setAttribute('aria-valuenow', props.modelValue.toString())
  }

  const handleResize = () => {
    if (typeof window === 'undefined') return
    screenWidth.value = window.innerWidth
  }

  onMounted(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize)
    }
    nextTick(() => {
      updateQuickJumperAttrs()
    })
  })

  onUnmounted(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', handleResize)
    }
  })

  watch(
    () => props.modelValue,
    () => {
      nextTick(() => {
        updateQuickJumperAttrs()
      })
    }
  )

  watch(
    () => props.totalPages,
    () => {
      nextTick(() => {
        updateQuickJumperAttrs()
      })
    }
  )

  return {
    paginationRef,
    quickJumperId,
    showQuickJumper,
    pageSlot,
    handlePageChange
  }
}
