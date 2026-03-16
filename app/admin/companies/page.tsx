import prisma from "@/lib/prisma"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function AdminCompaniesPage() {
  const companies = await prisma.company.findMany({
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Companies</h1>
          <p className="text-muted-foreground">
            Manage all registered companies.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/admin/companies/new">
            Add Company
          </Link>
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
        <table className="w-full min-w-[800px] text-sm">
          <thead className="bg-muted/40 text-left">
            <tr>
              <th className="px-4 py-3 font-semibold">Company Name</th>
              <th className="px-4 py-3 font-semibold">Company Type</th>
              <th className="px-4 py-3 font-semibold">GST Number</th>
              <th className="px-4 py-3 font-semibold">Employees</th>
              <th className="px-4 py-3 font-semibold">Created Date</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => (
              <tr key={company.id} className="border-t">
                <td className="px-4 py-3">{company.name}</td>
                <td className="px-4 py-3">{company.companyType || "—"}</td>
                <td className="px-4 py-3">{company.gstNumber || "—"}</td>
                <td className="px-4 py-3">{company.employeeCount ?? "—"}</td>
                <td className="px-4 py-3">
                  {company.createdAt
                    ? new Date(company.createdAt).toLocaleDateString(undefined, {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">View</Button>
                    <Button variant="outline" size="sm">Edit</Button>
                    <Button variant="destructive" size="sm">Delete</Button>
                  </div>
                </td>
              </tr>
            ))}
            {companies.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">
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
