import { defineEventHandler } from 'h3'
import { clearAuthSession } from '../../../utils/auth'

export default defineEventHandler((event) => {
  clearAuthSession(event)
  return { ok: true }
})
