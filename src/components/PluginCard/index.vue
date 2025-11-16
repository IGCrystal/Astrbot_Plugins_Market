<template>
  <article
    class="plugin-card-wrapper"
    itemscope
    itemtype="https://schema.org/SoftwareApplication"
    :aria-label="`插件: ${displayName}`"
    :aria-expanded="showPluginDetails"
    tabindex="0"
    ref="cardRef"
    @keydown.enter.prevent="showDetails"
    @keydown.space.prevent="showDetails"
  >
    <meta itemprop="name" :content="displayName">
    <meta v-if="descriptionContent" itemprop="description" :content="descriptionContent">
    <meta v-if="plugin.version" itemprop="softwareVersion" :content="plugin.version">
    <meta itemprop="applicationCategory" content="Chatbot Plugin">
    <meta itemprop="operatingSystem" content="AstrBot Framework">
    <meta v-if="plugin.logo && !showFallbackLogo" itemprop="image" :content="plugin.logo">
    <meta v-if="primaryUrl" itemprop="url" :content="primaryUrl">
    <meta v-if="keywordsContent" itemprop="keywords" :content="keywordsContent">
    <span v-if="plugin.author" itemprop="author" itemscope itemtype="https://schema.org/Person" aria-hidden="true">
      <meta itemprop="name" :content="plugin.author">
    </span>
    <span
      v-if="starsValue > 0"
      itemprop="interactionStatistic"
      itemscope
      itemtype="https://schema.org/InteractionCounter"
      aria-hidden="true"
    >
      <meta itemprop="interactionType" content="https://schema.org/LikeAction">
      <meta itemprop="userInteractionCount" :content="starsValue">
    </span>

    <n-card
      class="plugin-card"
      :bordered="false"
      :style="{ borderRadius: '16px', '--card-index': String(index) }"
      :content-style="{ padding: '8px 16px' }"
      @click="showDetails"
    >
    <n-space vertical class="card-content" role="group" aria-label="插件卡片内容布局">
      <div class="card-layout" role="group" aria-labelledby="plugin-header-content">
        <div class="logo-column">
          <img
            v-if="plugin.logo && !showFallbackLogo"
            :src="plugin.logo"
            :alt="`${displayName} logo`"
            class="plugin-logo"
            loading="lazy"
            @error="handleLogoError"
          />
          <n-icon
            v-else
            size="32"
            class="plugin-logo plugin-logo--placeholder"
            aria-hidden="true"
          >
            <extension-puzzle-outline />
          </n-icon>
        </div>
        <div class="card-main">
          <div
            class="card-header"
            role="group"
            aria-labelledby="plugin-header-content"
          >
            <div
              id="plugin-header-content"
              class="plugin-name-container"
              ref="nameContainer"
              role="heading"
              aria-level="2"
              aria-label="插件卡片标题区域"
            >
              <h3
                class="plugin-name"
                :class="{ marquee: isTextOverflow }"
                ref="pluginNameEl"
                role="heading"
                aria-level="3"
                :aria-label="displayName"
                :aria-description="`插件：${displayName}，版本 ${plugin.version}`"
              >
                <span
                  class="plugin-name-text"
                  ref="nameTextEl"
                  :aria-hidden="isTextOverflow"
                >{{ displayName }}</span>
              </h3>
            </div>
            <n-tag
              type="success"
              size="small"
              :bordered="false"
              class="version-tag"
              role="text"
              :aria-label="`版本号：v${plugin.version.replace(/^v/i, '')}`"
            >
              v{{ plugin.version.replace(/^v/i, '') }}
            </n-tag>
          </div>
          <p class="description" role="contentinfo" aria-label="插件描述">{{ plugin.desc }}</p>
        </div>
      </div>
      <div
        class="tags-container"
        role="region"
        aria-label="插件标签区域"
      >
        <n-space class="tags-space" role="list" aria-label="标签列表">
          <n-tag
            v-for="tag in plugin.tags"
            :key="tag"
            size="small"
            :bordered="false"
            type="info"
            class="plugin-tag"
            role="listitem"
            :aria-label="`标签：${tag}`"
          >
            {{ tag }}
          </n-tag>
        </n-space>
      </div>
      <div class="plugin-meta" role="group" aria-label="插件元数据">
        <span class="author" role="text" :aria-label="`作者: ${plugin.author}`">作者: {{ plugin.author }}</span>
        <n-space align="center" class="stars" role="group" aria-label="星标数">
          <n-icon aria-hidden="true"><star-sharp /></n-icon>
          <span role="text">{{ plugin.stars }}</span>
        </n-space>
      </div>
      <div class="plugin-links" role="toolbar" aria-label="插件操作区">
        <div class="button-group" role="group" aria-label="插件链接操作">
          <n-button
            type="primary"
            secondary
            size="small"
            @click="(e) => openUrl(plugin.repo, e)"
            class="main-button"
            role="link"
            :aria-label="`查看 ${displayName} 的仓库`"
            aria-haspopup="true"
            aria-expanded="false"
          >
            查看仓库
          </n-button>
          <div class="icon-buttons" role="group" aria-label="快捷操作按钮组">
            <n-tooltip placement="top" trigger="hover">
              <template #trigger>
                <n-button
                  secondary
                  size="small"
                  circle
                  @click="copyRepoUrl"
                  role="button"
                  :aria-label="`复制 ${displayName} 的仓库链接`"
                  :aria-pressed="isCopied"
                  aria-live="polite"
                >
                  <n-icon size="18" aria-hidden="true">
                    <template v-if="isCopied">
                      <checkmark-outline />
                    </template>
                    <template v-else>
                      <link-outline />
                    </template>
                  </n-icon>
                </n-button>
              </template>
              <span role="tooltip">{{ isCopied ? '已复制链接！' : '复制仓库链接' }}</span>
            </n-tooltip>
            <n-tooltip v-if="plugin.social_link" placement="top" trigger="hover">
              <template #trigger>
                <n-button
                  secondary
                  size="small"
                  circle
                  @click="(e) => openUrl(plugin.social_link, e)"
                  role="link"
                  :aria-label="`访问${plugin.author}的主页`"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  <n-icon size="18" aria-hidden="true">
                    <person-outline />
                  </n-icon>
                </n-button>
              </template>
              <span role="tooltip">访问作者主页</span>
            </n-tooltip>
          </div>
        </div>
      </div>
    </n-space>
  </n-card>
  </article>

  <plugin-details
    v-model:show="showPluginDetails"
    :plugin="plugin"
  />
