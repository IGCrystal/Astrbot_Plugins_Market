<template>
  <footer class="pagination-wrapper pagination-wrapper--skeleton" aria-hidden="true">
    <div class="pagination-container pagination-container--skeleton">
      <div class="pagination-skeleton-track">
        <n-skeleton class="skeleton-pill skeleton-nav" :height="itemSize" :width="navWidth" round animated />

        <div class="skeleton-pages">
          <n-skeleton
            v-for="index in pageSlot"
            :key="`pagination-skeleton-page-${index}`"
            class="skeleton-pill"
            :height="itemSize"
            :width="pageWidth"
            round
            animated
          />
        </div>

        <n-skeleton class="skeleton-pill skeleton-nav" :height="itemSize" :width="navWidth" round animated />

        <div v-if="showQuickJumper" class="skeleton-quick-jumper">
          <n-skeleton class="skeleton-label" height="16" width="48" animated />
          <n-skeleton class="skeleton-input" :height="itemSize" width="70" round animated />
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { NSkeleton } from 'naive-ui'

const props = defineProps({
  totalPages: {
    type: Number,
    default: 0
  }
})

const isClient = typeof window !== 'undefined'
const screenWidth = ref(isClient ? window.innerWidth : 1440)

const pageSlot = computed(() => {
  if (screenWidth.value <= 480) {
    return 3
  }
  if (screenWidth.value <= 768) {
    return 5
  }
  return 7
})

const showQuickJumper = computed(() => screenWidth.value > 768 && props.totalPages > 10)

const itemSize = computed(() => {
  if (screenWidth.value <= 360) return 28
  if (screenWidth.value <= 480) return 34
  if (screenWidth.value <= 768) return 26
  if (screenWidth.value <= 1024) return 30
  return 32
})

const pageWidth = computed(() => itemSize.value)
const navWidth = computed(() => {
  if (screenWidth.value <= 360) return itemSize.value + 4
  if (screenWidth.value <= 480) return itemSize.value + 6
  if (screenWidth.value <= 768) return itemSize.value + 8
  if (screenWidth.value <= 1024) return itemSize.value + 10
  return itemSize.value + 14
})

const handleResize = () => {
  if (!isClient) return
  screenWidth.value = window.innerWidth
}

onMounted(() => {
  if (!isClient) return
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  if (!isClient) return
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.pagination-wrapper--skeleton {
  display: flex;
  justify-content: center;
  margin: 2rem auto;
  padding: 0;
  position: relative;
}

.pagination-container--skeleton {
  display: flex;
  justify-content: center;
  padding: 8px 20px;
  position: relative;
  z-index: 1;
  border-radius: 50px;
  backdrop-filter: blur(10px);
  width: fit-content;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: var(--pagination-skeleton-bg);
}

.pagination-container--skeleton {
  cursor: default;
}

.pagination-skeleton-track {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.skeleton-pages {
  display: flex;
  align-items: center;
  gap: 10px;
}

.skeleton-pill {
  border-radius: 999px !important;
}

.skeleton-nav {
  min-width: 40px;
}

.skeleton-quick-jumper {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: 12px;
}

.skeleton-label {
  border-radius: 6px !important;
}

.skeleton-input {
  border-radius: 10px !important;
}

:deep(.n-skeleton)::after {
  animation-duration: var(--skeleton-animation-duration, 1.2s) !important;
  background: var(--pagination-skeleton-wave);
}

@media (max-width: 1024px) {
  .pagination-wrapper--skeleton {
    margin: 1.5rem 0;
    padding: 0.75rem 0;
  }

  .pagination-skeleton-track {
    gap: 10px;
  }
  .skeleton-pages {
    gap: 8px;
  }
}

@media (max-width: 768px) {
  .pagination-wrapper--skeleton {
    margin: 1.25rem 0;
    padding: 0.5rem 12px;
  }

  .pagination-skeleton-track {
    justify-content: center;
  }
  .pagination-container--skeleton {
    padding: 8px 16px;
  }
  .skeleton-pages {
    gap: 6px;
  }
  .skeleton-quick-jumper {
    display: none;
  }
}

@media (max-width: 480px) {
  .pagination-wrapper--skeleton {
    margin: 1rem 0;
    padding: 0.5rem 8px;
  }

  .pagination-container--skeleton {
    padding: 6px 12px;
  }
  .pagination-skeleton-track {
    gap: 8px;
  }
  .skeleton-pages {
    gap: 4px;
  }
}
</style>
