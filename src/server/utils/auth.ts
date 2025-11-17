import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import {
  deleteCookie,
  getCookie,
  getRequestHeader,
  H3Event,
  setCookie
} from 'h3'
import { useRuntimeConfig } from '#imports'

const AUTH_COOKIE = 'astrbot_auth'
const STATE_COOKIE = 'astrbot_oauth_state'
const RETURN_COOKIE = 'astrbot_oauth_return'
const DEFAULT_SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days
const DEFAULT_STATE_MAX_AGE = 60 * 10 // 10 minutes

export type AuthSession = {
  login: string
  name?: string | null
  avatarUrl?: string | null
  exp: number
}

export type AuthConfig = {
  githubClientId: string
  githubClientSecret: string
  githubCallbackUrl: string
  allowedUsers: string[]
  cookieSecret: string
  sessionMaxAge: number
}

export function getAuthConfig(): AuthConfig {
  const runtimeAuth = useRuntimeConfig().auth ?? {}
  const githubClientId = String(runtimeAuth.githubClientId ?? '')
  const githubClientSecret = String(runtimeAuth.githubClientSecret ?? '')
  const githubCallbackUrl = String(runtimeAuth.githubCallbackUrl ?? '')
  const allowedUsers = String(runtimeAuth.allowedUsers ?? '')
  const cookieSecret = String(runtimeAuth.cookieSecret ?? '')
  const sessionMaxAge = runtimeAuth.sessionMaxAge ?? DEFAULT_SESSION_MAX_AGE

  if (!githubClientId || !githubClientSecret) {
    throw new Error('Missing GitHub OAuth credentials. Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET.')
  }

  if (!githubCallbackUrl) {
    throw new Error('Missing GITHUB_CALLBACK_URL required by GitHub OAuth callback.')
  }

  if (!cookieSecret) {
    throw new Error('Missing AUTH_COOKIE_SECRET for signing session cookies.')
  }

  const parsedSessionAge = typeof sessionMaxAge === 'number' ? sessionMaxAge : Number(sessionMaxAge)

  const whitelist = (allowedUsers as string)
    .split(',')
    .map((user) => user.trim().toLowerCase())
    .filter(Boolean)

  if (whitelist.length === 0) {
    throw new Error('GITHUB_ALLOWED_USERS must include at least one GitHub username.')
  }

  return {
    githubClientId,
    githubClientSecret,
    githubCallbackUrl,
    allowedUsers: whitelist,
    cookieSecret,
    sessionMaxAge: Number.isFinite(parsedSessionAge) ? parsedSessionAge : DEFAULT_SESSION_MAX_AGE
  }
}

export function toBase64Url(input: Buffer | string) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
}

export function signSession(session: Omit<AuthSession, 'exp'>, secret: string, maxAge: number): string {
  const payload: AuthSession = { ...session, exp: Math.floor(Date.now() / 1000) + maxAge }
  const encodedPayload = toBase64Url(JSON.stringify(payload))
  const signature = createHmac('sha256', secret).update(encodedPayload).digest()
  return `${encodedPayload}.${toBase64Url(signature)}`
}

export function verifySession(token: string | undefined, secret: string): AuthSession | null {
  if (!token) {
    return null
  }
  const [payloadPart, signaturePart] = token.split('.')
  if (!payloadPart || !signaturePart) {
    return null
  }

  const expectedSignature = createHmac('sha256', secret).update(payloadPart).digest()
  const providedSignature = Buffer.from(signaturePart.replace(/-/g, '+').replace(/_/g, '/'), 'base64')

  if (expectedSignature.length !== providedSignature.length) {
    return null
  }

  if (!timingSafeEqual(expectedSignature, providedSignature)) {
    return null
  }

  try {
    const decoded = Buffer.from(payloadPart.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8')
    const session: AuthSession = JSON.parse(decoded)
    if (session.exp < Math.floor(Date.now() / 1000)) {
      return null
    }
    return session
  } catch (error) {
    console.error('Failed to parse auth session payload', error)
    return null
  }
}

export function readAuthSession(event: H3Event): AuthSession | null {
  const { cookieSecret } = getAuthConfig()
  const token = getCookie(event, AUTH_COOKIE)
  return verifySession(token ?? undefined, cookieSecret)
}

export function persistAuthSession(event: H3Event, session: Omit<AuthSession, 'exp'>) {
  const { cookieSecret, sessionMaxAge } = getAuthConfig()
  const token = signSession(session, cookieSecret, sessionMaxAge)
  setCookie(event, AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isSecureRequest(event),
    path: '/',
    maxAge: sessionMaxAge
  })
}

export function clearAuthSession(event: H3Event) {
  deleteCookie(event, AUTH_COOKIE, { path: '/' })
}

export function generateStateToken(): string {
  return toBase64Url(randomBytes(32))
}

export function persistStateCookies(event: H3Event, state: string, returnTo: string) {
  const safeReturnTo = returnTo.startsWith('/') ? returnTo : '/'
  setCookie(event, STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isSecureRequest(event),
    path: '/',
    maxAge: DEFAULT_STATE_MAX_AGE
  })

  setCookie(event, RETURN_COOKIE, safeReturnTo, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isSecureRequest(event),
    path: '/',
    maxAge: DEFAULT_STATE_MAX_AGE
  })
}

export function consumeStateCookies(event: H3Event): { state: string | null; returnTo: string } {
  const state = getCookie(event, STATE_COOKIE)
  const returnTo = getCookie(event, RETURN_COOKIE)
  deleteCookie(event, STATE_COOKIE, { path: '/' })
  deleteCookie(event, RETURN_COOKIE, { path: '/' })
  return {
    state: state ?? null,
    returnTo: returnTo && returnTo.startsWith('/') ? returnTo : '/'
  }
}

function isSecureRequest(event: H3Event): boolean {
  const forwardedProto = getRequestHeader(event, 'x-forwarded-proto')
  if (forwardedProto) {
    return forwardedProto.includes('https')
  }
  // @ts-expect-error node req typings
  return Boolean(event.node.req.socket?.encrypted)
}
