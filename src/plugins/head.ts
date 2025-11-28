import { defineNuxtPlugin, useHead } from 'nuxt/app'
import logoUrl from '../assets/logo.webp'

export default defineNuxtPlugin(() => {

  useHead({
    htmlAttrs: {
      lang: 'zh-CN'
    },
    title: 'AstrBot 插件市场 [社区]',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
      {
        name: 'description',
        content: 'AstrBot 插件市场是一个开放的插件分享平台，在这里您可以发现、下载和分享各种 AstrBot 框架插件。'
      },
      {
        name: 'keywords',
        content: 'AstrBot,插件市场,机器人插件,bot插件,AstrBot plugins,AstrBot Plugin,Plugin,Plugins,AI,bot,LLM'
      },
      { name: 'author', content: 'IGCrystal' },
      { property: 'og:title', content: 'AstrBot 插件市场 [社区]' },
      { property: 'og:description', content: '发现、下载和分享 AstrBot 框架插件的开放平台' },
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
