import { defineNuxtPlugin, useHead } from 'nuxt/app'
import logoUrl from '../assets/logo.webp'

export default defineNuxtPlugin(() => {

  useHead({
    htmlAttrs: {
      lang: 'zh-CN'
    },
    title: 'AstrBot 插件市场 [社区] | 探索高质量 AstrBot 插件与社区资源',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
      {
        key: 'description',
        name: 'description',
        content: 'AstrBot 插件市场是一个开放的插件分享平台，在这里您可以发现、下载和分享各种 AstrBot 框架插件，获取详尽的功能介绍、标签分类、版本更新与使用建议，帮助用户快速构建更智能的使用体验。'
      },
      {
        name: 'keywords',
        content: 'AstrBot,插件市场,机器人插件,bot插件,AstrBot plugins,AstrBot Plugin,Plugin,Plugins,AI,bot,LLM'
      },
      { name: 'author', content: 'IGCrystal' },
      { property: 'og:title', content: 'AstrBot 插件市场 [社区] | 探索高质量 AstrBot 插件与社区资源' },
      {
        key: 'og:description',
        property: 'og:description',
        content: '在 AstrBot 插件市场发现、下载和分享优质 AstrBot 框架插件，了解插件评分、版本迭代与最佳实践，连接活跃的开发者社区。'
      },
      { property: 'og:image', content: '/AstrBot_AI.png' },
      { property: 'og:image', content: logoUrl },
      { property: 'og:type', content: 'website' },
      { name: 'theme-color', content: '#60a5fa' },
      { name: 'application-name', content: 'AstrBot 插件市场 [社区]' },
    ],
    link: [
      { rel: 'icon', type: 'image/webp', href: logoUrl },
      { rel: 'preconnect', href: 'https://api.soulter.top', crossorigin: '' },
      { rel: 'dns-prefetch', href: '//api.soulter.top' },
      { rel: 'preload', as: 'image', href: logoUrl, imagesrcset: `${logoUrl} 1x` }
    ]
  })
})
