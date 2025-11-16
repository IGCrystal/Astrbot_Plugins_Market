<template>
  <teleport to="body">
    <transition name="modal-fade">
      <div v-if="show" class="modal-mask" :class="{ dark: isDarkMode }" @click.self="show = false">
        <div class="modal-container" @click.stop>
          <!-- 头部 -->
          <div class="modal-header">
            <div class="header-content">
              <img
                v-if="plugin?.logo"
                :src="plugin.logo"
                :alt="`${plugin?.name} logo`"
                class="plugin-logo"
                loading="lazy"
                @error="onLogoError"
              />
              <n-icon v-else size="28" class="plugin-icon">
                <extension-puzzle-outline />
              </n-icon>
              <h2 class="plugin-title">{{ plugin?.name }}</h2>
              <n-tag size="small" :bordered="false" class="plugin-version" :color="versionTagColor">
                v{{ plugin?.version?.replace(/^v/i, '') }}
              </n-tag>
            </div>
            <button class="close-btn" @click="show = false" aria-label="关闭">
              <n-icon size="24">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </n-icon>
            </button>
          </div>

          <!-- 内容区域 -->
          <div class="modal-body">
            <div v-if="loading" class="content-state">
              <n-spin size="medium">
                <template #description>
                  正在加载 README...
                </template>
              </n-spin>
            </div>
            <div v-else-if="error" class="content-state">
              <n-empty description="加载 README 失败">
                <template #extra>
                  <n-button size="small" @click="fetchReadme">
                    重试
                  </n-button>
                </template>
              </n-empty>
            </div>
            <div v-else class="content-ready">
              <div class="markdown-content" v-html="readmeHtml"></div>
              <plugin-comment
                v-if="plugin?.repo"
                :repo="plugin.repo"
                :plugin-name="plugin?.name || '未知插件'"
                :theme="commentTheme"
              />
            </div>
          </div>

          <!-- 底部 -->
          <div class="modal-footer">
            <n-button
              secondary
              type="primary"
              @click="openUrl(plugin?.repo)"
            >
              <template #icon>
                <n-icon><logo-github /></n-icon>
              </template>
              查看仓库
            </n-button>
            <n-button
              type="primary"
              @click="show = false"
            >
              关闭
            </n-button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup lang="ts">
import { computed, ref, watch, onUnmounted } from 'vue'
import { marked } from 'marked'
import {
  NIcon,
  NTag,
  NButton,
  NSpin,
  NEmpty
} from 'naive-ui'
import { storeToRefs } from 'pinia'
import { usePluginStore } from '@/stores/plugins'
import {
  ExtensionPuzzleOutline,
  LogoGithub
} from '@vicons/ionicons5'
import PluginComment from './PluginComment.vue'
import type { PluginRecord } from '@/types/plugin'

const props = withDefaults(defineProps<{ show: boolean; plugin?: PluginRecord | null }>(), {
  show: false,
  plugin: null
})

const emit = defineEmits<{ (event: 'update:show', value: boolean): void }>()

const show = ref(props.show)
const loading = ref(false)
const error = ref(false)
const readmeHtml = ref('')

const onLogoError = (event: Event) => {
  const target = event.target as HTMLImageElement | null
  if (target) {
    target.style.display = 'none'
  }
}

// 获取全局主题状态
const store = usePluginStore()
const { isDarkMode } = storeToRefs(store)
const commentTheme = computed(() => (isDarkMode.value ? 'dark' : 'light'))
const versionTagColor = computed(() => ({
  color: 'var(--primary-color)',
  borderColor: 'transparent',
  textColor: 'var(--text-tag, #ffffff)'
}))

onUnmounted(() => {
  document.body.style.overflow = ''
})

watch(() => props.show, (newVal) => {
  show.value = newVal
})

