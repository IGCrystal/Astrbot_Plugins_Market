import { Buffer } from 'node:buffer'
import { defineEventHandler, createError, setHeader } from 'h3'
import { marked } from 'marked'
import { getPluginById } from '@/server/utils/pluginsCache'

const CACHE_TTL_MS = 1000 * 60 * 60 * 6 // 6 hours

interface ReadmeCacheEntry {
  timestamp: number
  html: string
  assetBaseUrl: string | null
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

interface ResolvedReadme {
  content: string
  assetBaseUrl: string | null
}

const resolveReadme = async (owner: string, repo: string): Promise<ResolvedReadme> => {
  const apiResp = await fetchWithTimeout(
    `https://api.github.com/repos/${owner}/${repo}/readme`,
    {
      method: 'GET',
      headers: {
        Accept: 'application/vnd.github+json'
      }
    }
  )

  if (apiResp.ok) {
    const data = await apiResp.json() as {
      content?: string
      encoding?: string
      download_url?: string
    }

    let content = ''
    if (data?.encoding === 'base64' && typeof data.content === 'string') {
      content = Buffer.from(data.content, 'base64').toString('utf-8')
    } else if (typeof data?.content === 'string') {
      content = data.content
    }

    if (!content && data?.download_url) {
      const rawResp = await fetchWithTimeout(data.download_url, {
        method: 'GET',
        headers: {
          Accept: 'text/plain'
        }
      })
      if (rawResp.ok) {
        content = await rawResp.text()
      }
    }

    if (content) {
      const baseFromDownload = typeof data?.download_url === 'string'
        ? data.download_url.slice(0, data.download_url.lastIndexOf('/') + 1)
        : null
      return {
        content,
        assetBaseUrl: baseFromDownload
      }
    }
  }

  for (const branch of branches) {
    for (const filename of candidates) {
      const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filename}`
      const resp = await fetchWithTimeout(url, {
        method: 'GET',
        headers: {
          Accept: 'text/plain'
        }
      })
      if (resp.ok) {
        const content = await resp.text()
        return {
          content,
          assetBaseUrl: url.slice(0, url.lastIndexOf('/') + 1)
        }
      }
    }
  }

  throw createError({
    statusCode: 404,
    message: '未找到 README 内容'
  })
}

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id
  if (!id) {
    throw createError({
      statusCode: 400,
      message: '插件 ID 缺失'
    })
  }

  const plugin = await getPluginById(id)
  if (!plugin?.repo) {
    throw createError({
      statusCode: 404,
      message: '插件未提供仓库地址'
    })
  }

  const cached = readmeCache.get(id)
  const now = Date.now()

  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    setHeader(event, 'Cache-Control', 's-maxage=1800, stale-while-revalidate=3600')
    return { html: cached.html, assetBaseUrl: cached.assetBaseUrl }
  }

  const segments = plugin.repo.split('/').filter(Boolean)
  if (segments.length < 2) {
    throw createError({
      statusCode: 400,
      message: '仓库地址格式不正确'
    })
  }
  const [owner, repo] = segments.slice(-2) as [string, string]

  const { content: readmeRaw, assetBaseUrl } = await resolveReadme(owner, repo)
  if (!readmeRaw) {
    throw createError({
      statusCode: 404,
      message: 'README 内容为空'
    })
  }

  const parsed = await marked.parse(readmeRaw)
  const html = typeof parsed === 'string' ? parsed : await parsed

  readmeCache.set(id, {
    timestamp: now,
    html,
    assetBaseUrl
  })

  setHeader(event, 'Cache-Control', 's-maxage=1800, stale-while-revalidate=3600')
  return { html, assetBaseUrl }
})
