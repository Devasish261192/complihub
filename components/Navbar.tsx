import Link from "next/link"
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
    <div className="fixed top-0 w-full z-50 bg-[#f7fafc]/80 backdrop-blur-md border-b border-[#a7b4ba]/15 transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-4">
        
        <Link href="/" className="flex items-center gap-3 font-['Manrope']">
          <div className="w-10 h-10 rounded-xl bg-primary-gradient shadow-md grid place-items-center text-white">
            <span className="material-symbols-outlined text-[20px]">account_balance</span>
          </div>
          <div>
            <span className="block text-lg font-extrabold text-on-surface tracking-tight leading-tight">Complihub</span>
            <span className="block text-[10px] text-primary font-bold uppercase tracking-widest">Compliance Portal</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/#features" className="text-sm font-bold text-secondary hover:text-primary transition-colors">
            Platform Features
          </Link>
          <Link href="/#solutions" className="text-sm font-bold text-secondary hover:text-primary transition-colors">
            Our Solutions
          </Link>
        </nav>

        {session ? (
          <div className="flex items-center gap-4">
            <Link
              href={redirectPathForRole(session.role)}
              className="text-sm font-bold text-secondary hover:text-primary transition-colors"
            >
              Go to Dashboard
            </Link>
            <form action={logoutAction}>
              <button 
                type="submit"
                className="px-5 py-2.5 bg-surface-container text-primary font-bold text-sm rounded-md border border-outline-variant/15 flex items-center space-x-2 transition-all hover:bg-surface-container-low active:scale-95"
              >
                <span className="material-symbols-outlined text-sm">logout</span>
                <span>Logout</span>
              </button>
            </form>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-bold text-secondary hover:text-primary transition-colors"
            >
              Corporate Login
            </Link>
            <Link 
              href="#book-demo"
              className="hidden sm:flex px-6 py-2.5 bg-primary-gradient text-white font-bold text-sm rounded-md shadow-md hover:shadow-lg transition-all active:scale-95 items-center space-x-2"
            >
              <span className="material-symbols-outlined text-sm">calendar_month</span>
              <span>Schedule Demo</span>
            </Link>
          </div>
        )}

      </div>
    </div>
  )
}

