import prisma from "@/lib/prisma"
import Link from "next/link"

export default async function FrameworksPage() {

  const frameworks = await prisma.framework.findMany()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">
        Compliance Frameworks
      </h1>

      <table className="border w-full">
        <thead>
          <tr className="border">
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Description</th>
          </tr>
        </thead>

        <tbody>
          {frameworks.map((framework) => (
            <tr key={framework.id} className="border">
              <td className="p-2">
                <Link href={`/frameworks/${framework.id}`} className="text-blue-600 underline">
                  {framework.name}
                </Link>
              </td>
              <td className="p-2">{framework.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}