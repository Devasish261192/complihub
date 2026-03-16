import prisma from "@/lib/prisma"

export default async function DashboardPage() {

  const taskCount = await prisma.task.count()
  const frameworkCount = await prisma.framework.count()

  return (
    <div className="p-8">

      <h1 className="text-2xl font-bold mb-6">
        Compliance Dashboard
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

        <div className="border p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold">
            Total Frameworks
          </h2>

          <p className="text-3xl mt-2">
            {frameworkCount}
          </p>
        </div>

        <div className="border p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-semibold">
            Total Tasks
          </h2>

          <p className="text-3xl mt-2">
            {taskCount}
          </p>
        </div>

      </div>

    </div>
  )
}
