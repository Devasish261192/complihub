import prisma from "@/lib/prisma"
import { getSessionFromCookies } from "@/lib/auth"
import { addTeamMember, removeTeamMember } from "./actions"

export default async function SettingsPage() {
  const session = await getSessionFromCookies()
  const companyId = session?.companyId

  const company = companyId
    ? await prisma.company.findUnique({ where: { id: companyId } })
    : await prisma.company.findFirst()

  if (!company) {
    return (
      <div className="p-8 text-center bg-white border rounded-xl shadow-sm">
        <h2 className="text-xl font-bold text-red-600">No Company Profile Found</h2>
        <p className="text-sm text-gray-500 mt-2">Please run the seed script to populate demo data.</p>
      </div>
    )
  }

  // Get all team members for this company
  const teamMembers = await prisma.user.findMany({
    where: { companyId: company.id },
    include: { role: true },
    orderBy: { name: "asc" }
  })

  // Helper to format role names cleanly
  const formatRole = (roleName: string) => {
    if (roleName === "COMPANY_ADMIN") return "Company Admin"
    if (roleName === "COMPANY_OFFICER") return "Compliance Officer"
    if (roleName === "COMPANY_STAFF") return "Staff/Assignee"
    return roleName.replace("COMPANY_", "").replace("_", " ")
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <span className="label-md text-primary font-bold tracking-widest uppercase text-[0.65rem] mb-2 block">
          Control Panel • {company.name}
        </span>
        <h2 className="text-4xl font-extrabold text-on-surface tracking-tight">System Settings</h2>
      </div>

      {/* Grid Layout: Team List on Left (Col 8), Add Member on Right (Col 4) */}
      <div className="grid grid-cols-12 gap-8 items-start">
        
        {/* Left: Team Members list */}
        <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-bold text-on-surface">Team Management</h3>
            <p className="text-xs text-secondary mt-1">Manage users, departments, and statutory roles for GRC workflow allocation.</p>
          </div>

          <div className="overflow-hidden border border-outline-variant/10 rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-surface-container-low text-on-surface-variant font-bold text-xs uppercase tracking-wider">
                <tr className="border-b border-outline-variant/10">
                  <th className="p-4 text-left">Member Name</th>
                  <th className="p-4 text-left">Email Address</th>
                  <th className="p-4 text-left">Department</th>
                  <th className="p-4 text-left">Role</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container">
                {teamMembers.map((member) => {
                  const isSelf = member.id === session?.userId
                  return (
                    <tr key={member.id} className="hover:bg-surface-container-low/20 transition-colors">
                      <td className="p-4 font-semibold text-on-surface flex items-center gap-3">
                        <div className="h-7 w-7 rounded-full bg-primary-container/30 text-primary flex items-center justify-center text-xs font-black">
                          {member.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                        </div>
                        <span>{member.name} {isSelf && <span className="text-[10px] text-primary-dim font-bold bg-primary-container px-1.5 py-0.5 rounded ml-1">(You)</span>}</span>
                      </td>
                      <td className="p-4 text-on-surface-variant font-medium">{member.email}</td>
                      <td className="p-4 text-on-surface-variant font-medium">{member.department || "General"}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          member.role.name === "COMPANY_ADMIN" 
                            ? "bg-purple-100 text-purple-700" 
                            : member.role.name === "COMPANY_OFFICER" 
                            ? "bg-blue-100 text-blue-700" 
                            : "bg-green-100 text-green-700"
                        }`}>
                          {formatRole(member.role.name)}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {isSelf || member.role.name === "COMPANY_ADMIN" ? (
                          <span className="text-xs text-outline italic">Protected</span>
                        ) : (
                          <form action={async () => {
                            "use server"
                            await removeTeamMember(member.id)
                          }}>
                            <button type="submit" className="text-xs font-bold text-red-600 hover:text-red-800 hover:underline active:scale-95 transition-all">
                              Remove
                            </button>
                          </form>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Add Team Member Form */}
        <div className="col-span-12 lg:col-span-4 bg-surface-container rounded-xl p-6 border border-outline-variant/15 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-bold text-on-surface">Add Team Member</h3>
            <p className="text-xs text-secondary mt-1">Create a new user account to allocate compliance tasks.</p>
          </div>

          <form action={addTeamMember} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-outline-variant uppercase tracking-wider" htmlFor="name">Full Name</label>
              <input 
                id="name"
                name="name"
                type="text" 
                required
                placeholder="e.g. Kirti N."
                className="w-full rounded-md border border-outline-variant/30 bg-surface-container-lowest px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-outline-variant uppercase tracking-wider" htmlFor="email">Email Address</label>
              <input 
                id="email"
                name="email"
                type="email" 
                required
                placeholder="e.g. kirti@abc.com"
                className="w-full rounded-md border border-outline-variant/30 bg-surface-container-lowest px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-outline-variant uppercase tracking-wider" htmlFor="department">Department</label>
              <select 
                id="department"
                name="department"
                className="w-full rounded-md border border-outline-variant/30 bg-surface-container-lowest px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="Finance">Finance</option>
                <option value="HR & Admin">HR & Admin</option>
                <option value="Legal & Secretarial">Legal & Secretarial</option>
                <option value="Operations">Operations</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-outline-variant uppercase tracking-wider" htmlFor="role">Statutory GRC Role</label>
              <select 
                id="role"
                name="role"
                className="w-full rounded-md border border-outline-variant/30 bg-surface-container-lowest px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="COMPANY_OFFICER">Compliance Officer (Reviewer/Checker)</option>
                <option value="COMPANY_STAFF">Staff Member (Maker/Assignee)</option>
              </select>
            </div>

            <p className="text-[10px] text-secondary italic">
              Note: Newly created team members are assigned a default password of <strong>test123</strong>.
            </p>

            <button type="submit" className="w-full py-2.5 bg-primary text-on-primary rounded-md text-sm font-bold shadow-md hover:bg-primary-dim active:scale-95 transition-all">
              Save Member
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}