watch(show, (newVal) => {
  emit('update:show', newVal)
  if (newVal) {
    fetchReadme()
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

const openUrl = (url?: string | null) => {
  if (url) {
    window.open(url, '_blank')
  }
}

const fetchWithTimeout = async (input: RequestInfo | URL, options: RequestInit = {}, timeout = 10000) => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  try {
    return await fetch(input, { ...options, signal: controller.signal })
  } finally {
    clearTimeout(timer)
  }
}

async function fetchReadme() {
  const repoPath = props.plugin?.repo
  if (!repoPath) return

  const segments = repoPath.split('/').filter(Boolean)
  if (segments.length < 2) return
  const [owner, repo] = segments.slice(-2)

  loading.value = true
  error.value = false

  try {
    let readmeText = ''

    try {
      const apiResp = await fetchWithTimeout(
        `https://api.github.com/repos/${owner}/${repo}/readme`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/vnd.github.v3.raw'
          }
        }
      )

      if (apiResp.ok) {
        readmeText = await apiResp.text()
      } else {
        throw new Error(`GitHub API /readme returned ${apiResp.status}`)
      }
    } catch (apiErr) {
      console.error('Error fetching README via API:', apiErr)
      const branches = ['main', 'master']
      const candidates = ['README.md', 'Readme.md', 'readme.md', 'README.MD', 'README']

      let found = false
      for (const branch of branches) {
        for (const filename of candidates) {
          try {
            const resp = await fetchWithTimeout(
              `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filename}`,
              {
                method: 'GET',
                headers: {
                  Accept: 'text/plain'
                }
              }
            )
            if (resp.ok) {
              readmeText = await resp.text()
              found = true
              break
            }
          } catch (rawErr) {
            console.error('Error fetching README via raw URL:', rawErr)
          }
        }
        if (found) break
      }

      if (!found) {
        throw new Error('无法获取 README（API 与镜像均失败）')
      }
    }

    if (!readmeText) {
      throw new Error('README 内容为空')
    }

    const parsed = marked.parse(readmeText)
    readmeHtml.value = typeof parsed === 'string' ? parsed : await parsed
  } catch (err) {
    console.error('Error fetching README:', err)
    error.value = true
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* 模态框遮罩 */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

/* 模态框容器 */
.modal-container {
  background-color: #ffffff;
  color: #1e293b;
  border-radius: 12px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 900px;
  height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-family: 'Lexend', 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* 深色模式下的样式 */
.modal-mask.dark .modal-container {
  background-color: #1e293b;
  color: #f1f5f9;
}

.modal-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  border-bottom: 1px solid #e2e8f0;
  gap: 16px;
}

.modal-mask.dark .modal-header {
  border-bottom-color: #334155;
}

.header-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.plugin-logo {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}

.plugin-icon {
  flex-shrink: 0;
  color: #64748b;
}

.modal-mask.dark .plugin-icon {
  color: #cbd5e1;
}

.plugin-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
  font-family: 'Lexend', 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.modal-mask.dark .plugin-title {
  color: #f1f5f9;
}

.plugin-version {
  flex-shrink: 0;
}

.close-btn {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f8fafc;
  color: #1e293b;
}

.modal-mask.dark .close-btn {
  color: #cbd5e1;
}

.modal-mask.dark .close-btn:hover {
  background: #334155;
  color: #f1f5f9;
}

/* 内容区域 */
.modal-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 24px;
  display: flex;
  flex-direction: column;
}

.content-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  width: 100%;
}

.content-ready {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 底部 */
.modal-footer {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px 24px;
  border-top: 1px solid #e2e8f0;
}

.modal-mask.dark .modal-footer {
  border-top-color: #334155;
}

.markdown-content {
  color: #64748b;
  line-height: 1.6;
  word-wrap: break-word;
  overflow-wrap: break-word;
  font-family: 'Lexend', 'Noto Sans SC', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.modal-mask.dark .markdown-content {
  color: #cbd5e1;
}

.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4),
.markdown-content :deep(h5),
.markdown-content :deep(h6) {
  margin: 1.5em 0 0.5em;
  color: #1e293b;
}

.modal-mask.dark .markdown-content :deep(h1),
.modal-mask.dark .markdown-content :deep(h2),
.modal-mask.dark .markdown-content :deep(h3),
.modal-mask.dark .markdown-content :deep(h4),
.modal-mask.dark .markdown-content :deep(h5),
.modal-mask.dark .markdown-content :deep(h6) {
  color: #f1f5f9;
}

.markdown-content :deep(h1:first-child),
.markdown-content :deep(h2:first-child),
.markdown-content :deep(h3:first-child) {
  margin-top: 0;
}

.markdown-content :deep(p) {
  margin: 1em 0;
}

.markdown-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  display: block;
}

.markdown-content :deep(code) {
  background: #f8fafc;
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-size: 0.9em;
  font-family: monospace;
}

.modal-mask.dark .markdown-content :deep(code) {
  background: #334155;
}

.markdown-content :deep(pre) {
  background: #f8fafc;
  padding: 16px;
  border-radius: 8px;
  overflow-x: auto;
  max-width: 100%;
}

.modal-mask.dark .markdown-content :deep(pre) {
  background: #334155;
}

.markdown-content :deep(pre code) {
  background: none;
  padding: 0;
  border-radius: 0;
}

.markdown-content :deep(blockquote) {
  margin: 1em 0;
  padding-left: 1em;
  border-left: 4px solid #e2e8f0;
  color: #94a3b8;
}

.modal-mask.dark .markdown-content :deep(blockquote) {
  border-left-color: #334155;
  color: #94a3b8;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  padding-left: 2em;
  margin: 1em 0;
}

.markdown-content :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 1em 0;
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
  border: 1px solid #e2e8f0;
  padding: 8px;
  text-align: left;
}

.modal-mask.dark .markdown-content :deep(th),
.modal-mask.dark .markdown-content :deep(td) {
  border-color: #334155;
}

.markdown-content :deep(th) {
  background: #f8fafc;
}

.modal-mask.dark .markdown-content :deep(th) {
  background: #334155;
}

/* 过渡动画 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-active .modal-container {
  animation: modal-slide-in 0.3s ease;
}

.modal-fade-leave-active .modal-container {
  animation: modal-slide-out 0.3s ease;
}

@keyframes modal-slide-in {
  from {
    transform: translateY(-50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes modal-slide-out {
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(-50px);
    opacity: 0;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .modal-mask {
    padding: 10px;
  }
  
  .modal-container {
    height: 85vh;
  }
  
  .modal-header {
    padding: 16px;
  }
  
  .modal-body {
    padding: 16px;
  }
  
  .modal-footer {
    padding: 16px;
  }
  
  .plugin-title {
    font-size: 1.25rem;
  }
}

@media (max-width: 480px) {
  .modal-header {
    padding: 12px;
  }
  
  .modal-body {
    padding: 12px;
  }
  
  .modal-container {
    height: 80vh;
  }
  
  .modal-footer {
    padding: 12px;
    flex-wrap: wrap;
  }
  
  .plugin-title {
    font-size: 1.1rem;
  }
  
  .header-content {
    gap: 8px;
  }
}
</style>
