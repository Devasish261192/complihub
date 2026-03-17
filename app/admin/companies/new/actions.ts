'use server'

import { revalidatePath } from "next/cache"

export async function createCompanyAction(formData: FormData) {
  const payload = {
    name: String(formData.get("name") || "").trim(),
    type: String(formData.get("type") || "").trim() || null,
    industry: String(formData.get("industry") || "").trim() || null,
    employeeCount: formData.get("employeeCount") ? Number(formData.get("employeeCount")) : null,
    turnover: formData.get("turnover") ? Number(formData.get("turnover")) : null,
    state: String(formData.get("state") || "").trim() || null,
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || ""}/api/company`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || "Failed to create company")
  }

  revalidatePath("/admin/companies")
}
