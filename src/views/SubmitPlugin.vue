<template>
  <div class="submit-plugin-page">
    <n-layout-header class="page-header">
      <div class="header-content">
        <div class="header-left">
          <n-button quaternary circle @click="goBack">
            <template #icon>
              <n-icon><arrow-back /></n-icon>
            </template>
          </n-button>
          <h1>提交插件</h1>
        </div>
        <div class="header-right">
          <n-button quaternary circle @click="toggleTheme">
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

    <div class="steps-section">
      <div class="custom-steps">
        <div 
          v-for="(step, index) in steps" 
          :key="index"
          class="step-item"
          :class="{
            'step-current': currentStep === index + 1,
            'step-finished': currentStep > index + 1
          }"
        >
          <div class="step-indicator">{{ index + 1 }}</div>
          <div class="step-content">
            <div class="step-title">{{ step.title }}</div>
            <div class="step-description">{{ step.description }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="page-content">
      <div class="main-section">
        <!-- 步骤1：表单 -->
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

        <!-- 步骤2：预览并提交 -->
        <div v-if="currentStep === 2" class="json-preview-section">
          <n-card title="预览插件信息" class="json-card">
            <div class="json-content">
              <n-code
                :code="generatedJSON || '点击生成按钮生成JSON'"
                language="json"
                :word-wrap="true"
              />
            </div>
            <div style="margin-top: 16px; padding: 16px; background: var(--bg-base); border-radius: 8px;">
              <p style="margin: 0 0 12px 0; color: var(--text-secondary); font-size: 14px;">
                点击下方按钮将自动打开 GitHub Issue 页面，插件信息会自动填充，你只需要勾选确认项并提交即可。
              </p>
            </div>
          </n-card>
        </div>
      </div>

      <!-- 底部操作栏 -->
      <n-card class="action-bar">
        <div class="action-content">
          <div class="action-left">
            <transition name="action-button" mode="out-in">
              <n-button 
                v-if="currentStep > 1" 
                @click="prevStep"
                quaternary
                key="prev"
                class="action-button-item"
              >
                <template #icon>
                  <n-icon><arrow-back /></n-icon>
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
                @click="validateAndGenerateJSON"
                :disabled="!formData.name"
                key="next1"
                class="action-button-item"
              >
                预览并提交
              </n-button>
              <n-button 
                v-else
                type="primary"
                @click="submitPlugin"
                key="submit"
                class="action-button-item"
              >
                <template #icon>
                  <n-icon><logo-github /></n-icon>
                </template>
                提交到GitHub
              </n-button>
            </transition>
          </div>
        </div>
      </n-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { 
  NLayoutHeader,
  NTimeline,
  NTimelineItem,
  NGrid,
  NGridItem,
  NForm, 
  NFormItem, 
  NInput, 
  NButton,
  NDynamicTags,
  NCard,
  NIcon,
  NCode,
  useMessage
} from 'naive-ui'
import { 
  ArrowBack, 
  Copy,
  Moon,
  Sunny,
  LogoGithub
} from '@vicons/ionicons5'
import { usePluginStore } from '@/stores/plugins'

const router = useRouter()
const message = useMessage()
const store = usePluginStore()
const formRef = ref(null)
const generatedJSON = ref('')
const currentStep = ref(1)
const MAX_DESC_LENGTH = 70
const steps = [
  {
    title: '填写信息',
    description: '填写插件基本信息'
  },
  {
    title: '预览并提交',
    description: '确认信息并提交'
  }
]

const { isDarkMode } = storeToRefs(store)
const toggleTheme = () => {
  store.toggleTheme()
}

const stepChecks = reactive({
  copied: false,
  issueOpened: false
})

const formData = reactive({
  name: '',
  display_name: '',
  desc: '',
  author: '',
  repo: '',
  tags: [],
  social_link: ''
})

const rules = {
  name: [
    { required: true, message: '请输入插件名', trigger: 'blur' },
    { pattern: /^astrbot_plugin_[a-z0-9_-]+$/i, message: '插件名需以 astrbot_plugin_ 开头，仅含字母、数字、下划线、短横线', trigger: 'blur' }
  ],
  display_name: {
    required: true,
    message: '请输入用于展示的插件名',
    trigger: 'blur'
  },
  desc: [
    { required: true, message: '请输入插件的简短介绍', trigger: 'blur' },
    { 
      validator: (_, value) => {
        const length = (value || '').toString().length
        return length > 0 && length <= MAX_DESC_LENGTH
      },
      message: '插件介绍最多70字',
      trigger: ['input', 'blur']
    }
  ],
  author: {
    required: true,
    message: '请输入作者名称',
    trigger: 'blur'
  },
  repo: [
    { required: true, message: '请输入仓库地址', trigger: 'blur' },
    { pattern: /^https:\/\/github\.com\/[\w-]+\/[\w.-]+$/, message: '请输入有效的GitHub仓库地址', trigger: 'blur' }
  ],
  tags: [
    {
      validator: (_, value) => !Array.isArray(value) || value.length <= 5,
      message: '标签最多 5 个',
      trigger: ['change', 'blur']
    }
  ]
}

const goBack = () => {
  if (currentStep.value > 1) {
    currentStep.value--
    return
  }
  router.back()
}

const validateAndGenerateJSON = () => {
  formRef.value?.validate((errors) => {
    if (!errors) {
      const jsonData = {
        name: formData.name,
        display_name: formData.display_name,
        desc: formData.desc,
        author: formData.author,
        repo: formData.repo,
        tags: formData.tags,
        social_link: formData.social_link
      }
      generatedJSON.value = JSON.stringify(jsonData, null, 2)
      nextStep()
    } else {
      message.error('请完善必填信息')
    }
  })
}

const copyJSON = async () => {
  try {
    await navigator.clipboard.writeText(generatedJSON.value)
    message.success('JSON已复制到剪贴板')
    stepChecks.copied = true
  } catch (err) {
    message.error('复制失败')
  }
}

const nextStep = () => {
  if (currentStep.value < 2) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const submitPlugin = () => {
  const baseUrl = 'https://github.com/AstrBotDevs/AstrBot/issues/new'

  const pluginInfoValue = `\`\`\`json\n${generatedJSON.value}\n\`\`\``
  
  const params = new URLSearchParams({
    template: 'PLUGIN_PUBLISH.yml',
    title: `[Plugin] ${formData.display_name}`,
    'plugin-info': pluginInfoValue
  })
  
  const issueUrl = `${baseUrl}?${params.toString()}`
  window.open(issueUrl, '_blank')
  stepChecks.issueOpened = true
}
</script>

<style scoped>
.submit-plugin-page {
  min-height: 100vh;
  height: 100vh;
  background: var(--body-color);
  display: flex;
  flex-direction: column;
  --action-bar-height: 72px;
  overflow: hidden; 
}

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
  
  &:hover {
    background: var(--bg-base);
  }
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

.header-left {
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

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-left .n-button,
.header-right .n-button {
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: scale(1.05);
  }
  
  &:active {
    transform: scale(0.95);
  }
}

.steps-section {
  padding: 24px 0;
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-color);
}

.custom-steps {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  padding: 0 16px;
  box-sizing: border-box;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  position: relative;
}

.step-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  gap: 8px;
  width: 120px; 
  
  @media (min-width: 426px) {
    &:first-child {
      margin-right: auto;
    }
    
    &:last-child {
      margin-left: auto;
    }
  }
}

