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

<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import type { Ref } from 'vue'
import FullHeader from './FullHeader.vue'
import StickyHeader from './StickyHeader.vue'
import type { SortOption } from '@/stores/plugins'

type TagOption = {
  label: string
  value: string
}

type HeaderProps = {
  modelValue: boolean
  searchQuery: string
  currentPage: number
  sortBy: SortOption
  totalPages?: number
  selectedTag?: string | null
  tagOptions?: TagOption[]
}

const props = defineProps<HeaderProps>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'update:searchQuery', value: string): void
  (e: 'update:currentPage', value: number): void
  (e: 'update:sortBy', value: SortOption): void
  (e: 'update:selectedTag', value: string | null): void
}>()

type FullHeaderExpose = {
  fullHeader?: Ref<HTMLElement | null>
  $el?: HTMLElement
}

const fullHeaderComponent = ref<InstanceType<typeof FullHeader> | null>(null)
const showStickyHeader = ref(false)
const isMobileSearchOpen = ref(false)

const resolveHeaderElement = (): HTMLElement | null => {
  const instance = fullHeaderComponent.value as FullHeaderExpose | null
  if (!instance) return null
  if (instance.fullHeader?.value instanceof HTMLElement) {
    return instance.fullHeader.value
  }
  return instance.$el ?? null
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

const handleMobileSearchToggle = (value: boolean) => {
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
