import prisma from "@/lib/prisma"

export default async function TasksPage() {

  const tasks = await prisma.task.findMany({
    include: {
      assignedCompliance: {
        include: {
          compliance: true,
          company: true,
        },
      },
    },
    orderBy: { dueDate: "asc" },
  })

  return (
    <div className="p-8">

      <h1 className="text-2xl font-bold mb-6">
        Compliance Tasks
      </h1>

      <table className="border w-full text-sm">

        <thead className="bg-muted/40">
          <tr>
            <th className="p-2 text-left">Compliance</th>
            <th className="p-2 text-left">Company</th>
            <th className="p-2 text-left">Due Date</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2 text-left">Remarks</th>
          </tr>
        </thead>

        <tbody>
          {tasks.map((task) => (
            <tr key={task.id} className="border-t">

              <td className="p-2">{task.assignedCompliance.compliance.title}</td>

              <td className="p-2">{task.assignedCompliance.company.name}</td>

              <td className="p-2">
                {task.dueDate
                  ? new Date(task.dueDate).toLocaleDateString()
                  : "—"}
              </td>

              <td className="p-2 capitalize">{task.status}</td>

              <td className="p-2">{task.remarks || ""}</td>

            </tr>
          ))}
          {tasks.length === 0 && (
            <tr>
              <td colSpan={5} className="p-4 text-center text-muted-foreground">
                No tasks yet.
              </td>
            </tr>
          )}
        </tbody>

      </table>

    </div>
  )
}
