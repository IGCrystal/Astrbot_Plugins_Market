import { defineNuxtPlugin } from 'nuxt/app'
import {
  create,
  NButton,
  NCard,
  NCode,
  NConfigProvider,
  NDropdown,
  NDynamicTags,
  NEmpty,
  NForm,
  NFormItem,
  NGrid,
  NGridItem,
  NIcon,
  NInput,
  NLayout,
  NLayoutHeader,
  NMessageProvider,
  NModal,
  NPagination,
  NSkeleton,
  NSpace,
  NSpin,
  NSwitch,
  NTag,
  NText,
  NTooltip,
  NSelect,
  NH2,
  NH3
} from 'naive-ui'

const components = [
  NButton,
  NCard,
  NCode,
  NConfigProvider,
  NDropdown,
  NDynamicTags,
  NEmpty,
  NForm,
  NFormItem,
  NGrid,
  NGridItem,
  NIcon,
  NInput,
  NLayout,
  NLayoutHeader,
  NMessageProvider,
  NModal,
  NPagination,
  NSkeleton,
  NSpace,
  NSpin,
  NSwitch,
  NTag,
  NText,
  NTooltip,
  NSelect,
  NH2,
  NH3
]

export default defineNuxtPlugin((nuxtApp) => {
  const naive = create({ components })
  nuxtApp.vueApp.use(naive)
})
