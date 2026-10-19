import prisma from "@/lib/prisma"
import { getSessionFromCookies } from "@/lib/auth"
import Link from "next/link"

export default async function DashboardPage() {
  const session = await getSessionFromCookies()
  const companyId = session?.companyId

  // Get active company
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

  // Fetch all tasks for the company
  const tasks = await prisma.task.findMany({
    where: {
      assignedCompliance: {
        companyId: company.id,
      },
    },
    include: {
      assignedCompliance: {
        include: {
          compliance: {
            include: {
              category: true,
            },
          },
        },
      },
    },
    orderBy: { dueDate: "asc" },
  })

  const now = new Date()

  // 1. Calculate General Metrics
  const pastTasks = tasks.filter((t) => t.dueDate && t.dueDate <= now)
  const completedPastTasks = pastTasks.filter((t) => t.status === "completed")
  
  // Compliance score = completed past tasks / total past tasks
  const complianceScore = pastTasks.length > 0
    ? Math.round((completedPastTasks.length / pastTasks.length) * 100)
    : 100

  const totalTasksCount = tasks.length
  const pendingCount = tasks.filter((t) => t.status === "pending").length
  const overdueTasksCount = tasks.filter((t) => t.status === "pending" && t.dueDate && t.dueDate <= now).length
  const complianceCount = await prisma.compliance.count()

  // 2. Filing Status Percentages (All cycles)
  const finishedCount = tasks.filter((t) => t.status === "completed").length
  const futurePendingCount = tasks.filter((t) => t.status === "pending" && t.dueDate && t.dueDate > now).length
  const missedCount = tasks.filter((t) => t.status === "pending" && t.dueDate && t.dueDate <= now).length

  const finishedPct = totalTasksCount > 0 ? Math.round((finishedCount / totalTasksCount) * 100) : 0
  const pendingPct = totalTasksCount > 0 ? Math.round((futurePendingCount / totalTasksCount) * 100) : 0
  const missedPct = totalTasksCount > 0 ? Math.max(0, 100 - finishedPct - pendingPct) : 0

  // 3. Upcoming MCA Deadlines (Corporate Yearly filings)
  const upcomingMCA = tasks
    .filter((t) => t.status === "pending" && t.assignedCompliance.compliance.frequency === "yearly" && t.dueDate && t.dueDate > now)
    .slice(0, 2)

  // 4. Critical Regulatory Calendar (4 rows: overdue first, then nearest future)
  const criticalTasks = [...tasks]
    .sort((a, b) => {
      // Pending overdue first
      const aOverdue = a.status === "pending" && a.dueDate && a.dueDate <= now
      const bOverdue = b.status === "pending" && b.dueDate && b.dueDate <= now
      if (aOverdue && !bOverdue) return -1
      if (!aOverdue && bOverdue) return 1

      // Pending future next
      const aFuture = a.status === "pending" && a.dueDate && a.dueDate > now
      const bFuture = b.status === "pending" && b.dueDate && b.dueDate > now
      if (aFuture && !bFuture) return -1
      if (!aFuture && bFuture) return 1

      // Sort pending chronological
      if (a.status === "pending" && b.status === "pending") {
        return a.dueDate!.getTime() - b.dueDate!.getTime()
      }

      // Completed tasks last, sort by completion date decending (newest first)
      if (a.status === "completed" && b.status === "completed") {
        const aTime = a.completedAt ? a.completedAt.getTime() : 0
        const bTime = b.completedAt ? b.completedAt.getTime() : 0
        return bTime - aTime
      }

      return a.status === "pending" ? -1 : 1
    })
    .slice(0, 4)

  return (
    <div className="space-y-8">
      {/* Header & Action Row */}
      <div className="flex justify-between items-end">
        <div>
          <span className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1 block">Institutional GRC Oversight</span>
          <h2 className="text-3xl font-extrabold text-on-background tracking-tight">Compliance Dashboard</h2>
        </div>
        <div className="flex space-x-3">
          <Link href="/entity-profile" className="px-5 py-2.5 bg-surface-container-lowest border border-outline-variant/15 text-primary font-['Manrope'] font-bold text-sm rounded-md shadow-sm hover:bg-surface-container-low transition-colors active:scale-95 flex items-center space-x-2">
            <span className="material-symbols-outlined text-sm">history_edu</span>
            <span>View Statutory Registers</span>
          </Link>
          <Link href="/file-return" className="px-5 py-2.5 bg-primary-gradient text-white font-['Manrope'] font-bold text-sm rounded-md shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center space-x-2">
            <span className="material-symbols-outlined text-sm">upload_file</span>
            <span>File New Return</span>
          </Link>
        </div>
      </div>

      {/* Bento Grid Metrics */}
      <div className="grid grid-cols-12 gap-6">
        {/* Large Status Card: Compliance Score */}
        <div className="col-span-12 lg:col-span-4 bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <h3 className="text-sm font-bold text-secondary uppercase tracking-wider">Compliance Score</h3>
            <span className="material-symbols-outlined text-primary-dim">verified_user</span>
          </div>
          <div className="mt-4 flex items-baseline space-x-4">
            <span className="text-6xl font-black text-primary tracking-tighter">{complianceScore}<span className="text-2xl font-bold">%</span></span>
            <div className="flex flex-col">
              <span className={`text-xs font-bold flex items-center ${complianceScore >= 90 ? "text-green-600" : complianceScore >= 75 ? "text-yellow-600" : "text-red-600"}`}>
                <span className="material-symbols-outlined text-xs mr-0.5">trending_up</span>
                {complianceScore >= 90 ? "Excellent" : complianceScore >= 75 ? "Satisfactory" : "At Risk"}
              </span>
              <span className="text-[10px] text-secondary">computed from history</span>
            </div>
          </div>
          <div className="mt-6 w-full bg-surface-container-low h-2 rounded-full overflow-hidden">
            <div className="h-full bg-primary-gradient rounded-full" style={{ width: `${complianceScore}%` }}></div>
          </div>
          <p className="mt-4 text-xs text-on-surface-variant leading-relaxed">
            Your entity <strong>{company.name}</strong> is currently at <strong>{complianceScore >= 90 ? "Low Risk" : complianceScore >= 75 ? "Moderate Risk" : "High Risk"}</strong> standing. Tracking {totalTasksCount} regulatory tasks.
          </p>
        </div>

        {/* Secondary Cards: Upcoming MCA Deadlines */}
        <div className="col-span-12 md:col-span-6 lg:col-span-4 bg-surface-container rounded-xl p-6 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-bold text-secondary uppercase tracking-wider">Upcoming MCA Deadlines</h3>
            <span className="p-1.5 bg-tertiary-container/30 rounded-lg">
              <span className="material-symbols-outlined text-tertiary text-sm">event_repeat</span>
            </span>
          </div>
          <div className="space-y-4 flex-1">
            {upcomingMCA.map((task) => {
              const daysLeft = task.dueDate ? Math.ceil((task.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0
              const isUrgent = daysLeft <= 15
              return (
                <div key={task.id} className={`p-3 bg-surface-container-lowest rounded-lg border-l-4 ${isUrgent ? "border-yellow-500" : "border-blue-500"} shadow-sm`}>
                  <div className="flex justify-between items-start">
                    <div className="max-w-[70%]">
                      <p className="text-xs font-bold text-on-surface truncate">{task.assignedCompliance.compliance.title}</p>
                      <p className="text-[10px] text-secondary truncate">{task.assignedCompliance.compliance.description}</p>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${isUrgent ? "text-yellow-700 bg-yellow-100" : "text-blue-700 bg-blue-100"}`}>
                      {daysLeft} DAYS LEFT
                    </span>
                  </div>
                </div>
              )
            })}
            {upcomingMCA.length === 0 && (
              <div className="flex items-center justify-center h-full text-center py-6 text-xs text-on-surface-variant italic">
                No upcoming yearly MCA filings.
              </div>
            )}
          </div>
        </div>

        {/* Small Grid Metrics */}
        <div className="col-span-12 md:col-span-6 lg:col-span-4 grid grid-rows-2 gap-6">
          <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-outline-variant/5 flex justify-between items-center">
            <div>
              <h3 className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Overdue / Pending</h3>
              <p className="text-3xl font-black text-on-surface">
                {overdueTasksCount} <span className="text-sm font-medium text-red-600">/ {pendingCount}</span>
              </p>
              <p className="text-[10px] text-secondary font-medium">Overdue requires immediate action</p>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${overdueTasksCount > 0 ? "bg-red-50 text-red-600" : "bg-surface-container-low text-primary"}`}>
              <span className="material-symbols-outlined">{overdueTasksCount > 0 ? "warning" : "assignment_late"}</span>
            </div>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-outline-variant/5 flex justify-between items-center">
            <div>
              <h3 className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-1">Corporate Profile</h3>
              <p className="text-lg font-black text-on-surface truncate max-w-[180px]">{company.name}</p>
              <p className="text-[10px] text-secondary font-medium">{complianceCount} active laws monitored</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-green-600" style={{ fontVariationSettings: "'FILL' 1" }}>shield</span>
            </div>
          </div>
        </div>
      </div>

      {/* Updated Section: Donut Charts and Calendar */}
      <div className="grid grid-cols-12 gap-8 items-start">
        {/* Compliance Status Donut Charts */}
        <div className="col-span-12 lg:col-span-7 space-y-6">
          <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm border border-outline-variant/5">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-lg font-bold text-on-surface tracking-tight">Filing Status Overview</h3>
                <p className="text-xs text-secondary">Real-time status of compliance tasks for the current cycle</p>
              </div>
              <div className="text-xs font-bold bg-surface-container-low rounded-md px-3 py-1.5">
                All History
              </div>
            </div>
            
            {/* Three Donut Charts Row */}
            <div className="grid grid-cols-3 gap-4 py-4">
              {/* Finished (Green) */}
              <div className="flex flex-col items-center">
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" fill="none" r="16" stroke="#e7eff3" strokeWidth="3"></circle>
                    <circle cx="18" cy="18" fill="none" r="16" stroke="#10b981" strokeDasharray={`${finishedPct}, 100`} strokeLinecap="round" strokeWidth="3"></circle>
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-xl font-black text-on-surface">{finishedPct}%</span>
                  </div>
                </div>
                <span className="mt-3 text-[10px] font-bold text-green-600 uppercase tracking-widest">Finished</span>
              </div>
              {/* Pending (Yellow) */}
              <div className="flex flex-col items-center border-l border-outline-variant/10">
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" fill="none" r="16" stroke="#e7eff3" strokeWidth="3"></circle>
                    <circle cx="18" cy="18" fill="none" r="16" stroke="#f59e0b" strokeDasharray={`${pendingPct}, 100`} strokeLinecap="round" strokeWidth="3"></circle>
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-xl font-black text-on-surface">{pendingPct}%</span>
                  </div>
                </div>
                <span className="mt-3 text-[10px] font-bold text-yellow-600 uppercase tracking-widest">Pending</span>
              </div>
              {/* Missed (Red) */}
              <div className="flex flex-col items-center border-l border-outline-variant/10">
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" fill="none" r="16" stroke="#e7eff3" strokeWidth="3"></circle>
                    <circle cx="18" cy="18" fill="none" r="16" stroke="#ef4444" strokeDasharray={`${missedPct}, 100`} strokeLinecap="round" strokeWidth="3"></circle>
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-xl font-black text-on-surface">{missedPct}%</span>
                  </div>
                </div>
                <span className="mt-3 text-[10px] font-bold text-red-600 uppercase tracking-widest">Missed</span>
              </div>
            </div>
            <div className="mt-6 flex space-x-6 items-center border-t border-outline-variant/10 pt-4">
              <p className="text-[10px] text-secondary font-medium italic">Data reflects {totalTasksCount} total regulatory obligations generated since June 2024.</p>
            </div>
          </div>
        </div>

        {/* Critical Regulatory Dates Table */}
        <div className="col-span-12 lg:col-span-5 space-y-6">
          <div className="bg-surface-container-low rounded-xl p-6 shadow-sm">
            <div className="flex items-center space-x-2 mb-6">
              <span className="material-symbols-outlined text-primary text-xl">gavel</span>
              <h3 className="text-lg font-bold text-on-surface tracking-tight">Critical Regulatory Calendar</h3>
            </div>
            <div className="space-y-1">
              {/* Table Header */}
              <div className="grid grid-cols-12 px-4 py-2">
                <div className="col-span-8 text-[10px] font-bold text-secondary uppercase tracking-widest">Compliance Item</div>
                <div className="col-span-4 text-[10px] font-bold text-secondary uppercase tracking-widest text-right">Deadline</div>
              </div>
              
              {/* Table Rows with Color Coding */}
              {criticalTasks.map((task) => {
                const isCompleted = task.status === "completed"
                const isOverdue = task.status === "pending" && task.dueDate && task.dueDate <= now
                const daysLeft = task.dueDate ? Math.ceil((task.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0
                const formattedDate = task.dueDate ? task.dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "N/A"

                let borderClass = "border-blue-500"
                let statusText = `${daysLeft} DAYS`
                let statusColor = "text-blue-600"

                if (isCompleted) {
                  borderClass = "border-green-500"
                  statusText = "PAID"
                  statusColor = "text-green-600 uppercase"
                } else if (isOverdue) {
                  borderClass = "border-red-500"
                  statusText = "OVERDUE"
                  statusColor = "text-red-600 font-black"
                } else if (daysLeft <= 10) {
                  borderClass = "border-orange-500"
                  statusColor = "text-orange-600 font-black"
                }

                return (
                  <div key={task.id} className={`grid grid-cols-12 px-4 py-4 bg-surface-container-lowest rounded-lg items-center border-r-4 ${borderClass} hover:bg-white transition-colors cursor-pointer group mb-2`}>
                    <div className="col-span-8">
                      <p className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors">{task.assignedCompliance.compliance.title}</p>
                      <p className="text-[10px] text-secondary truncate">{task.assignedCompliance.compliance.description}</p>
                    </div>
                    <div className="col-span-4 text-right">
                      <p className="text-xs font-black text-on-surface">{formattedDate}</p>
                      <p className={`text-[9px] ${statusColor} font-bold`}>{statusText}</p>
                    </div>
                  </div>
                )
              })}
              {criticalTasks.length === 0 && (
                <div className="text-center py-6 text-xs text-on-surface-variant italic">
                  No tasks tracked yet.
                </div>
              )}
            </div>
            <Link href="/compliance-calendar" className="w-full mt-6 block text-center py-2.5 text-xs font-bold text-primary hover:bg-primary/5 rounded-md transition-colors border border-primary/10">
              View Compliance Calendar
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
