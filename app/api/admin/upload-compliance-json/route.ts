import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getSessionFromCookies } from "@/lib/auth"

function normalizeFrequency(value: string) {
  return value?.toLowerCase().replace(/-/g, "_")
}

export async function POST(request: Request) {
  const session = await getSessionFromCookies()
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json()
  const compliances = body.compliances as any[]

  if (!Array.isArray(compliances)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
  }

  const created: string[] = []

  for (const item of compliances) {
    const category = await prisma.complianceCategory.upsert({
      where: { name: item.category },
      update: {},
      create: { name: item.category },
    })

    const frequency = normalizeFrequency(item.frequency) as any

    const compliance = await prisma.compliance.upsert({
      where: { title: item.title },
      update: {
        description: item.description ?? null,
        frequency: frequency,
        applicableLaw: item.applicableLaw ?? item.category,
        categoryId: category.id,
      },
      create: {
        title: item.title,
        description: item.description ?? null,
        frequency: frequency,
        applicableLaw: item.applicableLaw ?? item.category,
        categoryId: category.id,
      },
    })

    await prisma.complianceRule.upsert({
      where: { complianceId: compliance.id },
      update: { condition: item.rules || {} },
      create: {
        complianceId: compliance.id,
        condition: item.rules || {},
      },
    })

    created.push(compliance.id)
  }

  return NextResponse.json({ created })
}
