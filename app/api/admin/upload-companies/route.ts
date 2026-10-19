import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getSessionFromCookies } from "@/lib/auth"

export async function POST(request: Request) {
  const session = await getSessionFromCookies()
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json()
  const companies = body.companies as any[]

  if (!Array.isArray(companies)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  const created: string[] = []
  const updated: string[] = []

  for (const item of companies) {
    if (!item?.name) continue

    const existing = await prisma.company.findFirst({ where: { name: item.name } })

    if (existing) {
      const updatedCompany = await prisma.company.update({
        where: { id: existing.id },
        data: {
          type: item.type ?? existing.type,
          industry: item.industry ?? existing.industry,
          employeeCount: item.employeeCount ?? existing.employeeCount,
          turnover: item.turnover ?? existing.turnover,
          state: item.state ?? existing.state,
        },
      })
      updated.push(updatedCompany.id)
    } else {
      const newCompany = await prisma.company.create({
        data: {
          name: item.name,
          type: item.type ?? null,
          industry: item.industry ?? null,
          employeeCount: item.employeeCount ?? null,
          turnover: item.turnover ?? null,
          state: item.state ?? null,
        },
      })
      created.push(newCompany.id)
    }
  }

  return NextResponse.json({ created, updated })
}
