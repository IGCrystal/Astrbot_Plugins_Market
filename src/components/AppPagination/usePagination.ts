import { computed, nextTick, onMounted, onUnmounted, ref, useId, watch } from 'vue'

export type PaginationProps = {
  modelValue: number
  totalPages: number
}

export function usePagination(props: PaginationProps, emit: (event: 'update:modelValue', value: number) => void) {
  const paginationRef = ref<{ $el?: HTMLElement } | null>(null)
  const id = useId()
  const quickJumperId = `pagination-quick-jumper-${String(id).replace(/[^a-zA-Z0-9_-]/g, '')}`
  const gotoLabelId = `${quickJumperId}-label`
  const screenWidth = ref(0)

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

  const isSimple = computed(() => screenWidth.value <= 480)

  const handlePageChange = (page: number) => {
    emit('update:modelValue', page)
  }

  const updateQuickJumperAttrs = () => {
    const input = paginationRef.value?.$el?.querySelector<HTMLInputElement>('.n-pagination-quick-jumper input')
    if (!input) return
    input.setAttribute('id', quickJumperId)
    input.setAttribute('aria-labelledby', gotoLabelId)
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
      handleResize()
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
    gotoLabelId,
    showQuickJumper,
    pageSlot,
    isSimple,
    handlePageChange
  }
}
