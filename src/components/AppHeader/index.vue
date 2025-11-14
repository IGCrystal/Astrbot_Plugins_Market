<template>
  <FullHeader
    ref="fullHeaderComponent"
    :model-value="modelValue"
    :search-query="searchQuery"
    :current-page="currentPage"
    :sort-by="sortBy"
    @update:modelValue="emit('update:modelValue', $event)"
    @update:searchQuery="emit('update:searchQuery', $event)"
    @update:currentPage="emit('update:currentPage', $event)"
    @update:sortBy="emit('update:sortBy', $event)"
  />

  <StickyHeader
    :model-value="modelValue"
    :search-query="searchQuery"
    :current-page="currentPage"
    :sort-by="sortBy"
    :show-sticky-header="showStickyHeader"
    :is-mobile-search-open="isMobileSearchOpen"
    @update:modelValue="emit('update:modelValue', $event)"
    @update:searchQuery="emit('update:searchQuery', $event)"
    @update:currentPage="emit('update:currentPage', $event)"
    @update:sortBy="emit('update:sortBy', $event)"
    @update:isMobileSearchOpen="handleMobileSearchToggle"
  />

  <div class="sticky-header-spacer" aria-hidden="true"></div>
</template>

<script setup>
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import FullHeader from './FullHeader.vue'
import StickyHeader from './StickyHeader.vue'

const props = defineProps({
  modelValue: Boolean,
  searchQuery: String,
  currentPage: Number,
  sortBy: String,
  totalPages: Number,
  selectedTag: String,
  tagOptions: Array
})

const emit = defineEmits([
  'update:modelValue',
  'update:searchQuery',
  'update:currentPage',
  'update:sortBy',
  'update:selectedTag'
])

const fullHeaderComponent = ref(null)
const showStickyHeader = ref(false)
const isMobileSearchOpen = ref(false)

const resolveHeaderElement = () => {
  const instance = fullHeaderComponent.value
  if (!instance) return null
  return instance.fullHeader?.value ?? instance.$el ?? null
}

const handleScroll = () => {
  if (typeof window === 'undefined') return
  if (window.matchMedia('(max-width: 768px)').matches) {
    showStickyHeader.value = true
    return
  }

  const element = resolveHeaderElement()
  if (!element) {
    showStickyHeader.value = false
    return
  }

  const rect = element.getBoundingClientRect()
  showStickyHeader.value = rect.bottom <= 0
}

const handleMobileSearchToggle = (value) => {
  isMobileSearchOpen.value = value
}

const bindListeners = () => {
  if (typeof window === 'undefined') return
  window.addEventListener('scroll', handleScroll, { passive: true })
  window.addEventListener('resize', handleScroll, { passive: true })
}

const unbindListeners = () => {
  if (typeof window === 'undefined') return
  window.removeEventListener('scroll', handleScroll)
  window.removeEventListener('resize', handleScroll)
}

onMounted(() => {
  if (typeof window === 'undefined') return
  bindListeners()
  nextTick(handleScroll)
})

onUnmounted(() => {
  unbindListeners()
})

watch(showStickyHeader, (visible) => {
  if (!visible) {
    isMobileSearchOpen.value = false
  }
})

watch(fullHeaderComponent, () => {
  nextTick(handleScroll)
})
</script>

<style scoped>
@import './AppHeaderStyles.css';
</style>
