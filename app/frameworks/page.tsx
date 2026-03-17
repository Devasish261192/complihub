import prisma from "@/lib/prisma"

export default async function CompliancesPage() {

  const compliances = await prisma.compliance.findMany({
    include: { category: true },
    orderBy: { title: "asc" },
  })

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Compliance Library</h1>
      <p className="text-muted-foreground">Master list of compliances and their frequencies.</p>

      <table className="border w-full text-sm">
        <thead className="bg-muted/40">
          <tr className="border-b">
            <th className="p-2 text-left">Title</th>
            <th className="p-2 text-left">Category</th>
            <th className="p-2 text-left">Frequency</th>
            <th className="p-2 text-left">Applicable Law</th>
          </tr>
        </thead>

        <tbody>
          {compliances.map((compliance) => (
            <tr key={compliance.id} className="border-b">
              <td className="p-2 font-medium">{compliance.title}</td>
              <td className="p-2">{compliance.category?.name || ""}</td>
              <td className="p-2 capitalize">{compliance.frequency.replace("_", " ")}</td>
              <td className="p-2">{compliance.applicableLaw}</td>
            </tr>
          ))}
          {compliances.length === 0 && (
            <tr>
              <td colSpan={4} className="p-4 text-center text-muted-foreground">
                No compliances defined yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
