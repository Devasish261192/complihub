import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"

async function uploadAction(formData: FormData) {
  "use server"
  const file = formData.get("file") as File | null
  if (!file) throw new Error("No file")
  const text = await file.text()

  const res = await fetch(`/api/admin/upload-compliance-json`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: text,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || "Upload failed")
  }

  redirect("/admin/upload?success=1")
}

export default function UploadPage({ searchParams }: { searchParams?: { success?: string } }) {
  const success = searchParams?.success

  return (
    <div className="mx-auto max-w-xl p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Upload Compliance JSON</h1>
        <p className="text-sm text-muted-foreground">Bulk import compliances and rules.</p>
      </div>

      {success && (
        <div className="rounded border border-green-600/30 bg-green-50 px-4 py-3 text-sm text-green-800">
          Upload successful.
        </div>
      )}

      <form action={uploadAction} className="space-y-4" encType="multipart/form-data">
        <input type="file" name="file" accept="application/json" className="w-full" required />
        <Button type="submit" size="lg">Upload</Button>
      </form>
    </div>
  )
}
