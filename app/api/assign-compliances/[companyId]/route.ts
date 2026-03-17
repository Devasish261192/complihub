import { NextResponse } from "next/server"
import { assignCompliances } from "@/lib/complianceEngine"
import { getSessionFromCookies } from "@/lib/auth"

export async function POST(_request: Request, { params }: { params: { companyId: string } }) {
  const session = await getSessionFromCookies()
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  try {
    const assignments = await assignCompliances(params.companyId)
    return NextResponse.json({ assignedIds: assignments }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? "Failed" }, { status: 400 })
  }
}