</template>

<script setup>
import { computed, defineAsyncComponent } from 'vue'
import {
  NCard,
  NSpace,
  NTag,
  NButton,
  NIcon,
  NTooltip
} from 'naive-ui'
import {
  StarSharp,
  LinkOutline,
  PersonOutline,
  CheckmarkOutline,
  ExtensionPuzzleOutline
} from '@vicons/ionicons5'
import { usePluginCard } from './usePluginCard'

const props = defineProps({
  plugin: {
    type: Object,
    required: true
  },
  index: {
    type: Number,
    default: 0
  },
  seed: {
    type: [Number, String],
    default: 0
  }
})

const PluginDetails = defineAsyncComponent(() => import('../ui/PluginDetails.vue'))

const primaryUrl = computed(() => props.plugin?.repo || props.plugin?.homepage || props.plugin?.social_link || '')
const descriptionContent = computed(() => {
  const description = props.plugin?.desc
  return typeof description === 'string' ? description.replace(/\s+/g, ' ').trim() : ''
})
const keywordsContent = computed(() => (Array.isArray(props.plugin?.tags) && props.plugin.tags.length ? props.plugin.tags.join(', ') : ''))
const starsValue = computed(() => {
  const value = Number(props.plugin?.stars ?? 0)
  return Number.isFinite(value) ? Math.max(value, 0) : 0
})

const {
  showPluginDetails,
  displayName,
  showFallbackLogo,
  handleLogoError,
  nameContainer,
  nameTextEl,
  pluginNameEl,
  cardRef,
  isTextOverflow,
  copyRepoUrl,
  openUrl,
  showDetails,
  isCopied
} = usePluginCard(props)
</script>

<style scoped src="./PluginCardStyles.css"></style>
