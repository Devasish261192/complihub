import Link from "next/link"
import prisma from "@/lib/prisma"
import { Button } from "@/components/ui/button"

export default async function AdminCompaniesPage() {
  const companies = await prisma.company.findMany({
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="p-8 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Companies</h1>
          <p className="text-sm text-muted-foreground">Manage companies in the system.</p>
        </div>
        <Button asChild size="lg">
          <Link href="/admin/companies/new">Create Company</Link>
        </Button>
      </div>

      <div className="overflow-x-auto border rounded-lg bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2 text-left">Industry</th>
              <th className="px-3 py-2 text-left">Type</th>
              <th className="px-3 py-2 text-left">Employees</th>
              <th className="px-3 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => (
              <tr key={company.id} className="border-t">
                <td className="px-3 py-2 font-medium">{company.name}</td>
                <td className="px-3 py-2">{company.industry || "—"}</td>
                <td className="px-3 py-2">{company.type || "—"}</td>
                <td className="px-3 py-2">{company.employeeCount ?? "—"}</td>
                <td className="px-3 py-2">
                  <Link href={`/admin/companies/${company.id}`} className="text-primary hover:underline">
                    View
                  </Link>
                </td>
              </tr>
            ))}
            {companies.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-4 text-center text-muted-foreground">
                  No companies yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
