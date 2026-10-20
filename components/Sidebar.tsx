import Link from "next/link";
import { clearSessionCookie } from "@/lib/auth";
import { redirect } from "next/navigation";

export default function Sidebar() {
  async function logoutAction() {
    "use server"
    await clearSessionCookie()
    redirect("/")
  }

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 z-50 bg-[#eff4f7] dark:bg-[#1a202c] flex flex-col p-4 space-y-2">
      <div className="mb-8 px-2 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-lg bg-primary-gradient flex items-center justify-center shadow-lg">
          <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>account_balance</span>
        </div>
        <div>
          <h1 className="text-xl font-black text-[#455f88] dark:text-[#a3bffa] tracking-tight leading-none brand-font">Complihub</h1>
          <p className="text-[10px] font-bold uppercase tracking-widest text-secondary mt-1">Compliance Portal</p>
        </div>
      </div>
      <nav className="flex-grow space-y-1">
        <Link className="flex items-center px-4 py-3 bg-[#e7eff3] dark:bg-[#2d3748] text-[#455f88] dark:text-[#a3bffa] font-bold rounded-lg transition-transform duration-200 hover:translate-x-1 group" href="/dashboard">
          <span className="material-symbols-outlined mr-3" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
          <span className="font-['Manrope'] font-medium text-sm">Dashboard</span>
        </Link>
        <Link className="flex items-center px-4 py-3 text-[#546073] dark:text-[#cbd5e0] hover:bg-[#e7eff3]/50 dark:hover:bg-[#2d3748]/50 transition-transform duration-200 hover:translate-x-1 group" href="/compliance-calendar">
          <span className="material-symbols-outlined mr-3">calendar_month</span>
          <span className="font-['Manrope'] font-medium text-sm">Calendar</span>
        </Link>
        <Link className="flex items-center px-4 py-3 text-[#546073] dark:text-[#cbd5e0] hover:bg-[#e7eff3]/50 dark:hover:bg-[#2d3748]/50 transition-transform duration-200 hover:translate-x-1 group" href="/tasks">
          <span className="material-symbols-outlined mr-3">assignment</span>
          <span className="font-['Manrope'] font-medium text-sm">Tasks</span>
        </Link>
        <Link className="flex items-center px-4 py-3 text-[#546073] dark:text-[#cbd5e0] hover:bg-[#e7eff3]/50 dark:hover:bg-[#2d3748]/50 transition-transform duration-200 hover:translate-x-1 group" href="/entity-profile">
          <span className="material-symbols-outlined mr-3">domain</span>
          <span className="font-['Manrope'] font-medium text-sm">Entity Profile</span>
        </Link>
        <Link className="flex items-center px-4 py-3 text-[#546073] dark:text-[#cbd5e0] hover:bg-[#e7eff3]/50 dark:hover:bg-[#2d3748]/50 transition-transform duration-200 hover:translate-x-1 group" href="/reports">
          <span className="material-symbols-outlined mr-3">description</span>
          <span className="font-['Manrope'] font-medium text-sm">Reports</span>
        </Link>
        <Link className="flex items-center px-4 py-3 text-[#546073] dark:text-[#cbd5e0] hover:bg-[#e7eff3]/50 dark:hover:bg-[#2d3748]/50 transition-transform duration-200 hover:translate-x-1 group" href="/settings">
          <span className="material-symbols-outlined mr-3">settings</span>
          <span className="font-['Manrope'] font-medium text-sm">Settings</span>
        </Link>
      </nav>
      <div className="pt-4 border-t border-outline-variant/10 space-y-1">
        <Link href="/file-return" className="w-full mb-4 py-3 px-4 bg-primary-gradient text-white rounded-md font-['Manrope'] font-bold text-sm shadow-md active:opacity-80 transition-all flex items-center justify-center space-x-2">
          <span className="material-symbols-outlined text-sm">add_circle</span>
          <span>File New Return</span>
        </Link>
        <Link className="flex items-center px-4 py-2 text-[#546073] dark:text-[#cbd5e0] hover:bg-[#e7eff3]/50 transition-transform duration-200 hover:translate-x-1" href="/support">
          <span className="material-symbols-outlined mr-3">contact_support</span>
          <span className="font-['Manrope'] font-medium text-sm">Support</span>
        </Link>
        <form action={logoutAction} className="w-full">
          <button type="submit" className="w-full flex items-center px-4 py-2 text-[#546073] dark:text-[#cbd5e0] hover:bg-[#e7eff3]/50 transition-transform duration-200 hover:translate-x-1">
            <span className="material-symbols-outlined mr-3">logout</span>
            <span className="font-['Manrope'] font-medium text-sm">Logout</span>
          </button>
        </form>
      </div>
    </aside>
  );
}

