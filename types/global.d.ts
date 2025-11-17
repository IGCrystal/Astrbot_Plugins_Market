declare module '*?raw' {
  const content: string
  export default content
}

declare module '*.md' {
  const content: string
  export default content
}

declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '#app' {
  import type { CookieOptions } from 'nuxt/app'
  import type { Ref } from 'vue'
  export function useCookie<T = string | null>(name: string, opts?: CookieOptions): Ref<T | null>
}

declare module '#imports' {
  export * from '../.nuxt/imports'
}

declare module '#vue-router' {
  export * from 'vue-router'
}

declare module '@unhead/schema' {
  interface Head {
    __dangerouslyDisableSanitizersByTagID?: Record<string, Array<'innerHTML' | 'innerText'>>
  }
}

declare module '@/stores/plugins' {
  export * from '../src/stores/plugins'
}

declare module '@/utils/highlight' {
  export * from '../src/utils/highlight'
}

declare module '@/utils/config/lightTheme' {
  export * from '../src/utils/config/lightTheme'
}

declare module '@/utils/config/darkTheme' {
  export * from '../src/utils/config/darkTheme'
}

declare module '@/utils/helpContent' {
  export * from '../src/utils/helpContent'
}

declare module '@/composables/useNaiveHydration' {
  export * from '../src/composables/useNaiveHydration'
}

declare module './usePluginCard' {
  export * from '../src/components/PluginCard/usePluginCard'
}

declare module 'h3' {
  import type { AuthSession } from '../src/server/utils/auth'
  interface H3EventContext {
    authUser?: AuthSession | null
  }
}
