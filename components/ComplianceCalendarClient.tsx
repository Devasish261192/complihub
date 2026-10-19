"use client"

import { useState, useEffect, useTransition } from "react"
import { useRouter } from "next/navigation"
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
  dueDate: string | Date | null
  completedAt: string | Date | null
  status: TaskStatus
  remarks: string | null
  assigneeName: string | null
  assigneeRole: string | null
  department: string | null
  assignedCompliance: AssignedCompliance
}

interface Props {
  initialTasks: any[]
  year: number
  month: number
  companyName: string
  teamMembers: any[]
}

export default function ComplianceCalendarClient({ initialTasks, year, month, companyName, teamMembers }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  // Local state for instant UI updates
  const [localTasks, setLocalTasks] = useState<Task[]>(initialTasks as Task[])
  
  // Active day selection
  const now = new Date()
  const isCurrentMonth = now.getFullYear() === year && (now.getMonth() + 1) === month
  const initialSelectedDay = isCurrentMonth ? now.getDate() : 1
  const [selectedDay, setSelectedDay] = useState<number>(initialSelectedDay)

  // Filters state
  const [filterGST, setFilterGST] = useState(true)
  const [filterMCA, setFilterMCA] = useState(true)
  const [filterTax, setFilterTax] = useState(true)
  const [filterLabour, setFilterLabour] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  // Keep local tasks in sync with incoming server props
  useEffect(() => {
    setLocalTasks(initialTasks as Task[])
  }, [initialTasks])

  // Month navigation
  const handlePrevMonth = () => {
    let m = month - 1
    let y = year
    if (m === 0) {
      m = 12
      y -= 1
    }
    router.push(`/compliance-calendar?year=${y}&month=${m}`)
  }

  const handleNextMonth = () => {
    let m = month + 1
    let y = year
    if (m === 13) {
      m = 1
      y += 1
    }
    router.push(`/compliance-calendar?year=${y}&month=${m}`)
  }

  // Filter logic
  const isTaskMatch = (task: Task) => {
    const law = task.assignedCompliance.compliance.applicableLaw.toLowerCase()
    const title = task.assignedCompliance.compliance.title.toLowerCase()
    const desc = (task.assignedCompliance.compliance.description || "").toLowerCase()
    const query = searchQuery.toLowerCase()

    // 1. Search Query Filter
    if (query && !title.includes(query) && !desc.includes(query)) {
      return false
    }

    // 2. Category Checkbox Filters
    if (law.includes("gst")) return filterGST
    if (law.includes("companies act")) return filterMCA
    if (law.includes("income tax") || law.includes("tds")) return filterTax
    if (law.includes("epf") || law.includes("esi")) return filterLabour

    return true
  }

  // Generate calendar grid cells
  const firstDayOfMonth = new Date(year, month - 1, 1)
  let firstDayIndex = firstDayOfMonth.getDay() - 1 // Monday = 0, Sunday = 6
  if (firstDayIndex === -1) firstDayIndex = 6 // Adjust Sunday

  const totalDays = new Date(year, month, 0).getDate()
  const prevMonthTotalDays = new Date(year, month - 1, 0).getDate()

  const gridCells = []

  // Prev month cells padding
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const dayNum = prevMonthTotalDays - i
    gridCells.push({
      day: dayNum,
      isCurrentMonth: false,
      date: new Date(year, month - 2, dayNum)
    })
  }

  // Current month cells
  for (let i = 1; i <= totalDays; i++) {
    gridCells.push({
      day: i,
      isCurrentMonth: true,
      date: new Date(year, month - 1, i)
    })
  }

  // Next month cells padding to fill out grid
  const cellsNeeded = gridCells.length <= 35 ? 35 : 42
  const nextMonthPadding = cellsNeeded - gridCells.length
  for (let i = 1; i <= nextMonthPadding; i++) {
    gridCells.push({
      day: i,
      isCurrentMonth: false,
      date: new Date(year, month, i)
    })
  }

  // Map tasks to grid cells
  const getTasksForDay = (dayDate: Date, currentMonthOnly = true) => {
    return localTasks.filter(task => {
      if (!task.dueDate) return false
      const dDate = new Date(task.dueDate)
      
      const matchDate = dDate.getUTCDate() === dayDate.getDate() &&
                        dDate.getUTCMonth() === dayDate.getMonth() &&
                        dDate.getUTCFullYear() === dayDate.getFullYear()
      
      return matchDate && isTaskMatch(task)
    })
  }

  const selectedDateObject = new Date(year, month - 1, selectedDay)
  const selectedDayTasks = getTasksForDay(selectedDateObject)
  const monthName = firstDayOfMonth.toLocaleString("default", { month: "long", year: "numeric" })

  const handleToggleTask = async (task: Task) => {
    // 1. Optimistic update
    const updatedStatus = task.status === TaskStatus.pending ? TaskStatus.completed : TaskStatus.pending
    const updatedTasks = localTasks.map(t => {
      if (t.id === task.id) {
        return {
          ...t,
          status: updatedStatus,
          completedAt: updatedStatus === TaskStatus.completed ? new Date() : null,
          remarks: updatedStatus === TaskStatus.completed ? "Completed via Calendar Portal" : "Reopened via Calendar Portal"
        }
      }
      return t
    })
    setLocalTasks(updatedTasks)

    // 2. Invoke Server Action
    startTransition(async () => {
      await toggleTaskStatus(task.id, task.status)
    })
  }

  // Helper to format category tags
  const getCategoryTheme = (law: string) => {
    const l = law.toLowerCase()
    if (l.includes("gst")) return { bg: "bg-red-50 text-red-700 border-red-200/50", border: "border-l-error" }
    if (l.includes("companies act")) return { bg: "bg-purple-50 text-purple-700 border-purple-200/50", border: "border-l-primary" }
    if (l.includes("income tax") || l.includes("tds")) return { bg: "bg-orange-50 text-orange-700 border-orange-200/50", border: "border-l-orange-500" }
    return { bg: "bg-green-50 text-green-700 border-green-200/50", border: "border-l-green-500" } // Labour / EPF / ESI
  }

  // Helper for Initials
  const getInitials = (name: string | null) => {
    if (!name) return "CS"
    return name.split(" ").map(n => n[0]).join("").toUpperCase()
  }

  return (
    <div className="space-y-8">
      {/* Breadcrumbs & Header */}
      <div>
        <span className="label-md text-primary font-bold tracking-widest uppercase text-[0.65rem] mb-2 block">
          Governance Framework • {companyName}
        </span>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <h2 className="text-4xl font-extrabold text-on-surface tracking-tight">Compliance Calendar</h2>
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative flex-grow md:flex-grow-0">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-sm">search</span>
              <input 
                type="text" 
                placeholder="Search tasks..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-white border border-outline-variant/30 rounded-md pl-9 pr-4 py-2 text-sm w-full md:w-64 focus:ring-1 focus:ring-primary focus:outline-none"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-md text-sm font-bold shadow-sm active:scale-95 transition-all">
              <span className="material-symbols-outlined text-sm">download</span>
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bento Grid layout */}
      <div className="grid grid-cols-12 gap-8 items-start">
        {/* Left: Monthly Calendar (Col 8) */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10 shadow-sm">
            
            {/* Calendar Header with Month Navigator */}
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <h3 className="text-xl font-bold text-on-surface">{monthName}</h3>
                <div className="flex gap-1 bg-surface-container-low p-0.5 rounded-lg border border-outline-variant/10">
                  <button onClick={handlePrevMonth} className="p-1 hover:bg-surface-container rounded transition-colors" title="Previous Month">
                    <span className="material-symbols-outlined text-lg">chevron_left</span>
                  </button>
                  <button onClick={handleNextMonth} className="p-1 hover:bg-surface-container rounded transition-colors" title="Next Month">
                    <span className="material-symbols-outlined text-lg">chevron_right</span>
                  </button>
                </div>
              </div>
              <div className="text-xs text-secondary font-medium italic">
                {isPending ? "Refreshing..." : `Showing ${localTasks.length} obligations`}
              </div>
            </div>

            {/* Weekdays Header */}
            <div className="grid grid-cols-7 gap-px bg-outline-variant/10 border border-outline-variant/10 rounded-lg overflow-hidden">
              <div className="bg-surface-container-low py-3 text-center"><span className="label-md text-outline font-bold text-[0.7rem] uppercase">Mon</span></div>
              <div className="bg-surface-container-low py-3 text-center"><span className="label-md text-outline font-bold text-[0.7rem] uppercase">Tue</span></div>
              <div className="bg-surface-container-low py-3 text-center"><span className="label-md text-outline font-bold text-[0.7rem] uppercase">Wed</span></div>
              <div className="bg-surface-container-low py-3 text-center"><span className="label-md text-outline font-bold text-[0.7rem] uppercase">Thu</span></div>
              <div className="bg-surface-container-low py-3 text-center"><span className="label-md text-outline font-bold text-[0.7rem] uppercase">Fri</span></div>
              <div className="bg-surface-container-low py-3 text-center"><span className="label-md text-outline font-bold text-[0.7rem] uppercase">Sat</span></div>
              <div className="bg-surface-container-low py-3 text-center"><span className="label-md text-outline font-bold text-[0.7rem] uppercase">Sun</span></div>
              
              {/* Day Cells */}
              {gridCells.map((cell, idx) => {
                const dayTasks = getTasksForDay(cell.date)
                const isSelected = cell.isCurrentMonth && selectedDay === cell.day
                const hasPending = dayTasks.some(t => t.status === TaskStatus.pending)
                const hasOverdue = dayTasks.some(t => t.status === TaskStatus.pending && t.dueDate && new Date(t.dueDate) <= now)
                
                return (
                  <button
                    key={`${cell.date.toISOString()}-${idx}`}
                    onClick={() => {
                      if (cell.isCurrentMonth) {
                        setSelectedDay(cell.day)
                      } else {
                        // Navigate to the respective month
                        router.push(`/compliance-calendar?year=${cell.date.getFullYear()}&month=${cell.date.getMonth() + 1}`)
                      }
                    }}
                    className={`min-h-[110px] p-2 text-left flex flex-col justify-between transition-all border border-outline-variant/5 hover:bg-surface-container-low/40 relative group ${
                      cell.isCurrentMonth ? "bg-surface-container-lowest text-on-surface" : "bg-surface-container-low/20 text-outline opacity-40"
                    } ${
                      isSelected ? "ring-2 ring-primary ring-inset bg-surface-container-low/50" : ""
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className={`text-xs font-bold ${cell.isCurrentMonth ? "text-primary" : "text-outline"}`}>{cell.day}</span>
                      {cell.isCurrentMonth && dayTasks.length > 0 && (
                        <div className="flex gap-1">
                          {hasOverdue && <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></span>}
                          {!hasOverdue && hasPending && <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>}
                          {!hasPending && <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>}
                        </div>
                      )}
                    </div>
                    
                    {/* Day Task Previews */}
                    <div className="mt-2 space-y-1 w-full overflow-hidden flex-1 flex flex-col justify-end">
                      {dayTasks.slice(0, 2).map(task => {
                        const theme = getCategoryTheme(task.assignedCompliance.compliance.applicableLaw)
                        const isTaskCompleted = task.status === TaskStatus.completed
                        return (
                          <div 
                            key={task.id} 
                            className={`text-[0.6rem] p-1 rounded border-l-2 ${theme.bg} ${theme.border} truncate font-semibold leading-tight flex items-center justify-between ${
                              isTaskCompleted ? "opacity-60 line-through" : ""
                            }`}
                          >
                            <span className="truncate">{task.assignedCompliance.compliance.title}</span>
                          </div>
                        )
                      })}
                      {dayTasks.length > 2 && (
                        <span className="text-[0.55rem] text-outline font-black mt-1 block self-end bg-surface-container-low px-1 rounded">
                          +{dayTasks.length - 2} more
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right: Daily Detail & Priorities (Col 4) */}
        <div className="col-span-12 lg:col-span-4 space-y-6 lg:sticky lg:top-24">
          
          {/* Day Detail Card */}
          <div className="bg-surface-container rounded-xl p-6 border border-outline-variant/15 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Schedule For</h4>
                <h3 className="text-2xl font-extrabold text-on-surface">
                  {selectedDateObject.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </h3>
              </div>
              <div className="h-12 w-12 bg-surface-container-lowest rounded-lg flex flex-col items-center justify-center border border-outline-variant/10 shadow-sm">
                <span className="text-primary font-black text-xl leading-none">{selectedDay}</span>
                <span className="text-[0.6rem] uppercase font-bold text-outline">
                  {selectedDateObject.toLocaleDateString("en-US", { weekday: "short" })}
                </span>
              </div>
            </div>

            {/* Selected Day's Task List */}
            <div className="space-y-4 min-h-[180px] max-h-[400px] overflow-y-auto pr-1">
              {selectedDayTasks.map(task => {
                const isTaskCompleted = task.status === TaskStatus.completed
                const isOverdue = task.status === TaskStatus.pending && task.dueDate && new Date(task.dueDate) <= now
                const theme = getCategoryTheme(task.assignedCompliance.compliance.applicableLaw)
                
                // Determine completion tag
                let badgeText = "Pending"
                let badgeColor = "bg-primary-container/40 text-primary"
                
                if (isTaskCompleted) {
                  const isLate = task.completedAt && task.dueDate && new Date(task.completedAt) > new Date(task.dueDate)
                  badgeText = isLate ? "Completed Late" : "Completed"
                  badgeColor = isLate ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"
                } else if (isOverdue) {
                  badgeText = "Overdue"
                  badgeColor = "bg-red-100 text-red-700"
                }

                return (
                  <div 
                    key={task.id} 
                    className={`bg-surface-container-lowest p-4 rounded-lg shadow-sm border border-l-4 ${theme.border} border-outline-variant/10 hover:shadow-md transition-shadow`}
                  >
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[0.6rem] font-black uppercase ${badgeColor}`}>
                        {badgeText}
                      </span>
                      <button 
                        onClick={() => handleToggleTask(task)} 
                        className={`text-[0.65rem] font-bold px-2.5 py-1 rounded border active:scale-95 transition-all ${
                          isTaskCompleted 
                            ? "bg-surface-container-low text-secondary border-outline-variant/20 hover:bg-surface-container" 
                            : "bg-primary text-white border-primary hover:bg-primary-dim shadow-sm"
                        }`}
                      >
                        {isTaskCompleted ? "Reopen" : "Mark Filed"}
                      </button>
                    </div>

                    <h5 className="text-sm font-bold text-on-surface mb-1">{task.assignedCompliance.compliance.title}</h5>
                    <p className="text-[0.7rem] text-on-surface-variant leading-relaxed mb-3">
                      {task.remarks || task.assignedCompliance.compliance.description}
                    </p>

                    <div className="flex justify-between items-center border-t border-surface-container pt-3">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-surface-container flex items-center justify-center text-[0.55rem] font-black border border-outline-variant/20 text-primary">
                          {getInitials(task.assigneeName)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[0.7rem] font-bold text-on-surface-variant leading-none">{task.assigneeName || "Unassigned"}</span>
                          <span className="text-[0.55rem] text-outline leading-none mt-0.5">{task.department || "General"}</span>
                        </div>
                      </div>
                      <span className="text-[0.65rem] font-bold text-outline">
                        Law: {task.assignedCompliance.compliance.applicableLaw}
                      </span>
                    </div>

                    {/* Change Assignee Dropdown */}
                    <div className="mt-3 pt-2 border-t border-dashed border-outline-variant/10 flex items-center justify-between">
                      <label className="text-[0.6rem] font-bold text-outline uppercase">Assign Owner:</label>
                      <select
                        value={task.assigneeId || ""}
                        disabled={isPending}
                        onChange={async (e) => {
                          const newAssigneeId = e.target.value
                          if (!newAssigneeId) return
                          
                          // Optimistic update
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

                          // Trigger Server Action
                          startTransition(async () => {
                            await reassignTask(task.id, newAssigneeId)
                          })
                        }}
                        className="text-[0.65rem] font-semibold bg-surface-container-low border-none rounded px-2 py-1 focus:ring-1 focus:ring-primary focus:outline-none"
                      >
                        <option value="">-- Select Member --</option>
                        {teamMembers.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name} ({u.department || "General"})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )
              })}

              {selectedDayTasks.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center text-outline">
                  <span className="material-symbols-outlined text-3xl mb-2 text-outline/50">event_busy</span>
                  <p className="text-xs font-semibold">No statutory deadlines scheduled for this day.</p>
                </div>
              )}
            </div>

            {/* Quick Category Legend Checkboxes */}
            <div className="mt-8 pt-6 border-t border-outline-variant/20">
              <h4 className="text-[0.65rem] font-bold text-outline uppercase tracking-wider mb-4">Category Filters</h4>
              <div className="flex flex-wrap gap-2">
                <label className="flex items-center gap-2 px-3 py-1.5 bg-surface-container-low rounded-full border border-outline-variant/10 cursor-pointer hover:bg-surface-container-high transition-colors">
                  <input type="checkbox" checked={filterMCA} onChange={e => setFilterMCA(e.target.checked)} className="w-3.5 h-3.5 rounded text-primary focus:ring-primary border-outline-variant/30" />
                  <span className="text-[0.7rem] font-bold text-on-surface-variant">MCA</span>
                </label>
                <label className="flex items-center gap-2 px-3 py-1.5 bg-surface-container-low rounded-full border border-outline-variant/10 cursor-pointer hover:bg-surface-container-high transition-colors">
                  <input type="checkbox" checked={filterGST} onChange={e => setFilterGST(e.target.checked)} className="w-3.5 h-3.5 rounded text-primary focus:ring-primary border-outline-variant/30" />
                  <span className="text-[0.7rem] font-bold text-on-surface-variant">GST</span>
                </label>
                <label className="flex items-center gap-2 px-3 py-1.5 bg-surface-container-low rounded-full border border-outline-variant/10 cursor-pointer hover:bg-surface-container-high transition-colors">
                  <input type="checkbox" checked={filterTax} onChange={e => setFilterTax(e.target.checked)} className="w-3.5 h-3.5 rounded text-primary focus:ring-primary border-outline-variant/30" />
                  <span className="text-[0.7rem] font-bold text-on-surface-variant">Income Tax</span>
                </label>
                <label className="flex items-center gap-2 px-3 py-1.5 bg-surface-container-low rounded-full border border-outline-variant/10 cursor-pointer hover:bg-surface-container-high transition-colors">
                  <input type="checkbox" checked={filterLabour} onChange={e => setFilterLabour(e.target.checked)} className="w-3.5 h-3.5 rounded text-primary focus:ring-primary border-outline-variant/30" />
                  <span className="text-[0.7rem] font-bold text-on-surface-variant">Labour (PF/ESI)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Support / Quick Help Alert Box */}
          <div className="bg-surface-dim rounded-xl p-5 border border-outline-variant/15 flex gap-4 items-start shadow-sm">
            <div className="h-8 w-8 bg-tertiary-container rounded-full flex items-center justify-center flex-shrink-0 text-primary">
              <span className="material-symbols-outlined text-lg">info</span>
            </div>
            <div>
              <p className="text-[0.6rem] font-black text-tertiary uppercase tracking-wider mb-1">Calendar Navigation Info</p>
              <p className="text-[0.7rem] text-on-surface-variant leading-relaxed">
                Clicking cells from other months (disabled state) will automatically navigate to that calendar month view. Category filters affect both calendar cells and side lists.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
