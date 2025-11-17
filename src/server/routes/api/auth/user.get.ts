import { defineEventHandler } from 'h3'
import { readAuthSession } from '../../../utils/auth'

export default defineEventHandler((event) => {
  const session = readAuthSession(event)
  if (!session) {
    return { authenticated: false, user: null }
  }
  return { authenticated: true, user: session }
})
