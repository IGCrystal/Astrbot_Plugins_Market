import { defineEventHandler, setHeader, createError } from 'h3'
import { getPluginById } from '@/server/utils/pluginsCache'

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id
  if (!id) {
    throw createError({
      statusCode: 400,
      message: '插件 ID 缺失'
    })
  }

  const plugin = await getPluginById(id)
  if (!plugin) {
    throw createError({
      statusCode: 404,
      message: '未找到对应插件'
    })
  }

  setHeader(event, 'Cache-Control', 's-maxage=300, stale-while-revalidate=600')
  return plugin
})
