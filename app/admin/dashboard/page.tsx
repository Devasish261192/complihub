import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AdminDashboardPage() {
  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Quick links to manage companies and compliance data.
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/admin/companies">Companies</Link>
          </Button>
          <Button variant="secondary" asChild>
            <Link href="/admin/upload">Upload JSON</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="border rounded-lg p-4">
          <h2 className="font-semibold">Companies</h2>
          <p className="text-sm text-muted-foreground">Create and manage company records.</p>
          <div className="mt-3 flex gap-2">
            <Button size="sm" asChild>
              <Link href="/admin/companies">View Companies</Link>
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href="/admin/companies/new">Create Company</Link>
            </Button>
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <h2 className="font-semibold">Compliance Library</h2>
          <p className="text-sm text-muted-foreground">Bulk import compliances via JSON upload.</p>
          <div className="mt-3 flex gap-2">
            <Button size="sm" asChild>
              <Link href="/admin/upload">Upload JSON</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
