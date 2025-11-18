import { createError, defineEventHandler, getQuery, setHeader } from 'h3'

const BING_HOST = 'https://www.bing.com'
const ALLOWED_HOSTS = [BING_HOST]

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const src = typeof query.src === 'string' ? query.src : null

  if (!src) {
    throw createError({
      statusCode: 400,
      statusMessage: '缺少图片地址参数'
    })
  }

  if (!ALLOWED_HOSTS.some((host) => src.startsWith(host))) {
    throw createError({
      statusCode: 400,
      statusMessage: '不允许的图片来源'
    })
  }

  let response
  try {
    response = await $fetch.raw(src, {
      responseType: 'arrayBuffer',
      headers: {
        'User-Agent': 'AstrBotPluginsMarket/1.0'
      }
    })
  } catch (error) {
    throw createError({
      statusCode: 502,
      statusMessage: '无法获取壁纸图像',
      data: error
    })
  }

  if (!response.ok || !response._data) {
    throw createError({
      statusCode: 502,
      statusMessage: '壁纸图像响应异常'
    })
  }

  const arrayBuffer = response._data as ArrayBuffer
  const buffer = Buffer.from(arrayBuffer)
  const contentType = response.headers.get('content-type') ?? 'image/jpeg'
  setHeader(event, 'Content-Type', contentType)
  setHeader(event, 'Cache-Control', 'public, max-age=3600')
  setHeader(event, 'Content-Length', buffer.length)
  return buffer
})
