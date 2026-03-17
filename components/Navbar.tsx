import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getSessionFromCookies, clearSessionCookie, redirectPathForRole } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function Navbar() {

  const session = await getSessionFromCookies()

  async function logoutAction() {
    "use server"
    await clearSessionCookie()
    redirect("/")
  }

  return (
    <div className="border-b bg-card/60 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">

        <Link href="/" className="flex items-center gap-2 font-semibold">
          <div className="size-8 rounded-full bg-primary/10 text-primary grid place-items-center text-sm">
            CP
          </div>
          <span>Compliance Portal</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <Link href="/#features" className="hover:text-primary transition-colors">
            Features
          </Link>
          <Link href="/#solutions" className="hover:text-primary transition-colors">
            Solutions
          </Link>
        </nav>

        {session ? (
          <div className="flex items-center gap-3">
            <Link
              href={redirectPathForRole(session.role)}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>
            <form action={logoutAction}>
              <Button variant="outline" size="lg" type="submit">
                Logout
              </Button>
            </form>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Login
            </Link>
            <Button size="lg" className="hidden sm:inline-flex" asChild>
              <Link href="#book-demo">
                Book a Demo
              </Link>
            </Button>
          </div>
        )}

      </div>
    </div>
  )
}
