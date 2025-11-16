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
  export * from '#app'
}
