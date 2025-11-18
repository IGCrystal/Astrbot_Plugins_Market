import { createError, defineEventHandler, setHeader } from 'h3'

const BING_ENDPOINT = 'https://www.bing.com/HPImageArchive.aspx'
const BING_HOST = 'https://www.bing.com'
const DEFAULT_MARKET = 'zh-CN'
const DEFAULT_COUNT = 8

interface BingImage {
  startdate: string
  fullstartdate: string
  enddate: string
  url: string
  urlbase: string
  copyright: string
  copyrightlink?: string
  title?: string
  quiz?: string
  wp?: boolean
  hsh?: string
}

interface BingResponse {
  images?: BingImage[]
}

const buildImageUrl = (path?: string) => {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${BING_HOST}${path}`
}

const buildVariant = (urlbase: string, suffix: string) => `${BING_HOST}${urlbase}_${suffix}.jpg`

export default defineEventHandler(async (event) => {
  let response: BingResponse
  try {
    response = await $fetch<BingResponse>(BING_ENDPOINT, {
      query: {
        format: 'js',
        idx: 0,
        n: DEFAULT_COUNT,
        mkt: DEFAULT_MARKET
      },
      timeout: 5000
    })
  } catch (error) {
    throw createError({
      statusCode: 502,
      statusMessage: '无法获取 Bing 壁纸数据',
      data: error
    })
  }

  const images = response.images ?? []
  if (!images.length) {
    throw createError({
      statusCode: 404,
      statusMessage: '未找到可用的壁纸'
    })
  }

  const selectedIndex = Math.floor(Math.random() * images.length)
  const image = images[selectedIndex]

  if (!image) {
    throw createError({
      statusCode: 404,
      statusMessage: '壁纸数据缺失'
    })
  }

  const hdUrl = buildImageUrl(image.url)
  const variants = {
    '1920x1080': hdUrl,
    UHD: buildVariant(image.urlbase, 'UHD'),
    '1366x768': buildVariant(image.urlbase, '1366x768'),
    '1080x1920': buildVariant(image.urlbase, '1080x1920')
  }
  const cacheKey = Date.now().toString(36)
  const proxyUrl = hdUrl
    ? `/api/bing-wallpaper/image?src=${encodeURIComponent(hdUrl)}&v=${cacheKey}`
    : null

  setHeader(event, 'Cache-Control', 'no-store, no-cache, must-revalidate')
  setHeader(event, 'Pragma', 'no-cache')
  setHeader(event, 'Expires', '0')

  return {
    index: selectedIndex,
    startDate: image.startdate,
    endDate: image.enddate,
    title: image.title,
    copyright: image.copyright,
    copyrightLink: image.copyrightlink,
    quiz: image.quiz,
    wallpaper: variants,
    primaryUrl: hdUrl ?? variants['1920x1080'],
    proxyUrl,
    market: DEFAULT_MARKET
  }
})
