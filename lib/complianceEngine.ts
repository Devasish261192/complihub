import prisma from "@/lib/prisma"
import { Compliance, ComplianceRule, Company, Frequency } from "@/app/generated/prisma/client"

function parseNumericCondition(value: string, actual: number | null | undefined) {
  if (actual === null || actual === undefined) return false
  const match = value.match(/([><]=?)([-+]?[0-9]*\.?[0-9]+)/)
  if (!match) return false
  const operator = match[1]
  const threshold = Number(match[2])

  switch (operator) {
    case ">":
      return actual > threshold
    case ">=":
      return actual >= threshold
    case "<":
      return actual < threshold
    case "<=":
      return actual <= threshold
    default:
      return false
  }
}

function ruleMatches(company: Company, rule: ComplianceRule) {
  const condition = rule.condition as Record<string, any>
  for (const key of Object.keys(condition)) {
    const expected = condition[key]
    switch (key) {
      case "employeeCount":
        if (typeof expected === "string") {
          if (!parseNumericCondition(expected, company.employeeCount ?? undefined)) return false
        }
        break
      case "turnover":
        if (typeof expected === "string") {
          const numeric = company.turnover ? Number(company.turnover) : undefined
          if (!parseNumericCondition(expected, numeric)) return false
        }
        break
      case "industry":
        if (expected !== "any" && company.industry?.toLowerCase() !== String(expected).toLowerCase()) return false
        break
      case "state":
        if (expected !== "any" && company.state?.toLowerCase() !== String(expected).toLowerCase()) return false
        break
      default:
        break
    }
  }
  return true
}

function nextDueDate(frequency: Frequency) {
  const now = new Date()
  switch (frequency) {
    case "monthly":
      return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    case "quarterly":
      return new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)
    case "yearly":
      return new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)
    case "event_based":
    default:
      return null
  }
}

export async function assignCompliances(companyId: string) {
  const company = await prisma.company.findUnique({ where: { id: companyId } })
  if (!company) throw new Error("Company not found")

  const compliances = await prisma.compliance.findMany({ include: { rules: true } })

  const assignments = [] as string[]

  for (const compliance of compliances) {
    const rules = compliance.rules
    const match = rules.length === 0 || rules.every((r) => ruleMatches(company, r))
    if (!match) continue

    const assigned = await prisma.assignedCompliance.upsert({
      where: {
        companyId_complianceId: {
          companyId: company.id,
          complianceId: compliance.id,
        },
      },
      update: { status: "active" },
      create: {
        companyId: company.id,
        complianceId: compliance.id,
        status: "active",
        isManualOverride: false,
      },
    })

    assignments.push(assigned.id)

    const existingTask = await prisma.task.findFirst({
      where: { assignedComplianceId: assigned.id },
    })

    if (!existingTask) {
      await prisma.task.create({
        data: {
          assignedComplianceId: assigned.id,
          dueDate: nextDueDate(compliance.frequency),
          status: "pending",
          remarks: `Auto-generated for ${compliance.title}`,
        },
      })
    }
  }

  return assignments
}
