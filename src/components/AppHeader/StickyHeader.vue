<template>
  <header
    ref="stickyHeaderRef"
    class="sticky-header"
    :class="{ 'sticky-header--visible': showStickyHeader, 'is-search-open': isMobileSearchOpen }"
  >
    <div class="sticky-header-content">
      <div class="sticky-header-left">
        <img
          :src="logoUrl"
          alt="Astrbot Logo"
          class="sticky-logo"
          width="32"
          height="32"
          draggable="false"
          @dragstart.prevent
        >
        <h2 class="sticky-title" :class="{ 'hidden-on-search': isMobileSearchOpen }">AstrBot 插件市场</h2>
        <span class="third-party-badge third-party-badge--sticky" :class="{ 'hidden-on-search': isMobileSearchOpen }">社区</span>
      </div>

      <div class="sticky-header-center">
        <search-toolbar
          class="sticky-desktop-toolbar"
          :search-query="searchQuery"
          :current-page="currentPage"
          :sort-by="sortBy"
          :compact="true"
          @update:searchQuery="handleSearchQueryChange"
          @update:currentPage="handleCurrentPageChange"
          @update:sortBy="handleSortByChange"
        />
        <div class="mobile-inline-search" :class="{ 'is-open': isMobileSearchOpen }" aria-hidden="false">
          <n-input
            size="medium"
            :value="searchQuery"
            @update:value="handleSearchQueryChange"
            placeholder="搜索插件"
            clearable
            autofocus
          />
        </div>
      </div>

      <div class="sticky-header-right">
        <div class="sticky-actions">
          <div class="sticky-mobile-controls">
            <n-button
              quaternary
              circle
              size="medium"
              @click="toggleMobileSearch"
              :aria-expanded="isMobileSearchOpen"
              :aria-label="isMobileSearchOpen ? '关闭搜索' : '打开搜索'"
            >
              <n-icon size="18">
                <close-outline v-if="isMobileSearchOpen" />
                <search-outline v-else />
              </n-icon>
            </n-button>

            <n-dropdown
              trigger="click"
              placement="bottom"
              :options="mobileSortOptions"
              :show="isMobileSelectOpen"
              @update:show="isMobileSelectOpen = $event"
              @select="handleMobileDropdownSelect"
            >
              <n-button quaternary circle size="medium" :aria-label="`当前排序：${sortBy}`">
                <n-icon size="18"><filter-sharp /></n-icon>
              </n-button>
            </n-dropdown>
          </div>

          <n-button
            quaternary
            circle
            size="medium"
            @click="handleThemeChange(!modelValue)"
            :aria-label="modelValue ? '切换到浅色主题' : '切换到深色主题'"
            class="theme-toggle-btn"
          >
            <n-icon size="18">
              <moon-sharp v-if="modelValue" />
              <sunny-sharp v-else />
            </n-icon>
          </n-button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, h, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { NIcon, NInput, NButton, NDropdown } from 'naive-ui'
import logoUrl from '@/assets/logo.webp'
import { CloseOutline, SearchOutline, FilterSharp, MoonSharp, SunnySharp, CheckmarkSharp } from '@vicons/ionicons5'
import SearchToolbar from '../ui/SearchToolbar.vue'

const props = defineProps({
  modelValue: Boolean,
  searchQuery: String,
  currentPage: Number,
  sortBy: String,
  showStickyHeader: Boolean,
  isMobileSearchOpen: Boolean
})
const emit = defineEmits(['update:modelValue', 'update:searchQuery', 'update:currentPage', 'update:sortBy', 'update:isMobileSearchOpen'])

const handleThemeChange = (value) => emit('update:modelValue', value)
const handleSearchQueryChange = (value) => emit('update:searchQuery', value)
const handleCurrentPageChange = (value) => emit('update:currentPage', value)
const handleSortByChange = (value) => emit('update:sortBy', value)

const isMobileSelectOpen = ref(false)
const stickyHeaderRef = ref(null)
const stickyHeaderHeight = ref(0)
const MOBILE_BREAKPOINT = 1024
let resizeObserver

const setStickyHeaderVar = (value) => {
  if (typeof document === 'undefined') return
  if (value > 0) {
    document.documentElement.style.setProperty('--app-sticky-header-height', `${value}px`)
  } else {
    document.documentElement.style.removeProperty('--app-sticky-header-height')
  }
}

const updateStickyHeaderHeight = () => {
  if (typeof window === 'undefined' || window.innerWidth >= MOBILE_BREAKPOINT) {
    stickyHeaderHeight.value = 0
    setStickyHeaderVar(0)
    return
  }

  const el = stickyHeaderRef.value?.$el ?? stickyHeaderRef.value
  if (!(el instanceof HTMLElement)) return

  const height = el.getBoundingClientRect().height
  stickyHeaderHeight.value = height
  setStickyHeaderVar(height)
}

const attachObserver = () => {
  if (typeof ResizeObserver === 'undefined') return
  if (typeof window !== 'undefined' && window.innerWidth >= MOBILE_BREAKPOINT) return
  const el = stickyHeaderRef.value?.$el ?? stickyHeaderRef.value
  if (!(el instanceof HTMLElement)) return

  resizeObserver = new ResizeObserver(() => {
    updateStickyHeaderHeight()
  })
  resizeObserver.observe(el)
}

const detachObserver = () => {
  resizeObserver?.disconnect()
  resizeObserver = undefined
}

const handleResize = () => {
  if (typeof window === 'undefined') return
  const isMobile = window.innerWidth < MOBILE_BREAKPOINT
  if (!isMobile) {
    detachObserver()
    stickyHeaderHeight.value = 0
    setStickyHeaderVar(0)
    return
  }

  updateStickyHeaderHeight()
  if (!resizeObserver) {
    attachObserver()
  }
}

onMounted(() => {
  if (typeof window === 'undefined') return
  window.addEventListener('resize', handleResize)
  nextTick(() => {
    updateStickyHeaderHeight()
    attachObserver()
  })
})

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', handleResize)
  }
  detachObserver()
  setStickyHeaderVar(0)
})

const mobileSortOptions = computed(() => {
  const make = (text, key) => ({
    key,
    label: () => h(
      'div',
      { style: 'display:flex;align-items:center;justify-content:space-between;width:100%;' },
      [
        h('span', null, text),
        (props.sortBy === key)
          ? h(NIcon, { size: 16, style: 'color: var(--primary-color);' }, { default: () => h(CheckmarkSharp) })
          : null
      ]
    )
  })
  return [
    make('默认排序', 'default'),
    make('随机推荐', 'random'),
    make('按更新时间', 'updated'),
    make('按 Star 数量', 'stars')
  ]
})

const handleMobileDropdownSelect = (key) => emit('update:sortBy', key)
const toggleMobileSearch = () => emit('update:isMobileSearchOpen', !props.isMobileSearchOpen)

defineExpose({ stickyHeaderRef, stickyHeaderHeight })
</script>

<style scoped>
@import './AppHeaderStyles.css';
</style>
