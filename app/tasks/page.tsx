import prisma from "@/lib/prisma"
import { getSessionFromCookies } from "@/lib/auth"
import TasksPageClient from "@/components/TasksPageClient"

export default async function TasksPage() {
  const session = await getSessionFromCookies()
  const companyId = session?.companyId

  // Retrieve current active company
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

  // Fetch all tasks for this company
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

  // Fetch team members for task allocation
  const teamMembers = await prisma.user.findMany({
    where: { companyId: company.id },
    include: { role: true },
    orderBy: { name: "asc" },
  })

  // Format dates & serialize cleanly to Client Components
  const serializedTasks = tasks.map(t => ({
    ...t,
    dueDate: t.dueDate ? t.dueDate.toISOString() : null,
    completedAt: t.completedAt ? t.completedAt.toISOString() : null,
    createdAt: t.createdAt.toISOString()
  }))

  const serializedTeamMembers = teamMembers.map(u => ({
    ...u,
    createdAt: u.createdAt.toISOString()
  }))

  return (
    <TasksPageClient
      initialTasks={serializedTasks}
      companyName={company.name}
      teamMembers={serializedTeamMembers}
    />
  )
}
