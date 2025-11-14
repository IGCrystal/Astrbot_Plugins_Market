<template>
  <header ref="fullHeader" class="app-header">
    <div class="header-bg-decoration">
      <div class="floating-circle circle-1"></div>
      <div class="floating-circle circle-2"></div>
      <div class="floating-circle circle-3"></div>
    </div>
    <n-space justify="end" style="padding: 16px">
      <n-switch
        :value="modelValue"
        @update:value="handleThemeChange"
        :rail-style="railStyle"
        :aria-label="modelValue ? '切换到浅色主题' : '切换到深色主题'"
        :aria-checked="modelValue"
        role="switch"
      >
        <template #checked>
          <n-icon aria-hidden="true"><moon-sharp /></n-icon>
        </template>
        <template #unchecked>
          <n-icon aria-hidden="true"><sunny-sharp /></n-icon>
        </template>
      </n-switch>
    </n-space>

    <div class="header-title">
      <img src="/logo.webp" alt="Astrbot Logo" class="header-logo" width="48" height="48" decoding="async" fetchpriority="high">
      <div class="title-wrapper">
        <h1 class="animated-title" aria-label="AstrBot 插件市场">
          <span
            v-for="(char, index) in titleChars"
            :key="index"
            class="title-char"
            :style="{ animationDelay: `${index * 0.06}s` }"
            aria-hidden="true"
          >{{ char }}</span>
        </h1>
        <span class="third-party-badge">社区</span>
      </div>
    </div>

    <search-toolbar
      :search-query="searchQuery"
      :current-page="currentPage"
      :sort-by="sortBy"
      :on-header="true"
      @update:searchQuery="handleSearchQueryChange"
      @update:currentPage="handleCurrentPageChange"
      @update:sortBy="handleSortByChange"
    />
  </header>
</template>

<script setup>
import { computed, ref } from 'vue'
import { NIcon, NSpace, NSwitch } from 'naive-ui'
import { MoonSharp, SunnySharp } from '@vicons/ionicons5'
import SearchToolbar from '../SearchToolbar.vue'

const props = defineProps({
  modelValue: Boolean,
  searchQuery: String,
  currentPage: Number,
  sortBy: String
})
const emit = defineEmits(['update:modelValue', 'update:searchQuery', 'update:currentPage', 'update:sortBy'])

const titleText = 'AstrBot 插件市场'
const titleChars = computed(() => titleText.split('').map((char) => (char === ' ' ? '\u00A0' : char)))

const handleThemeChange = (value) => emit('update:modelValue', value)
const handleSearchQueryChange = (value) => emit('update:searchQuery', value)
const handleCurrentPageChange = (value) => emit('update:currentPage', value)
const handleSortByChange = (value) => emit('update:sortBy', value)

const railStyle = ({ focused, checked }) => {
  const style = {}
  if (checked) style.background = '#1e293b'
  else style.background = '#60a5fa'
  if (focused) style.boxShadow = '0 0 0 2px rgba(96, 165, 250, 0.3)'
  return style
}

const fullHeader = ref(null)

defineExpose({ fullHeader })
</script>

<style scoped>
/* Reuse styles from original AppHeader where applicable. */
@import './AppHeaderStyles.css';
</style>
