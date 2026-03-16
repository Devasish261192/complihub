import { NextRequest, NextResponse } from "next/server"

const SESSION_COOKIE = "session"

function parseSession(req: NextRequest) {
  const value = req.cookies.get(SESSION_COOKIE)?.value
  if (!value) return null
  try {
    return JSON.parse(value) as { role?: string | null }
  } catch {
    return null
  }
}

function redirect(url: string, req: NextRequest) {
  return NextResponse.redirect(new URL(url, req.url))
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const session = parseSession(req)

  const isAdminPath = pathname.startsWith("/admin")
  const isAdminDashboard = pathname.startsWith("/admin/dashboard")
  const isCompanyProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/frameworks") ||
    pathname.startsWith("/tasks")

  // allow static assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/storage")
  ) {
    return NextResponse.next()
  }

  // public landing and login routes remain open for anonymous users
  if (!session) {
    if (isAdminDashboard) return redirect("/admin", req)
    if (isCompanyProtected) return redirect("/login", req)
    return NextResponse.next()
  }

  const role = session.role
  const isAdmin = role === "ADMIN"
  const isCompanyAdmin = role === "COMPANY_ADMIN"

  // prevent logged-in users from seeing login screens
  if (pathname === "/login" || pathname === "/admin") {
    return redirect(isAdmin ? "/admin/dashboard" : "/dashboard", req)
  }

  // admin-only area
  if (isAdminPath) {
    if (!isAdmin) {
      return redirect("/dashboard", req)
    }
    return NextResponse.next()
  }

  // company protected area
  if (isCompanyProtected) {
    if (isAdmin) {
      return redirect("/admin/dashboard", req)
    }
    if (!isCompanyAdmin) {
      return redirect("/login", req)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
