import prisma from "@/lib/prisma"
import { getSessionFromCookies } from "@/lib/auth"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import Link from "next/link"

export default async function FileReturnPage() {
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

  // Get all pending tasks for the company
  const pendingTasks = await prisma.task.findMany({
    where: {
      assignedCompliance: {
        companyId: company.id,
      },
      status: "pending",
    },
    include: {
      assignedCompliance: {
        include: {
          compliance: true,
        },
      },
    },
    orderBy: { dueDate: "asc" },
  })

  // Server Action to handle form submission
  async function submitFilingAction(formData: FormData) {
    "use server"

    const taskId = String(formData.get("taskId") || "")
    const challanNumber = String(formData.get("challanNumber") || "").trim()
    const userRemarks = String(formData.get("remarks") || "").trim()

    if (!taskId) {
      throw new Error("Compliance task selection is required.")
    }

    const remarks = `Filed manually u/s GRC portal. Receipt/Challan: ${challanNumber || "N/A"}. Remarks: ${userRemarks || "None"}`

    // Update task in database
    await prisma.task.update({
      where: { id: taskId },
      data: {
        status: "completed",
        completedAt: new Date(),
        remarks,
      },
    })

    revalidatePath("/dashboard")
    revalidatePath("/compliance-calendar")
    revalidatePath("/tasks")

    redirect("/tasks?success=Filing%20submitted%20successfully")
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <span className="label-md text-primary font-bold tracking-widest uppercase text-[0.65rem] mb-2 block">
          Statutory Filing Wizard • {company.name}
        </span>
        <h2 className="text-4xl font-extrabold text-on-surface tracking-tight">File Statutory Return</h2>
        <p className="text-xs text-secondary mt-1">Select an active obligation, log filing particulars, and upload compliance proof documents.</p>
      </div>

      {/* Form Card */}
      <div className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/10 shadow-sm">
        <form action={submitFilingAction} className="space-y-6">
          
          {/* 1. Obligation Dropdown */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-outline-variant uppercase tracking-wider block" htmlFor="taskId">Select Compliance Item</label>
            <select 
              id="taskId"
              name="taskId"
              required
              className="w-full rounded-md border border-outline-variant/30 bg-white px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">-- Choose a Pending Obligation --</option>
              {pendingTasks.map((task) => {
                const formattedDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A"
                return (
                  <option key={task.id} value={task.id}>
                    {task.assignedCompliance.compliance.title} (Due: {formattedDate})
                  </option>
                )
              })}
            </select>
            {pendingTasks.length === 0 && (
              <p className="text-xs text-green-600 font-bold mt-1">All compliance items are currently fully filed! No pending tasks.</p>
            )}
          </div>

          {/* 2. Challan/Receipt Number */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-outline-variant uppercase tracking-wider block" htmlFor="challanNumber">Challan / Acknowledgement No.</label>
            <input 
              id="challanNumber"
              name="challanNumber"
              type="text" 
              required
              placeholder="e.g. TRRN 8839210293 or ARN AA271024098234"
              className="w-full rounded-md border border-outline-variant/30 bg-white px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* 3. File Upload (Mock) */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-outline-variant uppercase tracking-wider block" htmlFor="receiptFile">Upload Receipt / Form Copy</label>
            <div className="border-2 border-dashed border-outline-variant/30 rounded-lg p-6 flex flex-col items-center justify-center bg-surface-container-low/20 hover:bg-surface-container-low/40 transition-colors cursor-pointer relative group">
              <input 
                id="receiptFile"
                name="receiptFile"
                type="file" 
                required
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <span className="material-symbols-outlined text-3xl text-outline-variant group-hover:text-primary transition-colors">cloud_upload</span>
              <p className="text-xs font-bold text-on-surface mt-2">Click to select PDF or Image file</p>
              <p className="text-[10px] text-secondary mt-1">Maximum file size: 5MB</p>
            </div>
          </div>

          {/* 4. Remarks */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-outline-variant uppercase tracking-wider block" htmlFor="remarks">Submission Remarks</label>
            <textarea 
              id="remarks"
              name="remarks"
              rows={3}
              placeholder="Provide comments on the filing computation or notes for internal reviewers."
              className="w-full rounded-md border border-outline-variant/30 bg-white px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
            ></textarea>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-surface-container">
            <Link href="/dashboard" className="px-5 py-2.5 bg-surface-container text-secondary font-bold text-sm rounded-md border border-outline-variant/10 hover:bg-surface-container-high transition-colors">
              Cancel
            </Link>
            <button 
              type="submit" 
              disabled={pendingTasks.length === 0}
              className="px-5 py-2.5 bg-primary text-on-primary rounded-md text-sm font-bold shadow-md hover:bg-primary-dim active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all"
            >
              Submit Return
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
