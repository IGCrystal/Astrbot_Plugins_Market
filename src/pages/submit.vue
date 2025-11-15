<template>
  <div class="submit-plugin-page">
    <submit-header
      :is-dark-mode="isDarkMode"
      @go-back="goBack"
      @toggle-theme="toggleTheme"
    />

    <submit-steps
      :steps="steps"
      :current-step="currentStep"
    />

    <div class="page-content">
      <div class="main-section">
        <submit-form
          ref="submitFormRef"
          :form-data="formData"
          :rules="rules"
          :current-step="currentStep"
          :generated-json="generatedJSON"
        />
      </div>
    </div>

    <submit-action-bar
      :current-step="currentStep"
      :disable-next="!formData.name"
      @prev-step="prevStep"
      @validate="validateAndGenerateJSON"
      @submit="submitPlugin"
    />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { storeToRefs } from 'pinia'
import { useMessage } from 'naive-ui'
import SubmitHeader from '@/components/SubmitPage/SubmitHeader.vue'
import SubmitSteps from '@/components/SubmitPage/SubmitSteps.vue'
import SubmitForm from '@/components/SubmitPage/SubmitForm.vue'
import SubmitActionBar from '@/components/SubmitPage/SubmitActionBar.vue'
import { usePluginStore } from '@/stores/plugins'

const router = useRouter()
const message = useMessage()
const store = usePluginStore()
const submitFormRef = ref(null)
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
    { 
      validator: (_, value) => {
        if (!value) return true
        if (!value.startsWith('astrbot_plugin_')) {
          return new Error('插件名必须以 astrbot_plugin_ 开头')
        }
        const afterPrefix = value.substring(16)
        if (!afterPrefix) {
          return new Error('插件名在 astrbot_plugin_ 后必须包含内容')
        }
        if (!/^[a-z0-9_-]+$/i.test(afterPrefix)) {
          const invalidChars = afterPrefix.match(/[^a-z0-9_-]/gi)
          if (invalidChars) {
            const uniqueChars = [...new Set(invalidChars)].join('、')
            return new Error(`插件名包含非法字符：${uniqueChars}（仅允许字母、数字、下划线、短横线）`)
          }
          return new Error('插件名仅允许包含字母、数字、下划线、短横线')
        }
        
        return true
      },
      trigger: 'blur'
    }
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
  submitFormRef.value?.validate((errors) => {
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
@media (max-width: 768px) {
  .submit-plugin-page {
    --action-bar-height: 64px;
  }
}

@media (max-width: 425px) {
  .page-content {
    padding: 16px;
    padding-bottom: calc(var(--action-bar-height, 64px) + 16px);
    height: calc(100vh - 120px);
  }

  :deep(.n-card-header) {
    padding: 16px;
  }

  :deep(.n-card__content) {
    padding: 16px;
  }
}
</style>