import { Button } from "@/components/ui/button"
import { createCompanyAction } from "./actions"
import { redirect } from "next/navigation"

async function action(formData: FormData) {
  "use server"
  await createCompanyAction(formData)
  redirect("/admin/companies")
}

export default function NewCompanyPage() {
  return (
    <div className="mx-auto max-w-2xl p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Create Company</h1>
        <p className="text-sm text-muted-foreground">Add a new company to the system.</p>
      </div>

      <form action={action} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium">Company Name</label>
            <input name="name" required className="w-full rounded border px-3 py-2 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Type</label>
            <input name="type" className="w-full rounded border px-3 py-2 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Industry</label>
            <input name="industry" className="w-full rounded border px-3 py-2 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Employee Count</label>
            <input name="employeeCount" type="number" min="0" className="w-full rounded border px-3 py-2 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Turnover</label>
            <input name="turnover" type="number" min="0" className="w-full rounded border px-3 py-2 text-sm" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">State</label>
            <input name="state" className="w-full rounded border px-3 py-2 text-sm" />
          </div>
        </div>
        <Button type="submit" size="lg">Create Company</Button>
      </form>
    </div>
  )
}
