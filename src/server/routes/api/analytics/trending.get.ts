import { defineEventHandler, getQuery, createError } from 'h3'
import { getAnalyticsEventsCollection } from '@/server/utils/mongo'
import type { AnalyticsEventType } from '@/types/analytics'

const TRENDING_EVENT_TYPES: AnalyticsEventType[] = ['copy_repo', 'visit_repo', 'visit_author', 'view_details']

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const periodDays = Math.min(Math.max(Number(query.periodDays) || 7, 1), 90)
  const limit = Math.min(Math.max(Number(query.limit) || 8, 1), 24)

  const sinceDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000)
  const collection = await getAnalyticsEventsCollection()

  const pipeline = [
    {
      $match: {
        createdAt: { $gte: sinceDate },
        eventType: { $in: TRENDING_EVENT_TYPES },
        pluginId: { $exists: true, $ne: null }
      }
    },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: '$pluginId',
        pluginId: { $first: '$pluginId' },
        pluginName: { $first: '$pluginName' },
        pluginSnapshot: { $first: '$pluginSnapshot' },
        total: { $sum: 1 },
        copyCount: {
          $sum: {
            $cond: [{ $eq: ['$eventType', 'copy_repo'] }, 1, 0]
          }
        },
        visitCount: {
          $sum: {
            $cond: [{ $eq: ['$eventType', 'visit_repo'] }, 1, 0]
          }
        },
        authorVisitCount: {
          $sum: {
            $cond: [{ $eq: ['$eventType', 'visit_author'] }, 1, 0]
          }
        },
        detailViews: {
          $sum: {
            $cond: [{ $eq: ['$eventType', 'view_details'] }, 1, 0]
          }
        },
        latestEventAt: { $max: '$createdAt' }
      }
    },
    { $sort: { total: -1, latestEventAt: -1 } },
    { $limit: limit }
  ]

  const results = await collection.aggregate(pipeline).toArray()

  if (!results) {
    throw createError({ statusCode: 500, message: 'Failed to compute trending plugins' })
  }

  return {
    periodDays,
    total: results.length,
    items: results.map((item) => ({
      pluginId: item.pluginId,
      pluginName: item.pluginName ?? item.pluginSnapshot?.display_name ?? item.pluginSnapshot?.name ?? item.pluginId,
      pluginSnapshot: item.pluginSnapshot,
      stats: {
        total: item.total,
        copyCount: item.copyCount,
        visitCount: item.visitCount,
        authorVisitCount: item.authorVisitCount,
        detailViews: item.detailViews,
        latestEventAt: item.latestEventAt
      }
    }))
  }
})
