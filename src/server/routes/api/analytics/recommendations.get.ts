import { defineEventHandler, getQuery } from 'h3'
import { getAnalyticsEventsCollection } from '@/server/utils/mongo'

const MAX_LIMIT = 16
const DEFAULT_LIMIT = 8
const LOOKBACK_DAYS = 30

export default defineEventHandler(async (event) => {
  const query = getQuery<{ clientId?: string; githubLogin?: string; limit?: string }>(event)
  const limit = Math.min(Math.max(Number(query.limit) || DEFAULT_LIMIT, 1), MAX_LIMIT)
  const collection = await getAnalyticsEventsCollection()
  const sinceDate = new Date(Date.now() - LOOKBACK_DAYS * 24 * 60 * 60 * 1000)

  const clientId = typeof query.clientId === 'string' && query.clientId.trim().length > 0 ? query.clientId.trim() : null
  const githubLogin = typeof query.githubLogin === 'string' && query.githubLogin.trim().length > 0
    ? query.githubLogin.trim().toLowerCase()
    : null
  const identityFilter = githubLogin ? { githubLogin } : clientId ? { clientId } : null

  if (!identityFilter) {
    const fallback = await collection
      .aggregate([
        {
          $match: {
            createdAt: { $gte: sinceDate },
            pluginId: { $exists: true, $ne: null }
          }
        },
        { $sort: { createdAt: -1 } },
        {
          $group: {
            _id: '$pluginId',
            pluginId: { $first: '$pluginId' },
            pluginSnapshot: { $first: '$pluginSnapshot' },
            total: { $sum: 1 }
          }
        },
        { $sort: { total: -1 } },
        { $limit: limit }
      ])
      .toArray()

    return {
      personalized: false,
      items: fallback.map((item) => ({
        pluginId: item.pluginId,
        pluginSnapshot: item.pluginSnapshot,
        score: item.total
      }))
    }
  }

  const topTags = await collection
    .aggregate([
      {
        $match: {
          ...identityFilter,
          createdAt: { $gte: sinceDate },
          pluginTags: { $exists: true, $ne: [] }
        }
      },
      { $unwind: '$pluginTags' },
      {
        $group: {
          _id: '$pluginTags',
          score: { $sum: 1 }
        }
      },
      { $sort: { score: -1 } },
      { $limit: 5 }
    ])
    .toArray()

  if (!topTags.length) {
    return {
      personalized: false,
      items: []
    }
  }

  const tagList = topTags.map((entry) => entry._id)

  const recommendations = await collection
    .aggregate([
      {
        $match: {
          createdAt: { $gte: sinceDate },
          pluginId: { $exists: true, $ne: null },
          pluginTags: { $in: tagList }
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: '$pluginId',
          pluginId: { $first: '$pluginId' },
          pluginSnapshot: { $first: '$pluginSnapshot' },
          score: { $sum: 1 }
        }
      },
      { $sort: { score: -1 } },
      { $limit: limit }
    ])
    .toArray()

  return {
    personalized: true,
    tags: tagList,
    items: recommendations.map((item) => ({
      pluginId: item.pluginId,
      pluginSnapshot: item.pluginSnapshot,
      score: item.score
    }))
  }
})
