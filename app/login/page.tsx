import prisma from "@/lib/prisma"
import { createSessionCookie, redirectPathForRole } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"

type SearchParams = {
  error?: string
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const errorMessage = params?.error

  async function loginAction(formData: FormData) {
    "use server"

    const email = String(formData.get("email") || "").toLowerCase().trim()
    const password = String(formData.get("password") || "").trim()

    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    })

    if (!user || user.password !== password || user.role.name !== "COMPANY_ADMIN") {
      redirect("/login?error=Invalid%20credentials")
    }

    await createSessionCookie({
      userId: user.id,
      role: user.role.name,
      companyId: user.companyId,
    })

    redirect(redirectPathForRole(user.role.name))
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <div className="border rounded-xl bg-card p-8 shadow-sm">
        <h1 className="text-2xl font-bold">Company Login</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to manage your company compliance.
        </p>

        <form action={loginAction} className="mt-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          {errorMessage && (
            <p className="text-sm text-destructive">
              {decodeURIComponent(errorMessage)}
            </p>
          )}

          <Button type="submit" className="w-full" size="lg">
            Login
          </Button>
        </form>
      </div>
    </div>
  )
}
