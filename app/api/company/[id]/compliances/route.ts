import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getSessionFromCookies } from "@/lib/auth"

function nextDueDate(frequency: string) {
  const now = new Date()
  switch (frequency) {
    case "monthly":
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    case "quarterly":
      return new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)
    case "yearly":
      return new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)
    default:
      return null
  }
}

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const session = await getSessionFromCookies()
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (session.role !== "ADMIN" && session.companyId !== params.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const assigned = await prisma.assignedCompliance.findMany({
    where: { companyId: params.id },
    include: {
      compliance: true,
      tasks: true,
    },
  })

  return NextResponse.json(assigned)
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getSessionFromCookies()
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const body = await request.json()
  const complianceId = body.complianceId as string

  const compliance = await prisma.compliance.findUnique({ where: { id: complianceId } })
  if (!compliance) return NextResponse.json({ error: "Compliance not found" }, { status: 404 })

  const assignment = await prisma.assignedCompliance.upsert({
    where: {
      companyId_complianceId: {
        companyId: params.id,
        complianceId,
      },
    },
    update: {
      status: "active",
      isManualOverride: true,
    },
    create: {
      companyId: params.id,
      complianceId,
      status: "active",
      isManualOverride: true,
    },
  })

  const existingTask = await prisma.task.findFirst({ where: { assignedComplianceId: assignment.id } })
  if (!existingTask) {
    await prisma.task.create({
      data: {
        assignedComplianceId: assignment.id,
        dueDate: nextDueDate(compliance.frequency),
        status: "pending",
        remarks: "Manually assigned",
      },
    })
  }

  return NextResponse.json(assignment, { status: 201 })
}
