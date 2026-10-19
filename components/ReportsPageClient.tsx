"use client"

import { useState } from "react"

type ComplianceCategory = {
  id: string
  name: string
}

type Compliance = {
  id: string
  title: string
  description: string | null
  frequency: string
  applicableLaw: string
  category: ComplianceCategory
}

type AssignedCompliance = {
  id: string
  compliance: Compliance
}

type Task = {
  id: string
  assignedComplianceId: string
  dueDate: string | null
  completedAt: string | null
  status: string
  remarks: string | null
  assigneeName: string | null
  assigneeRole: string | null
  department: string | null
  assignedCompliance: AssignedCompliance
}

interface Props {
  initialTasks: Task[]
  companyName: string
  teamMembers: any[]
}

export default function ReportsPageClient({ initialTasks, companyName, teamMembers }: Props) {
  // Filters State
  const [yearFilter, setYearFilter] = useState<string>("all")
  const [deptFilter, setDeptFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [hoveredMonth, setHoveredMonth] = useState<string | null>(null)

  const now = new Date()

  // Apply filters to tasks
  const filteredTasks = initialTasks.filter(task => {
    // 1. Year Filter
    if (yearFilter !== "all" && task.dueDate) {
      const year = new Date(task.dueDate).getFullYear().toString()
      if (year !== yearFilter) return false
    }

    // 2. Department Filter
    if (deptFilter !== "all") {
      if (task.department !== deptFilter) return false
    }

    // 3. Type Filter
    if (typeFilter !== "all") {
      const law = task.assignedCompliance.compliance.applicableLaw.toLowerCase()
      if (typeFilter === "GST" && !law.includes("gst")) return false
      if (typeFilter === "MCA" && !law.includes("companies act")) return false
      if (typeFilter === "Tax" && (!law.includes("income tax") && !law.includes("tds"))) return false
      if (typeFilter === "Labour" && (!law.includes("epf") && !law.includes("esi"))) return false
    }

    return true
  })

  // Calculate past tasks (due date <= now)
  const pastTasks = filteredTasks.filter(t => t.dueDate && new Date(t.dueDate) <= now)
  const totalPastCount = pastTasks.length

  // Categorize tasks for metrics
  let onTimeCount = 0
  let lateCount = 0
  let missedCount = 0
  let totalDelayDays = 0

  pastTasks.forEach(task => {
    if (task.status === "completed") {
      if (task.completedAt && task.dueDate && new Date(task.completedAt) > new Date(task.dueDate)) {
        lateCount++
        const delayMs = new Date(task.completedAt).getTime() - new Date(task.dueDate).getTime()
        totalDelayDays += Math.max(0, Math.ceil(delayMs / (1000 * 60 * 60 * 24)))
      } else {
        onTimeCount++
      }
    } else {
      // Pending and due date in the past = Missed
      missedCount++
    }
  })

  const totalCompletedCount = onTimeCount + lateCount
  const accuracyRate = totalPastCount > 0 ? Math.round((onTimeCount / totalPastCount) * 100) : 100
  const completionRate = totalPastCount > 0 ? Math.round((totalCompletedCount / totalPastCount) * 100) : 100
  const averageDelay = lateCount > 0 ? Math.round(totalDelayDays / lateCount) : 0

  // Generate a dynamic list of months between the minimum task date and maximum task date
  const dates = initialTasks.map(t => t.dueDate ? new Date(t.dueDate) : null).filter(Boolean) as Date[]
  
  let monthsList: { key: string; label: string }[] = []
  if (dates.length > 0) {
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())))
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())))
    
    let current = new Date(Date.UTC(minDate.getFullYear(), minDate.getMonth(), 1))
    const end = new Date(Date.UTC(maxDate.getFullYear(), maxDate.getMonth(), 1))
    
    while (current <= end) {
      const y = current.getFullYear()
      const m = current.getMonth()
      const key = `${y}-${(m + 1).toString().padStart(2, "0")}`
      const label = current.toLocaleString("en-US", { month: "short", year: "2-digit" })
      monthsList.push({ key, label })
      current.setMonth(current.getMonth() + 1)
    }
  }

  // Group monthly data
  let maxMonthTotal = 0
  const monthlyData = monthsList.map(({ key, label }) => {
    const monthTasks = filteredTasks.filter(t => {
      if (!t.dueDate) return false
      const d = new Date(t.dueDate)
      const mKey = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`
      return mKey === key
    })

    let mOnTime = 0
    let mLate = 0
    let mMissed = 0
    let mFuture = 0

    monthTasks.forEach(t => {
      const isOverdue = t.status === "pending" && t.dueDate && new Date(t.dueDate) <= now
      if (t.status === "completed") {
        if (t.completedAt && t.dueDate && new Date(t.completedAt) > new Date(t.dueDate)) {
          mLate++
        } else {
          mOnTime++
        }
      } else if (isOverdue) {
        mMissed++
      } else {
        mFuture++
      }
    })

    const total = mOnTime + mLate + mMissed + mFuture
    if (total > maxMonthTotal) maxMonthTotal = total

    return {
      key,
      label,
      onTime: mOnTime,
      late: mLate,
      missed: mMissed,
      future: mFuture,
      total
    }
  })

  // Prevent divide-by-zero
  const chartMaxScale = maxMonthTotal > 0 ? maxMonthTotal : 10

  // Group by Department
  const departments = ["Finance", "HR & Admin", "Legal & Secretarial", "Operations"]
  const departmentStats = departments.map(dept => {
    const deptTasks = filteredTasks.filter(t => t.department === dept)
    const deptPast = deptTasks.filter(t => t.dueDate && new Date(t.dueDate) <= now)
    
    let dOnTime = 0
    let dLate = 0
    let dMissed = 0

    deptPast.forEach(t => {
      if (t.status === "completed") {
        if (t.completedAt && t.dueDate && new Date(t.completedAt) > new Date(t.dueDate)) {
          dLate++
        } else {
          dOnTime++
        }
      } else {
        dMissed++
      }
    })

    const dTotal = deptPast.length
    const dAccuracy = dTotal > 0 ? Math.round((dOnTime / dTotal) * 100) : 100

    return {
      name: dept,
      total: dTotal,
      onTime: dOnTime,
      late: dLate,
      missed: dMissed,
      accuracy: dAccuracy
    }
  })

  // Group by Category/Law
  const categoryKeys = [
    { label: "Companies Act (MCA)", match: "companies act", icon: "domain", color: "text-purple-600 bg-purple-100 border-purple-200" },
    { label: "GST Returns", match: "gst", icon: "receipt_long", color: "text-red-600 bg-red-100 border-red-200" },
    { label: "Income Tax & TDS", match: "income tax", altMatch: "tds", icon: "account_balance", color: "text-orange-600 bg-orange-100 border-orange-200" },
    { label: "Labour Laws (PF/ESI)", match: "epf", altMatch: "esi", icon: "groups", color: "text-green-600 bg-green-100 border-green-200" }
  ]

  const categoryStats = categoryKeys.map(cat => {
    const catTasks = filteredTasks.filter(t => {
      const law = t.assignedCompliance.compliance.applicableLaw.toLowerCase()
      const m1 = law.includes(cat.match)
      const m2 = cat.altMatch ? law.includes(cat.altMatch) : false
      return m1 || m2
    })

    const catPast = catTasks.filter(t => t.dueDate && new Date(t.dueDate) <= now)
    
    let cOnTime = 0
    let cLate = 0
    let cMissed = 0

    catPast.forEach(t => {
      if (t.status === "completed") {
        if (t.completedAt && t.dueDate && new Date(t.completedAt) > new Date(t.dueDate)) {
          cLate++
        } else {
          cOnTime++
        }
      } else {
        cMissed++
      }
    })

    const cTotal = catPast.length
    const cAccuracy = cTotal > 0 ? Math.round((cOnTime / cTotal) * 100) : 100

    return {
      ...cat,
      total: cTotal,
      onTime: cOnTime,
      late: cLate,
      missed: cMissed,
      accuracy: cAccuracy
    }
  })

  const handleResetFilters = () => {
    setYearFilter("all")
    setDeptFilter("all")
    setTypeFilter("all")
  }

  return (
    <div className="space-y-8">
      {/* Title & Interactive Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <span className="label-md text-primary font-bold tracking-widest uppercase text-[0.65rem] mb-2 block">
            GRC Performance Insights • {companyName}
          </span>
          <h2 className="text-4xl font-extrabold text-on-surface tracking-tight">Compliance Reports</h2>
        </div>

        {/* Filters Panel */}
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          {/* Year */}
          <select
            value={yearFilter}
            onChange={e => setYearFilter(e.target.value)}
            className="text-xs font-bold bg-surface-container-low border border-outline-variant/10 rounded-lg px-3 py-2 focus:ring-1 focus:ring-primary focus:outline-none"
          >
            <option value="all">Year: All</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
          </select>

          {/* Department */}
          <select
            value={deptFilter}
            onChange={e => setDeptFilter(e.target.value)}
            className="text-xs font-bold bg-surface-container-low border border-outline-variant/10 rounded-lg px-3 py-2 focus:ring-1 focus:ring-primary focus:outline-none"
          >
            <option value="all">Dept: All</option>
            {departments.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* Type */}
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="text-xs font-bold bg-surface-container-low border border-outline-variant/10 rounded-lg px-3 py-2 focus:ring-1 focus:ring-primary focus:outline-none"
          >
            <option value="all">Filing Type: All</option>
            <option value="MCA">MCA (Companies Act)</option>
            <option value="GST">GST Returns</option>
            <option value="Tax">Income Tax & TDS</option>
            <option value="Labour">Labour Laws</option>
          </select>

          {(yearFilter !== "all" || deptFilter !== "all" || typeFilter !== "all") && (
            <button
              onClick={handleResetFilters}
              className="px-3 py-2 bg-surface-container hover:bg-surface-container-high rounded-lg text-xs font-bold text-secondary flex items-center gap-1 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-sm">filter_alt_off</span>
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Bento Grid Metrics */}
      <div className="grid grid-cols-12 gap-6">
        {/* Metric: On-Time Filing Rate */}
        <div className="col-span-12 sm:col-span-6 lg:col-span-3 bg-surface-container-lowest border border-outline-variant/10 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black text-secondary uppercase tracking-widest">On-Time Filing Rate</span>
            <span className="material-symbols-outlined text-green-600 bg-green-50 p-1 rounded-lg text-sm border border-green-100">verified</span>
          </div>
          <div className="mt-4">
            <span className="text-4xl font-black text-on-surface tracking-tight">{accuracyRate}%</span>
            <p className="text-[10px] text-secondary mt-1 font-medium">Target statutory SLA is 95%</p>
          </div>
          <div className="mt-4 w-full bg-surface-container-low h-1.5 rounded-full overflow-hidden">
            <div className="h-full bg-green-600 rounded-full" style={{ width: `${accuracyRate}%` }}></div>
          </div>
        </div>

        {/* Metric: Filing Completion Rate */}
        <div className="col-span-12 sm:col-span-6 lg:col-span-3 bg-surface-container-lowest border border-outline-variant/10 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black text-secondary uppercase tracking-widest">Overall Completion</span>
            <span className="material-symbols-outlined text-primary bg-primary-container/30 p-1 rounded-lg text-sm border border-primary-container">done_all</span>
          </div>
          <div className="mt-4">
            <span className="text-4xl font-black text-on-surface tracking-tight">{completionRate}%</span>
            <p className="text-[10px] text-secondary mt-1 font-medium">{totalCompletedCount} filed out of {totalPastCount} past due</p>
          </div>
          <div className="mt-4 w-full bg-surface-container-low h-1.5 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: `${completionRate}%` }}></div>
          </div>
        </div>

        {/* Metric: Average Filing Delay */}
        <div className="col-span-12 sm:col-span-6 lg:col-span-3 bg-surface-container-lowest border border-outline-variant/10 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black text-secondary uppercase tracking-widest">Average Filing Delay</span>
            <span className="material-symbols-outlined text-orange-600 bg-orange-50 p-1 rounded-lg text-sm border border-orange-100">hourglass_empty</span>
          </div>
          <div className="mt-4">
            <span className="text-4xl font-black text-on-surface tracking-tight">{averageDelay} <span className="text-lg font-bold">Days</span></span>
            <p className="text-[10px] text-secondary mt-1 font-medium">Computed across {lateCount} delayed filings</p>
          </div>
          <div className="mt-4 w-full bg-surface-container-low h-1.5 rounded-full overflow-hidden">
            <div className="h-full bg-orange-500 rounded-full" style={{ width: `${Math.min(100, averageDelay * 5)}%` }}></div>
          </div>
        </div>

        {/* Metric: Missed Obligations */}
        <div className="col-span-12 sm:col-span-6 lg:col-span-3 bg-surface-container-lowest border border-outline-variant/10 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black text-secondary uppercase tracking-widest">Missed / Overdue</span>
            <span className="material-symbols-outlined text-red-600 bg-red-50 p-1 rounded-lg text-sm border border-red-100">warning</span>
          </div>
          <div className="mt-4">
            <span className="text-4xl font-black text-red-600 tracking-tight">{missedCount}</span>
            <p className="text-[10px] text-secondary mt-1 font-medium">Requires immediate board remediation</p>
          </div>
          <div className="mt-4 w-full bg-surface-container-low h-1.5 rounded-full overflow-hidden">
            <div className="h-full bg-red-600 rounded-full" style={{ width: `${totalPastCount > 0 ? (missedCount / totalPastCount) * 100 : 0}%` }}></div>
          </div>
        </div>
      </div>

      {/* Dynamic Stacked Monthly Histogram */}
      <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-xl p-6 shadow-sm">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="text-lg font-bold text-on-surface tracking-tight">Filing Outcome Timeline</h3>
            <p className="text-xs text-secondary">Statutory tracking of monthly outcomes (On-Time, Late, Missed, Future)</p>
          </div>
          
          {/* Chart Legend */}
          <div className="flex flex-wrap gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-green-500 rounded-sm"></span>
              <span className="text-on-surface-variant">On-Time</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-orange-500 rounded-sm"></span>
              <span className="text-on-surface-variant">Late</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-red-600 rounded-sm"></span>
              <span className="text-on-surface-variant">Missed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-slate-300 rounded-sm"></span>
              <span className="text-on-surface-variant">Future</span>
            </div>
          </div>
        </div>

        {/* Histogram Workspace */}
        <div className="mt-8 relative border-b border-outline-variant/20 pb-4 h-[300px] flex items-end justify-between gap-1 sm:gap-2 px-2 select-none">
          {/* Y Axis Gridlines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pr-8">
            <div className="border-t border-dashed border-outline-variant/10 w-full h-0"></div>
            <div className="border-t border-dashed border-outline-variant/10 w-full h-0"></div>
            <div className="border-t border-dashed border-outline-variant/10 w-full h-0"></div>
            <div className="border-t border-dashed border-outline-variant/10 w-full h-0"></div>
            <div className="w-full h-0"></div>
          </div>

          {/* Monthly Columns */}
          {monthlyData.map((m) => {
            const hasData = m.total > 0
            const onTimePct = hasData ? (m.onTime / m.total) * 100 : 0
            const latePct = hasData ? (m.late / m.total) * 100 : 0
            const missedPct = hasData ? (m.missed / m.total) * 100 : 0
            const futurePct = hasData ? (m.future / m.total) * 100 : 0

            const colHeight = hasData ? `${(m.total / chartMaxScale) * 240}px` : "1px"
            const isHovered = hoveredMonth === m.key

            return (
              <div 
                key={m.key} 
                className="flex flex-col items-center flex-1 relative group cursor-pointer"
                onMouseEnter={() => setHoveredMonth(m.key)}
                onMouseLeave={() => setHoveredMonth(null)}
              >
                {/* Tooltip Popup */}
                {isHovered && hasData && (
                  <div className="absolute bottom-full mb-3 bg-slate-900 text-white rounded-lg p-3 text-left shadow-xl z-30 min-w-[140px] pointer-events-none text-xs leading-relaxed transition-all">
                    <p className="font-bold text-center border-b border-white/10 pb-1 mb-1.5">{m.label}</p>
                    <div className="flex justify-between gap-2">
                      <span className="text-green-400 font-bold">On-Time:</span>
                      <span className="font-bold">{m.onTime}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-orange-400 font-bold">Late:</span>
                      <span className="font-bold">{m.late}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-red-400 font-bold">Missed:</span>
                      <span className="font-bold">{m.missed}</span>
                    </div>
                    {m.future > 0 && (
                      <div className="flex justify-between gap-2">
                        <span className="text-slate-400 font-bold">Future:</span>
                        <span className="font-bold">{m.future}</span>
                      </div>
                    )}
                    <div className="flex justify-between gap-2 border-t border-white/10 mt-1.5 pt-1 font-black">
                      <span>Total:</span>
                      <span>{m.total}</span>
                    </div>
                  </div>
                )}

                {/* Stacked Bar */}
                <div 
                  style={{ height: colHeight }} 
                  className={`w-full max-w-[28px] sm:max-w-[36px] rounded-t-sm overflow-hidden flex flex-col justify-end transition-all shadow-inner ${
                    isHovered ? "ring-2 ring-primary scale-105" : "hover:brightness-105"
                  }`}
                >
                  {/* Future (Top) */}
                  {futurePct > 0 && (
                    <div 
                      style={{ height: `${futurePct}%` }} 
                      className="bg-slate-300 w-full transition-all duration-300"
                    ></div>
                  )}

                  {/* Missed (Red) */}
                  {missedPct > 0 && (
                    <div 
                      style={{ height: `${missedPct}%` }} 
                      className="bg-red-600 w-full transition-all duration-300"
                    ></div>
                  )}

                  {/* Late (Orange) */}
                  {latePct > 0 && (
                    <div 
                      style={{ height: `${latePct}%` }} 
                      className="bg-orange-500 w-full transition-all duration-300"
                    ></div>
                  )}

                  {/* On-Time (Green) */}
                  {onTimePct > 0 && (
                    <div 
                      style={{ height: `${onTimePct}%` }} 
                      className="bg-green-500 w-full transition-all duration-300"
                    ></div>
                  )}

                  {!hasData && (
                    <div className="bg-slate-100 w-full h-[1px]"></div>
                  )}
                </div>

                {/* X Axis Label */}
                <span className="text-[9px] font-bold text-outline mt-2 whitespace-nowrap hidden sm:block">
                  {m.label}
                </span>
              </div>
            )
          })}
        </div>

        {/* Interactive Tip Box */}
        <p className="text-[10px] text-secondary italic mt-4 text-center">
          *Hover over any monthly bar to inspect detailed filing distributions. Outlying columns without stacked color blocks indicate periods with no obligations.
        </p>
      </div>

      {/* Grid: Department Table & Category Breakdown */}
      <div className="grid grid-cols-12 gap-8 items-start">
        {/* Department breakdown table */}
        <div className="col-span-12 lg:col-span-7 bg-surface-container-lowest border border-outline-variant/10 rounded-xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-bold text-on-surface">Departmental GRC Compliance</h3>
            <p className="text-xs text-secondary mt-1">Review filing metrics mapped across company departments.</p>
          </div>

          <div className="overflow-hidden border border-outline-variant/10 rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-surface-container-low text-on-surface-variant font-bold text-xs uppercase tracking-wider">
                <tr className="border-b border-outline-variant/10">
                  <th className="p-4 text-left">Department</th>
                  <th className="p-4 text-center">Total Audited</th>
                  <th className="p-4 text-center">On-Time</th>
                  <th className="p-4 text-center">Delayed</th>
                  <th className="p-4 text-center">Missed</th>
                  <th className="p-4 text-right">Accuracy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container-low">
                {departmentStats.map((dept) => (
                  <tr key={dept.name} className="hover:bg-surface-container-low/20 transition-colors">
                    <td className="p-4 font-bold text-on-surface">{dept.name}</td>
                    <td className="p-4 text-center font-semibold text-on-surface-variant">{dept.total}</td>
                    <td className="p-4 text-center text-green-600 font-bold">{dept.onTime}</td>
                    <td className="p-4 text-center text-orange-500 font-bold">{dept.late}</td>
                    <td className="p-4 text-center text-red-600 font-bold">{dept.missed}</td>
                    <td className="p-4 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
                        dept.accuracy >= 90 
                          ? "bg-green-100 text-green-700" 
                          : dept.accuracy >= 75 
                          ? "bg-orange-100 text-orange-700" 
                          : "bg-red-100 text-red-700"
                      }`}>
                        {dept.accuracy}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Category breakdown grid */}
        <div className="col-span-12 lg:col-span-5 bg-surface-container rounded-xl p-6 border border-outline-variant/15 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-bold text-on-surface">Category Risk Index</h3>
            <p className="text-xs text-secondary mt-1">Completion accuracy divided by regulatory tax & statutory bodies.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {categoryStats.map((cat) => (
              <div key={cat.label} className="bg-surface-container-lowest p-4 rounded-lg border border-outline-variant/10 flex items-center gap-4 shadow-sm">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center border ${cat.color} flex-shrink-0`}>
                  <span className="material-symbols-outlined text-lg">{cat.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-on-surface truncate">{cat.label}</h4>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl font-black text-on-surface">{cat.accuracy}%</span>
                    <span className="text-[9px] text-secondary font-semibold">accuracy</span>
                  </div>
                  <p className="text-[9px] text-secondary font-medium mt-0.5">
                    {cat.onTime} of {cat.total} on-time
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
