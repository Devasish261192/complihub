"use client"

import { useState, useTransition } from "react"
import { toggleTaskStatus, reassignTask } from "@/app/compliance-calendar/actions"

enum TaskStatus {
  pending = "pending",
  completed = "completed"
}

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
  assigneeId: string | null
  dueDate: string | null
  completedAt: string | null
  status: TaskStatus
  remarks: string | null
  assigneeName: string | null
  assigneeRole: string | null
  department: string | null
  assignedCompliance: AssignedCompliance
}

interface Props {
  initialTasks: any[]
  companyName: string
  teamMembers: any[]
}

export default function TasksPageClient({ initialTasks, companyName, teamMembers }: Props) {
  const [isPending, startTransition] = useTransition()
  const [localTasks, setLocalTasks] = useState<Task[]>(initialTasks as Task[])
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "pending" | "overdue">("all")
  const [yearFilter, setYearFilter] = useState<string>("all")
  const [quarterFilter, setQuarterFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")

  const now = new Date()

  // Actions
  const handleToggleTask = async (task: Task) => {
    const updatedStatus = task.status === TaskStatus.pending ? TaskStatus.completed : TaskStatus.pending
    const updatedTasks = localTasks.map(t => {
      if (t.id === task.id) {
        return {
          ...t,
          status: updatedStatus,
          completedAt: updatedStatus === TaskStatus.completed ? new Date().toISOString() : null,
          remarks: updatedStatus === TaskStatus.completed ? "Completed via Tasks Dashboard" : "Reopened via Tasks Dashboard"
        }
      }
      return t
    })
    setLocalTasks(updatedTasks)

    startTransition(async () => {
      await toggleTaskStatus(task.id, task.status)
    })
  }

  // Filter Logic
  const filteredTasks = localTasks.filter(task => {
    // 1. Search Query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const title = task.assignedCompliance.compliance.title.toLowerCase()
      const desc = (task.assignedCompliance.compliance.description || "").toLowerCase()
      const law = task.assignedCompliance.compliance.applicableLaw.toLowerCase()
      const remarks = (task.remarks || "").toLowerCase()
      const assignee = (task.assigneeName || "").toLowerCase()
      
      if (!title.includes(query) && !desc.includes(query) && !law.includes(query) && !remarks.includes(query) && !assignee.includes(query)) {
        return false
      }
    }

    // 2. Status Filter
    const isOverdue = task.status === TaskStatus.pending && task.dueDate && new Date(task.dueDate) <= now
    if (statusFilter === "completed" && task.status !== TaskStatus.completed) return false
    if (statusFilter === "pending" && (task.status !== TaskStatus.pending || isOverdue)) return false
    if (statusFilter === "overdue" && !isOverdue) return false

    // 3. Year Filter
    if (yearFilter !== "all" && task.dueDate) {
      const year = new Date(task.dueDate).getFullYear().toString()
      if (year !== yearFilter) return false
    }

    // 4. Quarter Filter
    if (quarterFilter !== "all" && task.dueDate) {
      const month = new Date(task.dueDate).getMonth() // 0-11
      let quarter = ""
      if (month >= 0 && month <= 2) quarter = "Q1"
      else if (month >= 3 && month <= 5) quarter = "Q2"
      else if (month >= 6 && month <= 8) quarter = "Q3"
      else if (month >= 9 && month <= 11) quarter = "Q4"
      
      if (quarter !== quarterFilter) return false
    }

    // 5. Type Filter
    if (typeFilter !== "all") {
      const law = task.assignedCompliance.compliance.applicableLaw.toLowerCase()
      if (typeFilter === "GST" && !law.includes("gst")) return false
      if (typeFilter === "MCA" && !law.includes("companies act")) return false
      if (typeFilter === "Tax" && (!law.includes("income tax") && !law.includes("tds"))) return false
      if (typeFilter === "Labour" && (!law.includes("epf") && !law.includes("esi"))) return false
    }

    return true
  })

  // Theme Helpers
  const getCategoryTheme = (law: string) => {
    const l = law.toLowerCase()
    if (l.includes("gst")) return "bg-red-50 text-red-700 border-red-200"
    if (l.includes("companies act")) return "bg-purple-50 text-purple-700 border-purple-200"
    if (l.includes("income tax") || l.includes("tds")) return "bg-orange-50 text-orange-700 border-orange-200"
    return "bg-green-50 text-green-700 border-green-200"
  }

  const getInitials = (name: string | null) => {
    if (!name) return "UN"
    return name.split(" ").map(n => n[0]).join("").toUpperCase()
  }

  // Clear all filters
  const handleResetFilters = () => {
    setSearchQuery("")
    setStatusFilter("all")
    setYearFilter("all")
    setQuarterFilter("all")
    setTypeFilter("all")
  }

  return (
    <div className="space-y-8">
      {/* Page Title & Stats Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <span className="label-md text-primary font-bold tracking-widest uppercase text-[0.65rem] mb-2 block">
            Regulatory Oversight • {companyName}
          </span>
          <h2 className="text-4xl font-extrabold text-on-surface tracking-tight">Obligations Register</h2>
        </div>
        
        {/* Quick Summary Badges */}
        <div className="flex gap-3 bg-surface-container-low p-1.5 rounded-xl border border-outline-variant/10">
          <button 
            onClick={() => setStatusFilter("all")} 
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === "all" ? "bg-primary text-on-primary shadow-sm" : "text-secondary hover:text-on-surface"}`}
          >
            All ({localTasks.length})
          </button>
          <button 
            onClick={() => setStatusFilter("pending")} 
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === "pending" ? "bg-yellow-500 text-white shadow-sm" : "text-secondary hover:text-on-surface"}`}
          >
            Active Pending ({localTasks.filter(t => t.status === "pending" && (!t.dueDate || new Date(t.dueDate) > now)).length})
          </button>
          <button 
            onClick={() => setStatusFilter("overdue")} 
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === "overdue" ? "bg-red-600 text-white shadow-sm" : "text-secondary hover:text-on-surface"}`}
          >
            Overdue ({localTasks.filter(t => t.status === "pending" && t.dueDate && new Date(t.dueDate) <= now).length})
          </button>
          <button 
            onClick={() => setStatusFilter("completed")} 
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === "completed" ? "bg-green-600 text-white shadow-sm" : "text-secondary hover:text-on-surface"}`}
          >
            Completed ({localTasks.filter(t => t.status === "completed").length})
          </button>
        </div>
      </div>

      {/* Bento Filter Box */}
      <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-xl p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-12 gap-4">
          {/* Search Bar */}
          <div className="col-span-12 lg:col-span-4 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-sm">search</span>
            <input 
              type="text" 
              placeholder="Search by obligation title, description, or owner..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-surface-container-low/40 border border-outline-variant/20 rounded-lg pl-9 pr-4 py-2 text-sm w-full focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>

          {/* Year Filter */}
          <div className="col-span-6 sm:col-span-3 lg:col-span-2">
            <select
              value={yearFilter}
              onChange={e => setYearFilter(e.target.value)}
              className="w-full text-xs font-bold bg-surface-container-low/40 border border-outline-variant/20 rounded-lg px-3 py-2.5 focus:ring-1 focus:ring-primary focus:outline-none"
            >
              <option value="all">Year: All</option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2026</option>
            </select>
          </div>

          {/* Quarter Filter */}
          <div className="col-span-6 sm:col-span-3 lg:col-span-2">
            <select
              value={quarterFilter}
              onChange={e => setQuarterFilter(e.target.value)}
              className="w-full text-xs font-bold bg-surface-container-low/40 border border-outline-variant/20 rounded-lg px-3 py-2.5 focus:ring-1 focus:ring-primary focus:outline-none"
            >
              <option value="all">Quarter: All</option>
              <option value="Q1">Q1 (Jan - Mar)</option>
              <option value="Q2">Q2 (Apr - Jun)</option>
              <option value="Q3">Q3 (Jul - Sep)</option>
              <option value="Q4">Q4 (Oct - Dec)</option>
            </select>
          </div>

          {/* Law/Type Filter */}
          <div className="col-span-12 sm:col-span-6 lg:col-span-3">
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="w-full text-xs font-bold bg-surface-container-low/40 border border-outline-variant/20 rounded-lg px-3 py-2.5 focus:ring-1 focus:ring-primary focus:outline-none"
            >
              <option value="all">Filing Type: All</option>
              <option value="MCA">MCA (Companies Act)</option>
              <option value="GST">GST (Goods & Services Tax)</option>
              <option value="Tax">Income Tax & TDS</option>
              <option value="Labour">Labour Laws (PF / ESI)</option>
            </select>
          </div>

          {/* Reset button */}
          <div className="col-span-12 sm:col-span-6 lg:col-span-1 flex justify-end">
            <button 
              onClick={handleResetFilters}
              className="w-full py-2 bg-surface-container-low hover:bg-surface-container-high border border-outline-variant/10 rounded-lg text-xs font-bold text-secondary transition-all active:scale-95 flex items-center justify-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">filter_alt_off</span>
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Obligations Table Card */}
      <div className="bg-surface-container-lowest border border-outline-variant/10 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface-container-low text-on-surface-variant font-bold text-xs uppercase tracking-wider">
              <tr className="border-b border-outline-variant/10">
                <th className="p-4 text-left">Statutory Obligation</th>
                <th className="p-4 text-left">Due Date</th>
                <th className="p-4 text-left">Filing Status</th>
                <th className="p-4 text-left">Assignee Owner</th>
                <th className="p-4 text-center">Filing Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-low">
              {filteredTasks.map((task) => {
                const isTaskCompleted = task.status === TaskStatus.completed
                const isOverdue = task.status === TaskStatus.pending && task.dueDate && new Date(task.dueDate) <= now
                const themeClass = getCategoryTheme(task.assignedCompliance.compliance.applicableLaw)

                let badgeText = "Pending"
                let badgeColor = "bg-yellow-50 text-yellow-700 border-yellow-200"

                if (isTaskCompleted) {
                  const isLate = task.completedAt && task.dueDate && new Date(task.completedAt) > new Date(task.dueDate)
                  badgeText = isLate ? "Completed Late" : "Completed"
                  badgeColor = isLate ? "bg-orange-50 text-orange-700 border-orange-200" : "bg-green-50 text-green-700 border-green-200"
                } else if (isOverdue) {
                  badgeText = "Overdue"
                  badgeColor = "bg-red-50 text-red-700 border-red-200"
                }

                return (
                  <tr key={task.id} className="hover:bg-surface-container-low/10 transition-colors">
                    {/* Compliance Details */}
                    <td className="p-4 max-w-sm">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-on-surface">{task.assignedCompliance.compliance.title}</h4>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${themeClass}`}>
                            {task.assignedCompliance.compliance.applicableLaw}
                          </span>
                        </div>
                        <p className="text-xs text-secondary leading-relaxed line-clamp-2">
                          {task.assignedCompliance.compliance.description}
                        </p>
                        {task.remarks && (
                          <div className="text-[10px] text-tertiary bg-surface-container/50 px-2 py-1 rounded border border-outline-variant/10 flex items-start gap-1">
                            <span className="material-symbols-outlined text-[12px] mt-0.5">comment</span>
                            <span className="italic">Remarks: {task.remarks}</span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Due Date & Filing Date */}
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-on-surface">
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A"}
                        </span>
                        {isTaskCompleted && task.completedAt && (
                          <span className="text-[10px] text-green-600 font-medium">
                            Filed: {new Date(task.completedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border inline-block ${badgeColor}`}>
                        {badgeText}
                      </span>
                    </td>

                    {/* Assignee / Department Dropdown */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-7 w-7 rounded-full bg-primary-container/30 text-primary flex items-center justify-center text-xs font-black">
                          {getInitials(task.assigneeName)}
                        </div>
                        <div className="flex flex-col min-w-[130px]">
                          <select
                            value={task.assigneeId || ""}
                            disabled={isPending}
                            onChange={async (e) => {
                              const newAssigneeId = e.target.value
                              if (!newAssigneeId) return
                              
                              const targetUser = teamMembers.find(u => u.id === newAssigneeId)
                              if (targetUser) {
                                const updatedTasks = localTasks.map(t => {
                                  if (t.id === task.id) {
                                    return {
                                      ...t,
                                      assigneeId: targetUser.id,
                                      assigneeName: targetUser.name,
                                      assigneeRole: targetUser.role.name === "COMPANY_ADMIN" ? "Company Admin" : "Compliance Officer",
                                      department: targetUser.department
                                    }
                                  }
                                  return t
                                })
                                setLocalTasks(updatedTasks)
                              }

                              startTransition(async () => {
                                await reassignTask(task.id, newAssigneeId)
                              })
                            }}
                            className="text-xs font-semibold bg-transparent border-none p-0 focus:ring-1 focus:ring-primary focus:outline-none cursor-pointer text-on-surface-variant hover:text-primary transition-colors"
                          >
                            <option value="">Unassigned</option>
                            {teamMembers.map((u) => (
                              <option key={u.id} value={u.id}>
                                {u.name}
                              </option>
                            ))}
                          </select>
                          <span className="text-[10px] text-outline leading-none mt-0.5">
                            {task.department || "General"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Toggle Status Action */}
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleToggleTask(task)}
                        disabled={isPending}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg border active:scale-95 transition-all inline-flex items-center gap-1.5 ${
                          isTaskCompleted
                            ? "bg-surface-container-low text-secondary border-outline-variant/20 hover:bg-surface-container"
                            : "bg-primary text-on-primary border-primary hover:bg-primary-dim shadow-sm"
                        }`}
                      >
                        <span className="material-symbols-outlined text-sm">
                          {isTaskCompleted ? "lock_open" : "done_all"}
                        </span>
                        <span>{isTaskCompleted ? "Reopen" : "Mark Filed"}</span>
                      </button>
                    </td>
                  </tr>
                )
              })}

              {filteredTasks.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-outline">
                    <div className="flex flex-col items-center justify-center">
                      <span className="material-symbols-outlined text-4xl mb-2 text-outline/40">assignment_turned_in</span>
                      <p className="text-sm font-bold">No statutory obligations match your active filters.</p>
                      <button 
                        onClick={handleResetFilters}
                        className="mt-3 text-xs font-bold text-primary hover:underline"
                      >
                        Reset filters to view all tasks
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
