import { MongoClient, type Db, type Collection } from 'mongodb'
import { useRuntimeConfig } from '#imports'
import type { PluginSnapshot, AnalyticsEventPayload } from '@/types/analytics'

let client: MongoClient | null = null
let connecting: Promise<MongoClient> | null = null

type RuntimeAnalyticsConfig = {
  mongoUri?: string
  dbName?: string
}

export type AnalyticsEventDocument = AnalyticsEventPayload & {
  _id?: string
  clientId?: string | null
  pluginTags?: string[]
  pluginSnapshot?: PluginSnapshot | null
  createdAt: Date
  timestamp?: number
}

const getRuntimeAnalyticsConfig = (): RuntimeAnalyticsConfig => {
  const config = useRuntimeConfig()
  return config.analytics || {}
}

const getMongoUri = () => {
  const { mongoUri } = getRuntimeAnalyticsConfig()
  if (!mongoUri) {
    throw new Error('Missing MONGODB_URI for analytics storage')
  }
  return mongoUri
}

const getDbName = () => {
  const { dbName } = getRuntimeAnalyticsConfig()
  return dbName || 'astrbot_plugins'
}

export const getMongoClient = async (): Promise<MongoClient> => {
  if (client) {
    return client
  }

  if (!connecting) {
    connecting = MongoClient.connect(getMongoUri(), {
      serverSelectionTimeoutMS: 5000
    }).then((connected) => {
      client = connected
      return connected
    }).finally(() => {
      connecting = null
    })
  }

  return connecting
}

export const getMongoDb = async (): Promise<Db> => {
  const mongoClient = await getMongoClient()
  return mongoClient.db(getDbName())
}

export const getAnalyticsEventsCollection = async (): Promise<Collection<AnalyticsEventDocument>> => {
  const db = await getMongoDb()
  return db.collection<AnalyticsEventDocument>('analytics_events')
}
