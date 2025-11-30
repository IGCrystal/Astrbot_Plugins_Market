import { defineEventHandler, createError, setHeader } from 'h3'
import { marked } from 'marked'
import { getPluginById } from '@/server/utils/pluginsCache'

const CACHE_TTL_MS = 1000 * 60 * 60 * 6 // 6 hours

interface ReadmeCacheEntry {
  timestamp: number
  html: string
}

const readmeCache = new Map<string, ReadmeCacheEntry>()

const fetchWithTimeout = async (input: string, options: RequestInit = {}, timeout = 10000) => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  try {
    return await fetch(input, {
      ...options,
      signal: controller.signal
    })
  } finally {
    clearTimeout(timer)
  }
}

const candidates = ['README.md', 'Readme.md', 'readme.md', 'README.MD', 'README']
const branches = ['main', 'master']

const resolveReadme = async (owner: string, repo: string): Promise<string> => {
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
    return apiResp.text()
  }

  for (const branch of branches) {
    for (const filename of candidates) {
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
        return resp.text()
      }
    }
  }

  throw createError({
    statusCode: 404,
    statusMessage: '未找到 README 内容'
  })
}

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: '插件 ID 缺失'
    })
  }

  const plugin = await getPluginById(id)
  if (!plugin?.repo) {
    throw createError({
      statusCode: 404,
      statusMessage: '插件未提供仓库地址'
    })
  }

  const cached = readmeCache.get(id)
  const now = Date.now()

  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    setHeader(event, 'Cache-Control', 's-maxage=1800, stale-while-revalidate=3600')
    return { html: cached.html }
  }

  const segments = plugin.repo.split('/').filter(Boolean)
  if (segments.length < 2) {
    throw createError({
      statusCode: 400,
      statusMessage: '仓库地址格式不正确'
    })
  }
  const [owner, repo] = segments.slice(-2) as [string, string]

  const readmeRaw = await resolveReadme(owner, repo)
  if (!readmeRaw) {
    throw createError({
      statusCode: 404,
      statusMessage: 'README 内容为空'
    })
  }

  const parsed = await marked.parse(readmeRaw)
  const html = typeof parsed === 'string' ? parsed : await parsed

  readmeCache.set(id, {
    timestamp: now,
    html
  })

  setHeader(event, 'Cache-Control', 's-maxage=1800, stale-while-revalidate=3600')
  return { html }
})
