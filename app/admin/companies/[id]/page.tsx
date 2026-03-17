import prisma from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { redirect } from "next/navigation"

async function runAssignment(companyId: string) {
  "use server"
  await fetch(`/api/assign-compliances/${companyId}`, { method: "POST" })
  redirect(`/admin/companies/${companyId}`)
}

async function toggleAssigned(id: string, companyId: string) {
  "use server"
  await fetch(`/api/compliance/${id}/toggle`, { method: "PATCH" })
  redirect(`/admin/companies/${companyId}`)
}

async function addCompliance(formData: FormData) {
  "use server"
  const companyId = String(formData.get("companyId"))
  const complianceId = String(formData.get("complianceId"))
  await fetch(`/api/company/${companyId}/compliances`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ complianceId }),
  })
  redirect(`/admin/companies/${companyId}`)
}

export default async function CompanyDetailPage({ params }: { params: { id: string } }) {
  const company = await prisma.company.findUnique({ where: { id: params.id } })
  if (!company) return <div className="p-8">Company not found</div>

  const assigned = await prisma.assignedCompliance.findMany({
    where: { companyId: params.id },
    include: {
      compliance: { include: { category: true } },
      tasks: true,
    },
  })

  const compliances = await prisma.compliance.findMany({
    include: { category: true },
    orderBy: { title: "asc" },
  })

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{company.name}</h1>
          <p className="text-sm text-muted-foreground">{company.industry || "Industry N/A"}</p>
        </div>
        <Link href="/admin/companies" className="text-sm text-primary hover:underline">Back</Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="border rounded-lg p-4">
          <h2 className="font-semibold mb-2">Company Info</h2>
          <div className="text-sm space-y-1">
            <div><span className="font-medium">Name:</span> {company.name}</div>
            <div><span className="font-medium">Industry:</span> {company.industry || "—"}</div>
            <div><span className="font-medium">Type:</span> {company.type || "—"}</div>
            <div><span className="font-medium">Employees:</span> {company.employeeCount ?? "—"}</div>
          </div>
        </div>

        <div className="border rounded-lg p-4 space-y-3">
          <h2 className="font-semibold">Actions</h2>
          <form action={() => runAssignment(company.id)}>
            <Button type="submit" className="w-full">Run Compliance Assignment</Button>
          </form>
          <details className="border rounded p-3">
            <summary className="cursor-pointer font-medium">Add Compliance Manually</summary>
            <form action={addCompliance} className="mt-3 space-y-2">
              <input type="hidden" name="companyId" value={company.id} />
              <select name="complianceId" className="w-full rounded border px-3 py-2 text-sm">
                {compliances.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} ({c.category?.name})
                  </option>
                ))}
              </select>
              <Button type="submit" className="w-full" variant="secondary">Add Compliance</Button>
            </form>
          </details>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-xl font-semibold">Compliances</h2>
        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr>
                <th className="px-3 py-2 text-left">Name</th>
                <th className="px-3 py-2 text-left">Category</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Task Due</th>
                <th className="px-3 py-2 text-left">Task Status</th>
                <th className="px-3 py-2 text-left">Toggle</th>
              </tr>
            </thead>
            <tbody>
              {assigned.map((item) => {
                const firstTask = item.tasks[0]
                return (
                  <tr key={item.id} className="border-t">
                    <td className="px-3 py-2 font-medium">{item.compliance.title}</td>
                    <td className="px-3 py-2">{item.compliance.category?.name}</td>
                    <td className="px-3 py-2 capitalize">{item.status}</td>
                    <td className="px-3 py-2">{firstTask?.dueDate ? new Date(firstTask.dueDate).toLocaleDateString() : "—"}</td>
                    <td className="px-3 py-2 capitalize">{firstTask?.status || "—"}</td>
                    <td className="px-3 py-2">
                      <form action={() => toggleAssigned(item.id, company.id)}>
                        <Button type="submit" variant="outline" size="sm">
                          {item.status === "active" ? "Deactivate" : "Activate"}
                        </Button>
                      </form>
                    </td>
                  </tr>
                )
              })}
              {assigned.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-4 text-center text-muted-foreground">
                    No compliances assigned yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
