import prisma from "@/lib/prisma"

export default async function TasksPage() {

  const tasks = await prisma.task.findMany({
    include: {
      requirement: true,
      company: true
    }
  })

  return (
    <div className="p-8">

      <h1 className="text-2xl font-bold mb-6">
        Compliance Tasks
      </h1>

      <table className="border w-full">

        <thead>
          <tr>
            <th className="p-2">Task</th>
            <th className="p-2">Company</th>
            <th className="p-2">Requirement</th>
            <th className="p-2">Status</th>
          </tr>
        </thead>

        <tbody>
          {tasks.map(task => (
            <tr key={task.id} className="border">

              <td className="p-2">{task.title}</td>

              <td className="p-2">{task.company.name}</td>

              <td className="p-2">{task.requirement.description}</td>

              <td className="p-2">{task.status}</td>

            </tr>
          ))}
        </tbody>

      </table>

    </div>
  )
}