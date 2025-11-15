<template>
  <div class="float-buttons">
    <!-- 返回顶部按钮 -->
    <transition name="back-to-top-fade">
      <float-action-button
        v-show="show"
        class="back-to-top"
        aria-label="返回顶部"
        :icon-size="22"
        @click="scrollToTop"
      >
        <template #icon>
          <chevron-up />
        </template>
      </float-action-button>
    </transition>
    <submit-plugin-button />
    <help-button />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { ChevronUp } from '@vicons/ionicons5'
import { FloatActionButton } from './Button'

import HelpButton from './Help'
import SubmitPluginButton from './SubmitPlugin.vue'

const show = ref(false)
const scrollThreshold = 300

const checkScroll = () => {
  show.value = window.pageYOffset > scrollThreshold
}

const scrollToTop = () => {
  const currentPosition = window.pageYOffset
  const duration = 500 
  const startTime = performance.now()

  function animation(currentTime) {
    const timeElapsed = currentTime - startTime
    const progress = Math.min(timeElapsed / duration, 1)
    const easing = progress => progress < 0.5
      ? 2 * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 2) / 2

    window.scrollTo(0, currentPosition * (1 - easing(progress)))

    if (progress < 1) {
      requestAnimationFrame(animation)
    }
  }

  requestAnimationFrame(animation)
}

onMounted(() => {
  window.addEventListener('scroll', checkScroll, { passive: true })
  checkScroll() 
})

onUnmounted(() => {
  window.removeEventListener('scroll', checkScroll)
})
</script>

<style scoped>
.float-buttons {
  position: fixed;
  right: 24px;
  bottom: 24px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 16px;
  z-index: 1000;
}

.back-to-top-fade-enter-active {
  transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.back-to-top-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 1, 1);
}

.back-to-top-fade-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.8);
}

.back-to-top-fade-leave-to {
  opacity: 0;
  transform: translateY(10px) scale(0.9);
}

/* 响应式 */
@media (max-width: 768px) {
  .float-buttons {
    right: 20px;
    bottom: 20px;
    gap: 12px;
  }

  :deep(.float-button) {
    width: 48px;
    height: 48px;
  }

  :deep(.float-button__icon) {
    font-size: 18px;
  }
}

@media (max-width: 480px) {
  .float-buttons {
    right: 16px;
    bottom: 16px;
    gap: 10px;
  }

  :deep(.float-button) {
    width: 44px;
    height: 44px;
  }
}

@media (prefers-reduced-motion: reduce) {
  :deep(.float-button__inner),
  :deep(.float-button__icon),
  .progress-ring__circle,
  .back-to-top-fade-enter-active,
  .back-to-top-fade-leave-active {
    transition-duration: 0.1s;
  }

  :deep(.float-button__ripple) {
    display: none;
  }
}
</style>