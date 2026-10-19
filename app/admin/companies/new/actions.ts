"use server"

import prisma from "@/lib/prisma"
import { getSessionFromCookies } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function createCompanyAction(formData: FormData) {
  const session = await getSessionFromCookies()
  if (session?.role !== "ADMIN") {
    throw new Error("Unauthorized")
  }

  const payload = {
    name: String(formData.get("name") || "").trim(),
    type: String(formData.get("type") || "").trim() || null,
    industry: String(formData.get("industry") || "").trim() || null,
    employeeCount: formData.get("employeeCount") ? Number(formData.get("employeeCount")) : null,
    turnover: formData.get("turnover") ? Number(formData.get("turnover")) : null,
    state: String(formData.get("state") || "").trim() || null,
  }

  if (!payload.name) {
    throw new Error("Company name is required")
  }

  await prisma.company.create({ data: payload })

  revalidatePath("/admin/companies")
}
