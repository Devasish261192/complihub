import { getSessionFromCookies } from "@/lib/auth"
import prisma from "@/lib/prisma"

export default async function Header() {
  const session = await getSessionFromCookies()
  let name = "Aditya Sharma"
  let roleName = "Compliance Officer"
  let avatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuAaateFw70Sv8uRKfEECk2JPIFS_WbeyniIFPXP6MNaBp5MhJaQoz6rQIl3-mZ51KBdWz_DqFa_-bP5HBFB036OE2LJmH7t3-XgeTYjP0D0nP7zn7Dz0b7nFIXZyWxzaSPycO3wFZnwR9jWNV76ElQwNmi7ZSohKMmO0AZ9KEfRtN7KOZfosM161J9tM1VNMT1l5VCMb7BSDQXDWvFmXDasQDKR2iuLiFaylDOUtuK1bgj5pO1Z7Gv7m1iteGjv92Yzc5f8IxuQIg"

  if (session) {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { role: true }
    })
    if (user) {
      name = user.name
      if (user.role.name === "COMPANY_ADMIN") {
        roleName = "Company Admin"
      } else if (user.role.name === "ADMIN") {
        roleName = "Portal Admin"
      } else if (user.role.name === "COMPANY_OFFICER") {
        roleName = "Compliance Officer"
      } else if (user.role.name === "COMPANY_STAFF") {
        roleName = "Staff/Assignee"
      } else {
        roleName = user.role.name.replace("COMPANY_", "").replace("_", " ")
      }

      // Assign avatar based on name
      if (name.includes("Anjali")) {
        avatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuCvf1kxYK8Y7C86xxvfkejAeZqFWcBkUfYONiLcnqkA8uk869mdy-h40Ldhc1hcCqF2407QqJKPecCcESiRnSqbe_MSVn_k07mwdU0oONjDUEwTTY3GO3dFViuMbpzymnnqC0qkOaVlAnyunBfUO2nWBsVt_cV4GboM8GfJ90uVkTgMuqQOmhuUfutLnYOBzkIuWV9nhPAOdn-2yUBDM1JD8mhV5U3FQCXD7XRm91IQ4njBfcUoEbcKaB-ds1Ankc8paVYrpLYm0w"
      } else if (name.includes("Rahul")) {
        avatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuBWer1DC-seuRxQmpQ9qDTMvIbTfgKESlBKfk-c9_ekQCauLHh-ui7dyVEJsR8MkQd21MMOYJO5_AKYa1DBFUJUC_uE6di3bpH_yx0BrkQOTDLYz4va_yYkwwNH1YkpWpbQa1df-FkuniTZ6S5_5nx8ot59nzJDkZJjbU7REMd1M6Xe4GKj1pE2KmcSlMlLsbv0jYlx5eyR-8V7E5uR18pvM0oeCGZrF1Sfx0wsxzI-tjiFHW8BW7572jzk5ULqZ3cIAvhtDRM6Fg"
      } else if (name.toLowerCase().includes("admin")) {
        // Professional corporate profile avatar
        avatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuBoTdspfCAjkSn-eAjVLml95FatJT551IFEixS8yfp2zM9YbP-IkgX_pPp3mInnX_Zw8lXAaZPnskj_6IOnI1X8Mm9fuD2P-x9yRL8hXObkHJH9E-45CDCRsBHuKHARbrdnyvY8_t05e_jMokMVJfcHJJyKEJTVajVTYkdZgKLBGqeJ_8Tq6zPmWhihGeRRMMRzINwVNwWk7FsuhSMIoUq1zDo2ufIoCxWRy-PKuXs8EyAEUCWOb-jJlisl4zLyqCIG-GukpypYmA"
      }
    }
  }

  return (
    <header className="fixed top-0 right-0 left-64 z-40 bg-[#f7fafc]/80 backdrop-blur-md flex justify-between items-center px-8 py-3 border-b border-[#a7b4ba]/15">
      <div className="flex items-center flex-1 max-w-xl">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant">search</span>
          <input className="w-full bg-surface-container-low border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 placeholder:text-outline-variant font-['Inter']" placeholder="Search filings, entities, or tasks..." type="text"/>
        </div>
      </div>
      <div className="flex items-center space-x-6 ml-8">
        <div className="flex items-center space-x-4">
          <button className="relative p-1 text-[#546073] hover:bg-[#eff4f7] rounded-full transition-colors active:scale-95">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full border-2 border-surface"></span>
          </button>
          <button className="p-1 text-[#546073] hover:bg-[#eff4f7] rounded-full transition-colors active:scale-95">
            <span className="material-symbols-outlined">help</span>
          </button>
        </div>
        <div className="h-8 w-[1px] bg-outline-variant/20"></div>
        <div className="flex items-center space-x-3 cursor-pointer group">
          <div className="text-right">
            <p className="text-xs font-bold text-on-background leading-none">{name}</p>
            <p className="text-[10px] text-secondary font-medium mt-1">{roleName}</p>
          </div>
          <img alt="User Profile Avatar" className="w-10 h-10 rounded-full border-2 border-surface-container-high object-cover shadow-sm group-hover:border-primary/30 transition-all" src={avatar}/>
        </div>
      </div>
    </header>
  )
}
