<template>
  <div class="submit-button-container" @mouseenter="showTipText = true" @mouseleave="showTipText = false">
    <div class="text-container">
      <div class="tip-text" :class="{ 'tip-text--show': showTipText }">
        来提交你的插件吧！
      </div>
    </div>
    <float-action-button
      class="submit-plugin"
      aria-label="提交插件"
      :icon-size="22"
      @click="navigateToSubmit"
    >
      <template #icon>
        <add-circle />
      </template>
    </float-action-button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { AddCircle } from '@vicons/ionicons5'
import { useRouter } from 'vue-router'
import { FloatActionButton } from './Button'

const router = useRouter()
const showTipText = ref(false)

const navigateToSubmit = () => {
  router.push('/submit')
}
</script>

<style scoped>
.submit-button-container {
  display: flex;
  align-items: center;
}

.text-container {
  height: 56px;
  overflow: hidden;
  display: flex;
  align-items: center;
  padding: 0 8px;
  margin: 0 -8px;
}

.tip-text {
  background: var(--bg-card);
  padding: 0 12px;
  border: 2px solid transparent;
  border-radius: 28px;
  font-size: 14px;
  height: 40px;
  line-height: 40px;
  color: var(--text-tag);
  white-space: nowrap;
  margin-right: -56px;
  transform: translateX(100%);
  opacity: 0;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--shadow-sm);
  background-clip: padding-box;
  position: relative;
}

.tip-text::before {
  content: '';
  position: absolute;
  top: -2px;
  right: -2px;
  bottom: -2px;
  left: -2px;
  background: var(--header-gradient);
  border-radius: inherit;
  z-index: -1;
  transition: opacity 0.4s ease;
  opacity: 0.6;
}

.tip-text--show {
  transform: translateX(0);
  opacity: 1;
  margin-right: 16px;
}

@media (max-width: 768px) {
  .text-container {
    height: 48px;
  }
  .tip-text {
    height: 36px;
    line-height: 36px;
    font-size: 13px;
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
  .text-container {
    height: 44px;
  }
  .tip-text {
    height: 32px;
    line-height: 32px;
    font-size: 12px;
  }
  :deep(.float-button) {
    width: 44px;
    height: 44px;
  }
}

.modal-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.scroll-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 4px;
}

.submit-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
  flex-shrink: 0;
}

.json-section {
  margin-top: 24px;
}

.json-tip {
  margin-bottom: 12px;
}

.json-textarea {
  margin-bottom: 12px;
}

.json-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

:deep(.n-input) {
  width: 100%;
}

:deep(.n-form-item) {
  margin-bottom: 24px;
}

:deep(.n-card-header) {
  padding-bottom: 16px;
  flex-shrink: 0;
}

:deep(.n-card__content) {
  flex: 1;
  padding-right: -8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

@media (max-width: 768px) {
  .submit-modal {
    max-width: 90vw;
  }
}
</style>