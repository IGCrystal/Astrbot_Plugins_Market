import { defineEventHandler, setHeader } from 'h3'
import { fetchPluginsWithCache } from '@/server/utils/pluginsCache'

export default defineEventHandler(async (event) => {
  const plugins = await fetchPluginsWithCache()
  setHeader(event, 'Cache-Control', 's-maxage=300, stale-while-revalidate=600')
  return plugins
})