.step-indicator {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid var(--primary-color);
  color: var(--text-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  background: var(--bg-base);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 2;
}

.step-content {
  text-align: center;
  min-width: 100px;
  padding: 0 8px;
}

.step-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
  color: var(--text-primary);
  transition: color 0.3s;
}

.step-description {
  font-size: 12px;
  color: var(--text-secondary);
  transition: color 0.3s;
}

.step-current {
  .step-indicator {
    background: var(--primary-color);
    border-color: var(--primary-color);
    color: #fff;
  }
  
  .step-title {
    color: var(--primary-color);
  }
  
  .step-description {
    color: var(--text-secondary);
  }
}

.step-finished {
  .step-indicator {
    background: var(--success-color);
    border-color: var(--success-color);
    color: var(--text-tag);
  }
  
  .step-title {
    color: var(--text-primary);
  }
}

@media (max-width: 768px) {
  .steps-section {
    padding: 16px 0;
  }
  
  .custom-steps {
    padding: 0 24px;
  }
  
  .step-content {
    min-width: 80px;
  }
  
  .step-description {
    display: none;
  }
}

@media (max-width: 425px) {
  .custom-steps {
    justify-content: center;
  }
  
  .step-item {
    display: none;
    width: auto;
    
    &.step-current {
      display: flex;
      flex-direction: row;
      gap: 12px;
      align-items: center;
      justify-content: center;
      margin: 0 auto;
      
      .step-indicator {
        flex: 0 0 32px; 
      }
      
      .step-content {
        text-align: left;
      }
      
      .step-description {
        display: block;
      }
    }
  }
  
  .step-line {
    display: none;
  }
}

