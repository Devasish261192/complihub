import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getSessionFromCookies } from "@/lib/auth"

export async function POST(request: Request) {
  const session = await getSessionFromCookies()
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json()

  const company = await prisma.company.create({
    data: {
      name: body.name,
      industry: body.industry ?? null,
      type: body.type ?? null,
      employeeCount: body.employeeCount ?? null,
      turnover: body.turnover ?? null,
      state: body.state ?? null,
    },
  })

  return NextResponse.json(company, { status: 201 })
}
