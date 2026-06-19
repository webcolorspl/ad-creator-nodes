import { NextRequest, NextResponse } from 'next/server'
import { createHash, createHmac } from 'crypto'

const PASSWORD_HASH   = process.env.GEN_PASSWORD_HASH   ?? ''
const SESSION_SECRET  = process.env.GEN_SESSION_SECRET  ?? ''
const COOKIE_NAME     = 'gen_session'
const SESSION_TTL_MS  = 24 * 60 * 60 * 1000 // 24h

function makeToken(expiresAt: number): string {
  const payload = `${expiresAt}`
  const sig = createHmac('sha256', SESSION_SECRET).update(payload).digest('hex')
  return `${payload}.${sig}`
}

export function verifyToken(token: string): boolean {
  const [payload, sig] = token.split('.')
  if (!payload || !sig) return false
  const expected = createHmac('sha256', SESSION_SECRET).update(payload).digest('hex')
  if (expected !== sig) return false
  const expiresAt = parseInt(payload, 10)
  return Date.now() < expiresAt
}

export async function POST(req: NextRequest) {
  let body: { password?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Bad request' }, { status: 400 }) }

  const hash = createHash('sha256').update(body.password ?? '').digest('hex')
  if (hash !== PASSWORD_HASH) {
    return NextResponse.json({ error: 'Nieprawidłowe hasło' }, { status: 401 })
  }

  const expiresAt = Date.now() + SESSION_TTL_MS
  const token = makeToken(expiresAt)

  const res = NextResponse.json({ ok: true })
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: SESSION_TTL_MS / 1000,
    path: '/',
  })
  return res
}

export async function GET(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value ?? ''
  return NextResponse.json({ authenticated: verifyToken(token) })
}
