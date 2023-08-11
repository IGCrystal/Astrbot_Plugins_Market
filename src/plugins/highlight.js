import hljs from 'highlight.js/lib/core'
import json from 'highlight.js/lib/languages/json'
import 'highlight.js/styles/atom-one-dark.css'

// 注册需要的语言
hljs.registerLanguage('json', json)

export const highlightConfig = {
  hljs
}
