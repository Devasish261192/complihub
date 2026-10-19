import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getSessionFromCookies } from "@/lib/auth"

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getSessionFromCookies()
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const assigned = await prisma.assignedCompliance.findUnique({ where: { id: params.id } })
  if (!assigned) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const newStatus = assigned.status === "active" ? "inactive" : "active"

  const updated = await prisma.assignedCompliance.update({
    where: { id: params.id },
    data: { status: newStatus },
  })

  return NextResponse.json(updated)
}
