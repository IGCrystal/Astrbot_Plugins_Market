<template>
  <article class="skeleton-card-wrapper" aria-hidden="true">
    <n-card
      class="skeleton-card"
      :bordered="false"
      :style="{ borderRadius: '16px' }"
      :content-style="{ padding: '8px 16px' }"
    >
      <div class="skeleton-card-inner">
      <div class="skeleton-card-header">
        <n-skeleton class="skeleton-logo" :height="100" :width="100" animated />
        <div class="skeleton-card-main">
          <n-skeleton height="22" width="78%" animated />
          <n-skeleton height="16" width="60%" animated />
          <n-skeleton height="14" width="92%" animated />
        </div>
      </div>

      <div class="skeleton-tags">
        <n-skeleton
          v-for="(tagWidth, tagIndex) in tagWidths"
          :key="`skeleton-tag-${tagIndex}`"
          class="skeleton-tag"
          height="22"
          :width="tagWidth"
          round
          animated
        />
      </div>

      <div class="skeleton-meta">
        <n-skeleton class="skeleton-author" height="16" width="45%" animated />
        <n-skeleton class="skeleton-stars" height="16" width="20%" animated />
      </div>

      <div class="skeleton-actions">
        <n-skeleton class="skeleton-main-btn" height="36" width="48%" animated />
        <div class="skeleton-icon-group">
          <n-skeleton
            v-for="iconIndex in iconCount"
            :key="`skeleton-icon-${iconIndex}`"
            class="skeleton-icon"
            height="32"
            width="32"
            round
            animated
          />
        </div>
      </div>
      </div>
    </n-card>
  </article>
</template>

<script setup lang="ts">
import { NCard, NSkeleton } from 'naive-ui'

const props = withDefaults(defineProps<{
  tagWidths?: Array<string | number>
  iconCount?: number
}>(), {
  tagWidths: () => ['72px', '56px', '64px'],
  iconCount: 2
})
</script>

<style scoped>
.skeleton-card-wrapper {
  display: block;
  width: 100%;
}

.skeleton-card {
  display: flex;
  border-radius: 16px;
  background: var(--bg-card);
  border: 3px solid var(--border-base);
  box-shadow: var(--shadow-sm);
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  min-height: 240px;
}

@media (min-width: 1320px) {
  .skeleton-card {
    max-width: 420px;
  }
}

.skeleton-card-inner {
  display: flex;
  flex-direction: column;
  gap: 18px;
  width: 100%;
}

.skeleton-card-header {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.skeleton-logo {
  border-radius: 12px !important;
  flex: 0 0 auto;
  width: 100px;
  height: 100px;
}

.skeleton-card-main {
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.skeleton-tags {
  display: inline-flex;
  align-items: center;
  width: 100%;
  min-height: 26px;
  max-height: 26px;
  flex-wrap: nowrap;
  gap: 8px;
  overflow: hidden;
  position: relative;
  white-space: nowrap;
  padding-right: 32px;
  box-sizing: border-box;
}

.skeleton-tags::after {
  content: '';
  position: absolute;
  right: 0;
  top: 0;
  width: 32px;
  height: 100%;
  background: linear-gradient(90deg, rgba(0, 0, 0, 0), var(--bg-card));
  pointer-events: none;
}

.skeleton-tag {
  border-radius: 999px !important;
  flex: 0 0 auto;
  margin: 0 !important;
}

.skeleton-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.skeleton-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.skeleton-main-btn {
  border-radius: 999px !important;
  min-width: 140px;
}

.skeleton-icon-group {
  display: flex;
  gap: 8px;
  flex-wrap: nowrap;
}

.skeleton-icon {
  border-radius: 50% !important;
}

.skeleton-card :deep(.n-skeleton) {
  border-radius: 10px !important;
}

.skeleton-card :deep(.n-skeleton)::after {
  animation-duration: var(--skeleton-animation-duration, 1.2s) !important;
}
</style>
