import { Button } from "@/components/ui/button"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

async function baseFetchOptions(body: string) {
  const cookieStore = await cookies()
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${encodeURIComponent(c.value)}`)
    .join("; ")

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL || "http://localhost:3000"
  const target = baseUrl.startsWith("http") ? baseUrl : `https://${baseUrl}`
  const url = `${target.replace(/\/$/, "")}`

  return {
    url,
    headers: { "Content-Type": "application/json", Cookie: cookieHeader },
    body,
  }
}

async function uploadComplianceAction(formData: FormData) {
  "use server"
  const file = formData.get("file") as File | null
  if (!file) throw new Error("No file")
  const text = await file.text()

  const { url, headers, body } = await baseFetchOptions(text)

  const res = await fetch(`${url}/api/admin/upload-compliance-json`, {
    method: "POST",
    headers,
    body,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || "Upload failed")
  }

  redirect("/admin/upload?success=1")
}

async function uploadCompaniesAction(formData: FormData) {
  "use server"
  const file = formData.get("file") as File | null
  if (!file) throw new Error("No file")
  const text = await file.text()

  const { url, headers, body } = await baseFetchOptions(text)

  const res = await fetch(`${url}/api/admin/upload-companies`, {
    method: "POST",
    headers,
    body,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || "Upload companies failed")
  }

  redirect("/admin/upload?success=companies")
}

export default async function UploadPage({ searchParams }: { searchParams: Promise<{ success?: string }> }) {
  const params = await searchParams
  const success = params?.success

  return (
    <div className="mx-auto max-w-xl p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Upload JSON</h1>
        <p className="text-sm text-muted-foreground">Bulk import compliances or companies.</p>
      </div>

      {success === "1" && (
        <div className="rounded border border-green-600/30 bg-green-50 px-4 py-3 text-sm text-green-800">
          Compliance upload successful.
        </div>
      )}
      {success === "companies" && (
        <div className="rounded border border-blue-600/30 bg-blue-50 px-4 py-3 text-sm text-blue-800">
          Companies upload successful.
        </div>
      )}

      <div className="space-y-4 rounded border p-4">
        <h2 className="text-lg font-semibold">Upload Compliances JSON</h2>
        <p className="text-sm text-muted-foreground">Expected key: compliances[]</p>
        <form action={uploadComplianceAction} className="space-y-3">
          <input type="file" name="file" accept="application/json" className="w-full" required />
          <Button type="submit" size="lg">Upload Compliances</Button>
        </form>
      </div>

      <div className="space-y-4 rounded border p-4">
        <h2 className="text-lg font-semibold">Upload Companies JSON</h2>
        <p className="text-sm text-muted-foreground">Expected key: companies[] with fields name, type, industry, employeeCount, turnover, state</p>
        <form action={uploadCompaniesAction} className="space-y-3">
          <input type="file" name="file" accept="application/json" className="w-full" required />
          <Button type="submit" size="lg" variant="secondary">Upload Companies</Button>
        </form>
      </div>
    </div>
  )
}
