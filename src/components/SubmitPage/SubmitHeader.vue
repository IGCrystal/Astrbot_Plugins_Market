<template>
  <n-layout-header class="page-header">
    <div class="header-content">
      <div class="header-left">
        <n-button quaternary circle @click="$emit('go-back')">
          <template #icon>
            <n-icon>
              <arrow-back />
            </n-icon>
          </template>
        </n-button>
        <h1>提交插件</h1>
      </div>
      <div class="header-right">
        <n-button quaternary circle @click="$emit('toggle-theme')">
          <template #icon>
            <n-icon>
              <moon v-if="isDarkMode" />
              <sunny v-else />
            </n-icon>
          </template>
        </n-button>
      </div>
    </div>
  </n-layout-header>
</template>

<script setup lang="ts">
import { NLayoutHeader, NButton, NIcon } from 'naive-ui'
import { ArrowBack, Moon, Sunny } from '@vicons/ionicons5'

defineProps({
  isDarkMode: {
    type: Boolean,
    default: false
  }
})

defineEmits(['go-back', 'toggle-theme'])
</script>

<style scoped>
.page-header {
  background: var(--bg-base);
  padding: 16px 0;
  border-bottom: 1px solid var(--border-color);
  position: sticky;
  top: 0;
  z-index: 100;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  border-bottom: 2px solid var(--border-base);
}

.page-header:hover {
  background: var(--bg-base);
}

.header-content {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  transition: padding 0.3s ease;
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-left h1 {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  transition: color 0.2s ease;
}

.header-left .n-button,
.header-right .n-button {
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.header-left .n-button:hover,
.header-right .n-button:hover {
  transform: scale(1.05);
}

.header-left .n-button:active,
.header-right .n-button:active {
  transform: scale(0.95);
}

@media (max-width: 768px) {
  .page-header {
    padding: 12px 0;
  }

  .header-content {
    padding: 0 16px;
  }
}
</style>
