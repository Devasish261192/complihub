import prisma from "@/lib/prisma"

export default async function ComplianceDetailPage({ params }: { params: { id: string } }) {

  const compliance = await prisma.compliance.findUnique({
    where: { id: params.id },
    include: {
      category: true,
      rules: true,
    },
  })

  if (!compliance) {
    return <div className="p-8">Compliance not found</div>
  }

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-3xl font-bold">{compliance.title}</h1>
      <p className="text-muted-foreground">{compliance.description}</p>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="border rounded-lg p-4">
          <h2 className="font-semibold">Category</h2>
          <p className="text-sm text-muted-foreground">{compliance.category?.name}</p>
        </div>

        <div className="border rounded-lg p-4">
          <h2 className="font-semibold">Frequency</h2>
          <p className="text-sm text-muted-foreground capitalize">{compliance.frequency.replace("_", " ")}</p>
        </div>

        <div className="border rounded-lg p-4">
          <h2 className="font-semibold">Applicable Law</h2>
          <p className="text-sm text-muted-foreground">{compliance.applicableLaw}</p>
        </div>
      </div>

      <div className="border rounded-lg p-4">
        <h2 className="font-semibold mb-2">Rules</h2>
        {compliance.rules.length === 0 && (
          <p className="text-sm text-muted-foreground">No rules defined.</p>
        )}
        {compliance.rules.map((rule) => (
          <pre key={rule.id} className="bg-muted/40 p-3 rounded text-xs overflow-x-auto">
            {JSON.stringify(rule.condition, null, 2)}
          </pre>
        ))}
      </div>
    </div>
  )
}