.page-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  background: var(--bg-card);
  padding: 24px;
  padding-bottom: calc(var(--action-bar-height, 72px) + 24px);
  box-sizing: border-box;
  height: calc(100vh - 140px);

  :deep(.n-card) {
    background: var(--bg-card);
  }
}

.main-section {
  flex: 1;
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  box-sizing: border-box;
  position: relative;
}

.form-card,
.json-card,
.guide-card {
  margin-bottom: 24px;
  width: 100%;
  box-sizing: border-box;
}

.form-card,
.json-card,
.guide-card {
  border: 2px solid var(--primary-color);
}

.form-section,
.json-preview-section,
.submit-guide-section {
  width: 100%;
  min-height: 400px;
  box-sizing: border-box;
}

.json-preview-section {
  :deep(.n-code) {
    border-radius: 8px;
    background: var(--bg-base);
  }
}

.json-content {
  position: relative;
  opacity: 0;
  animation: fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.2s forwards;
}

.copy-button {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: translateY(0);
  }
}

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
  
  &:hover {
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
}

:deep(.n-form-item) {
  margin-bottom: 24px;
}

:deep(.n-form-item-feedback-wrapper) {
  display: none;
}

:deep(.n-input-group) {
  width: 100%;
}

.desc-textarea :deep(.n-input__textarea-el) {
  height: 120px !important;
  min-height: 120px !important;
  max-height: 120px !important;
  resize: none !important;
}

.desc-textarea :deep(textarea) {
  resize: none !important;
}

.desc-textarea :deep(.n-input__textarea) {
  resize: none !important;
}

.desc-textarea :deep(.n-input-wrapper) {
  resize: none !important;
}

:deep(.n-timeline) {
  padding: 16px;
}

.timeline-item {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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

.form-card,
.json-card,
.guide-card {
  animation: slideInRight 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.n-button {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  &:active {
    transform: translateY(0);
    transition-duration: 0.1s;
  }
}

:deep(.n-form-item) {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    transform: translateX(2px);
  }
}

@media (max-width: 768px) {
  .page-header {
    padding: 12px 0;
  }

  .header-content {
    padding: 0 16px;
  }

  .steps-section {
    padding: 16px 0;
  }

  .submit-plugin-page {
    --action-bar-height: 64px;
  }
}

@media (max-width: 425px) {
    .submit-steps {
    :deep(.n-step) {
      display: none;
      
      &.n-step--current {
        display: flex;
        flex: 0 1 auto;
      }
    }
    
    :deep(.n-step-splitor) {
      display: none;
    }
    
    :deep(.n-steps-content) {
      justify-content: center;
    }
    
    :deep(.n-step-header__title) {
      font-size: 16px;
      display: block !important;
    }
  }

  .page-content {
    padding: 16px;
    padding-bottom: calc(var(--action-bar-height, 64px) + 16px);
    height: calc(100vh - 120px);
  }

  .action-content {
    padding: 0 16px;
    height: var(--action-bar-height);
  }

  :deep(.n-card-header) {
    padding: 16px;
  }

  :deep(.n-card__content) {
    padding: 16px;
  }
}
</style>