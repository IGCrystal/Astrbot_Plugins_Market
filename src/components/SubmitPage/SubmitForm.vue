<template>
  <div class="form-container">
    <div v-if="currentStep === 1" class="form-section">
      <n-card title="基本信息" class="form-card">
        <n-form ref="formRef" :model="formData" :rules="rules">
          <n-grid :x-gap="12" :cols="1" :item-responsive="true">
            <n-grid-item>
              <n-form-item label="插件名" path="name">
                <n-input
                  v-model:value="formData.name"
                  placeholder="插件名，请以 astrbot_plugin_ 开头"
                />
              </n-form-item>
            </n-grid-item>
            <n-grid-item>
              <n-form-item label="展示名称" path="display_name">
                <n-input
                  v-model:value="formData.display_name"
                  placeholder="用于展示的插件名，方便人类阅读"
                />
              </n-form-item>
            </n-grid-item>
            <n-grid-item>
              <n-form-item label="插件介绍" path="desc">
                <n-input
                  v-model:value="formData.desc"
                  type="textarea"
                  placeholder="插件的简短介绍（最多70字）"
                  :maxlength="70"
                  :show-count="true"
                  :rows="4"
                  class="desc-textarea"
                  :resizable="false"
                />
              </n-form-item>
            </n-grid-item>
            <n-grid-item>
              <n-form-item label="作者" path="author">
                <n-input v-model:value="formData.author" placeholder="请输入作者名称" />
              </n-form-item>
            </n-grid-item>
            <n-grid-item>
              <n-form-item label="仓库地址" path="repo">
                <n-input v-model:value="formData.repo" placeholder="请输入GitHub仓库地址" />
              </n-form-item>
            </n-grid-item>
            <n-grid-item>
              <n-form-item label="标签（可选，最多 5 个，按回车添加）" path="tags">
                <n-dynamic-tags
                  v-model:value="formData.tags"
                  :max="5"
                />
              </n-form-item>
            </n-grid-item>
            <n-grid-item>
              <n-form-item label="社交链接（可选）" path="social_link">
                <n-input
                  v-model:value="formData.social_link"
                  placeholder="请输入完整的社交链接，如个人主页、Twitter等，推荐 GitHub 主页"
                />
              </n-form-item>
            </n-grid-item>
          </n-grid>
        </n-form>
      </n-card>
    </div>

    <div v-else class="json-preview-section">
      <n-card title="预览插件信息" class="json-card">
        <div class="json-content">
          <n-code
            :code="generatedJSON || '点击生成按钮生成JSON'"
            language="json"
            :word-wrap="true"
          />
        </div>
        <div class="preview-tip">
          <p>
            点击下方按钮将自动打开 GitHub Issue 页面，插件信息会自动填充，你只需要勾选确认项并提交即可。
          </p>
        </div>
      </n-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineExpose } from 'vue'
import {
  NCard,
  NForm,
  NFormItem,
  NInput,
  NGrid,
  NGridItem,
  NDynamicTags,
  NCode
} from 'naive-ui'
import type { FormInst, FormRules, FormValidationError } from 'naive-ui'

type SubmitFormData = {
  name: string
  display_name: string
  desc: string
  author: string
  repo: string
  tags: string[]
  social_link: string
}

const props = withDefaults(defineProps<{
  formData: SubmitFormData
  rules: FormRules
  currentStep: number
  generatedJSON?: string
}>(), {
  generatedJSON: ''
})

const formRef = ref<FormInst | null>(null)

const validate = (callback?: (errors?: Array<FormValidationError> | undefined) => void) => {
  return formRef.value?.validate(callback)
}

defineExpose({
  validate
})
</script>

<style scoped>
.form-container {
  width: 100%;
  min-height: 400px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.form-card,
.json-card {
  margin-bottom: 24px;
  width: 100%;
  box-sizing: border-box;
  border: 2px solid var(--primary-color);
  animation: slideInRight 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.json-preview-section :deep(.n-code) {
  border-radius: 8px;
  background: var(--bg-base);
}

.desc-textarea :deep(.n-input__textarea-el) {
  height: 120px !important;
  min-height: 120px !important;
  max-height: 120px !important;
  resize: none !important;
}

.desc-textarea :deep(textarea),
.desc-textarea :deep(.n-input__textarea),
.desc-textarea :deep(.n-input-wrapper) {
  resize: none !important;
}

.preview-tip {
  margin-top: 16px;
  padding: 16px;
  background: var(--bg-base);
  border-radius: 8px;
}

.preview-tip p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 14px;
}

:deep(.n-form-item) {
  margin-bottom: 24px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.n-form-item-feedback-wrapper) {
  min-height: 24px;
  margin-top: 4px;
}

:deep(.n-form-item-feedback) {
  font-size: 13px;
  line-height: 1.4;
}

:deep(.n-form-item:hover) {
  transform: translateX(2px);
}

:deep(.n-input-group) {
  width: 100%;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
