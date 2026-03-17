import prisma from "@/lib/prisma"

export default async function DashboardPage() {

  const [companyCount, complianceCount, assignedCount, pendingTasks] = await Promise.all([
    prisma.company.count(),
    prisma.compliance.count(),
    prisma.assignedCompliance.count(),
    prisma.task.count({ where: { status: "pending" } }),
  ])

  return (
    <div className="p-8 space-y-6">

      <h1 className="text-2xl font-bold">
        Compliance Dashboard
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        <div className="border p-6 rounded-lg shadow-sm">
          <h2 className="text-sm font-medium text-muted-foreground">
            Companies
          </h2>
          <p className="text-3xl mt-2 font-semibold">
            {companyCount}
          </p>
        </div>

        <div className="border p-6 rounded-lg shadow-sm">
          <h2 className="text-sm font-medium text-muted-foreground">
            Compliances
          </h2>
          <p className="text-3xl mt-2 font-semibold">
            {complianceCount}
          </p>
        </div>

        <div className="border p-6 rounded-lg shadow-sm">
          <h2 className="text-sm font-medium text-muted-foreground">
            Assigned Compliances
          </h2>
          <p className="text-3xl mt-2 font-semibold">
            {assignedCount}
          </p>
        </div>

        <div className="border p-6 rounded-lg shadow-sm">
          <h2 className="text-sm font-medium text-muted-foreground">
            Pending Tasks
          </h2>
          <p className="text-3xl mt-2 font-semibold">
            {pendingTasks}
          </p>
        </div>

      </div>

    </div>
  )
}
