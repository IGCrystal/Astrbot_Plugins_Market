<template>
  <header
    class="sticky-header"
    :class="{ 'sticky-header--visible': showStickyHeader, 'is-search-open': isMobileSearchOpen }"
  >
    <div class="sticky-header-content">
      <div class="sticky-header-left">
        <img src="/logo.webp" alt="Astrbot Logo" class="sticky-logo" width="32" height="32">
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
import { ref, computed, h } from 'vue'
import { NIcon, NInput, NButton, NDropdown } from 'naive-ui'
import { CloseOutline, SearchOutline, FilterSharp, MoonSharp, SunnySharp, CheckmarkSharp } from '@vicons/ionicons5'
import SearchToolbar from '../SearchToolbar.vue'

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
</script>

<style scoped>
@import './AppHeaderStyles.css';
</style>
