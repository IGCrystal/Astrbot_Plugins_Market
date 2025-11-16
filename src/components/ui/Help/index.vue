<template>
  <div class="float-button-wrapper">
    <transition name="float-button-fade">
      <div
        class="help-button-container"
        @mouseenter="showHelpText = true"
        @mouseleave="showHelpText = false"
      >
        <div class="help-text-container">
          <div class="help-text" :class="{ 'help-text--show': showHelpText }">
            有疑问？来看看呗！
          </div>
        </div>
        <float-action-button
          class="help-button"
          ariaLabel="帮助"
          :icon-size="22"
          @click="toggleHelp"
        >
          <template #icon>
            <help-circle />
          </template>
        </float-action-button>
      </div>
    </transition>

    <n-modal
      v-model:show="showHelp"
      :mask-closable="true"
      preset="card"
      class="help-modal"
      :class="{ 'help-modal--mobile': isMobile }"
      :style="modalStyle"
      transform-origin="center"
    >
      <n-card :bordered="false" size="huge" role="dialog" aria-label="帮助信息" class="help-card">
        <template #header>
          <div class="help-modal__header">
            <n-h2 class="help-modal__title">
              <n-icon size="24" class="help-modal__icon">
                <help-circle />
              </n-icon>
              {{ helpContent.title }}
            </n-h2>
          </div>
        </template>
        <n-space vertical size="large" class="help-modal__content">
          <div
            v-for="(section, index) in helpContent.sections"
            :key="index"
            class="help-section"
          >
            <div class="help-section__header">
              <n-h3>{{ section.title }}</n-h3>
            </div>
            <div class="markdown-content" v-html="marked(section.content)"></div>
          </div>
        </n-space>
        <template #footer>
          <div class="help-modal__footer">
            <div class="help-modal__footer-content">
              <div class="panel-link">
                <n-text depth="3">AstrBot 面板地址：</n-text>
                <div class="panel-input-group">
                  <n-input
                    v-model:value="panelUrl"
                    type="text"
                    placeholder="例如：demo.astrbot.app"
                    class="panel-input"
                  />
                  <n-button
                    secondary
                    type="primary"
                    @click="openPanelUrl"
                    :disabled="!panelUrl"
                  >
                    <template #icon>
                      <n-icon><open-outline /></n-icon>
                    </template>
                    打开面板
                  </n-button>
                </div>
              </div>
              <n-button
                type="primary"
                @click="showHelp = false"
                class="help-modal__close-btn"
              >
                我知道了
              </n-button>
            </div>
          </div>
        </template>
      </n-card>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'
import {
  NIcon,
  NModal,
  NCard,
  NSpace,
  NH2,
  NH3,
  NText,
  NButton,
  NInput
} from 'naive-ui'
import { HelpCircle, OpenOutline } from '@vicons/ionicons5'
import FloatActionButton from '../Button/FloatActionButton.vue'
import { useHelpButton } from './useHelpButton'

marked.setOptions({
  gfm: true,
  breaks: true
})

const {
  helpContent,
  isMobile,
  modalStyle,
  showHelp,
  showHelpText,
  panelUrl,
  toggleHelp,
  openPanelUrl
} = useHelpButton()
</script>

<style scoped src="./HelpButtonStyles.css"></style>
