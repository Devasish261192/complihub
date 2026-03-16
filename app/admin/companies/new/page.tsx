import prisma from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"

function domainFromName(name: string) {
  const cleaned = name
    .split(" ")[0]
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase()
  return cleaned || "company"
}

export default function NewCompanyPage() {
  async function createCompanyAction(formData: FormData) {
    "use server"

    const name = String(formData.get("name") || "").trim()
    const companyType = String(formData.get("companyType") || "").trim() || null
    const cin = String(formData.get("cin") || "").trim() || null
    const pan = String(formData.get("pan") || "").trim() || null
    const gstNumber = String(formData.get("gstNumber") || "").trim() || null
    const state = String(formData.get("state") || "").trim() || null
    const industry = String(formData.get("industry") || "").trim() || null
    const employeeCountRaw = formData.get("employeeCount")
    const incorporationDateRaw = formData.get("incorporationDate")
    const gstRegistered = formData.get("gstRegistered") === "on"

    if (!name) {
      throw new Error("Company name is required")
    }

    const employeeCount =
      typeof employeeCountRaw === "string" && employeeCountRaw.length > 0
        ? Number(employeeCountRaw)
        : null

    const incorporationDate =
      typeof incorporationDateRaw === "string" && incorporationDateRaw.length > 0
        ? new Date(incorporationDateRaw)
        : null

    const company = await prisma.company.create({
      data: {
        name,
        companyType,
        cin,
        pan,
        gstNumber,
        state,
        industry,
        employeeCount,
        incorporationDate,
        gstRegistered,
      },
    })

    const companyAdminRole =
      (await prisma.role.findFirst({ where: { name: "COMPANY_ADMIN" } })) ||
      (await prisma.role.create({ data: { name: "COMPANY_ADMIN" } }))

    const domain = domainFromName(name)
    const email = `admin@${domain}.com`

    await prisma.user.upsert({
      where: { email },
      update: {
        roleId: companyAdminRole.id,
        companyId: company.id,
        password: "temp123",
      },
      create: {
        email,
        name: `${name} Admin`,
        password: "temp123",
        roleId: companyAdminRole.id,
        companyId: company.id,
      },
    })

    redirect("/admin/companies")
  }

  return (
    <div className="mx-auto max-w-3xl p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Add Company</h1>
        <p className="text-muted-foreground">
          Create a new company and a default company admin user.
        </p>
      </div>

      <form action={createCompanyAction} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Company Name</label>
            <input
              name="name"
              required
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Company Type</label>
            <input
              name="companyType"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">CIN</label>
            <input
              name="cin"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">PAN</label>
            <input
              name="pan"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">GST Number</label>
            <input
              name="gstNumber"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">State</label>
            <input
              name="state"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Industry</label>
            <input
              name="industry"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Employee Count</label>
            <input
              name="employeeCount"
              type="number"
              min="0"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Date of Incorporation</label>
            <input
              name="incorporationDate"
              type="date"
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="gstRegistered"
              name="gstRegistered"
              type="checkbox"
              className="h-4 w-4 rounded border border-input text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <label htmlFor="gstRegistered" className="text-sm font-medium">
              GST Registered
            </label>
          </div>
        </div>

        <Button type="submit" size="lg">
          Create Company
        </Button>
      </form>
    </div>
  )
}
