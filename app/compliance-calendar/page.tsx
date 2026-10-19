import prisma from "@/lib/prisma"
import { getSessionFromCookies } from "@/lib/auth"
import ComplianceCalendarClient from "@/components/ComplianceCalendarClient"

type SearchParams = {
  year?: string
  month?: string
}

export default async function ComplianceCalendarPage(props: { searchParams: Promise<SearchParams> }) {
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

  // Parse search params for year and month
  const params = await props.searchParams
  const now = new Date()
  const year = params.year ? parseInt(params.year) : now.getFullYear()
  const month = params.month ? parseInt(params.month) : (now.getMonth() + 1)

  // Start and end of the selected month
  const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0))
  const endDate = new Date(Date.UTC(year, month, 1, 0, 0, 0)) // 1st of next month

  // Fetch tasks due in this selected month
  const tasks = await prisma.task.findMany({
    where: {
      assignedCompliance: {
        companyId: company.id,
      },
      dueDate: {
        gte: startDate,
        lt: endDate,
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

  // Fetch and serialize team members for task allocation
  const teamMembers = await prisma.user.findMany({
    where: { companyId: company.id },
    orderBy: { name: "asc" }
  })
  
  const serializedTeamMembers = teamMembers.map(u => ({
    ...u,
    createdAt: u.createdAt.toISOString()
  }))

  // Format dates so they serialize cleanly to Client Components
  const serializedTasks = tasks.map(t => ({
    ...t,
    dueDate: t.dueDate ? t.dueDate.toISOString() : null,
    completedAt: t.completedAt ? t.completedAt.toISOString() : null,
    createdAt: t.createdAt.toISOString()
  }))

  return (
    <ComplianceCalendarClient
      initialTasks={serializedTasks}
      year={year}
      month={month}
      companyName={company.name}
      teamMembers={serializedTeamMembers}
    />
  )
}
