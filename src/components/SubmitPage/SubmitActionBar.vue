<template>
  <n-card class="action-bar">
    <div class="action-content">
      <div class="action-left">
        <transition name="action-button" mode="out-in">
          <n-button
            v-if="currentStep > 1"
            @click="$emit('prev-step')"
            quaternary
            key="prev"
            class="action-button-item"
          >
            <template #icon>
              <n-icon>
                <arrow-back />
              </n-icon>
            </template>
            上一步
          </n-button>
        </transition>
      </div>
      <div class="action-right">
        <transition name="action-button" mode="out-in">
          <n-button
            v-if="currentStep === 1"
            type="primary"
            @click="$emit('validate')"
            :disabled="disableNext"
            key="next1"
            class="action-button-item"
          >
            预览并提交
          </n-button>
          <n-button
            v-else
            type="primary"
            @click="$emit('submit')"
            key="submit"
            class="action-button-item"
          >
            <template #icon>
              <n-icon>
                <logo-github />
              </n-icon>
            </template>
            提交到GitHub
          </n-button>
        </transition>
      </div>
    </div>
  </n-card>
</template>

<script setup>
import { NCard, NButton, NIcon } from 'naive-ui'
import { ArrowBack, LogoGithub } from '@vicons/ionicons5'

defineProps({
  currentStep: {
    type: Number,
    required: true
  },
  disableNext: {
    type: Boolean,
    default: false
  }
})

defineEmits(['prev-step', 'validate', 'submit'])
</script>

<style scoped>
.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 90;
  border-radius: 0;
  background: var(--bg-card);
  box-shadow: var(--shadow-lg);
}

.action-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  height: var(--action-bar-height, 72px);
  padding: 0 24px;
}

.action-left,
.action-right {
  display: flex;
  gap: 12px;
  align-items: center;
}

.action-button-item {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.action-button-item:hover {
  transform: translateY(-2px);
}

.action-button-item:active {
  transform: translateY(0);
}

.action-button-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.action-button-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.action-button-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.action-button-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@media (max-width: 425px) {
  .action-content {
    padding: 0 16px;
    height: var(--action-bar-height, 64px);
  }
}
</style>
