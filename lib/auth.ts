import { cookies } from "next/headers"

export type SessionData = {
  userId: string
  role: string
  companyId?: string | null
}

const SESSION_COOKIE = "session"

export async function createSessionCookie(session: SessionData) {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, JSON.stringify(session), {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
  })
}

export async function clearSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

export async function getSessionFromCookies(): Promise<SessionData | null> {
  const cookieStore = await cookies()
  const value = cookieStore.get(SESSION_COOKIE)?.value
  if (!value) return null
  try {
    return JSON.parse(value) as SessionData
  } catch {
    return null
  }
}

export function redirectPathForRole(role?: string | null) {
  if (role === "ADMIN") return "/admin/dashboard"
  return "/dashboard"
}

export { SESSION_COOKIE }
