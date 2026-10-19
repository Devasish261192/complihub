import "dotenv/config"
import { PrismaClient } from "../../app/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})

const prisma = new PrismaClient({ adapter })

async function main() {
  // Clear existing data to avoid duplicates if we run seed multiple times without reset
  await prisma.task.deleteMany()
  await prisma.assignedCompliance.deleteMany()
  await prisma.complianceRule.deleteMany()
  await prisma.compliance.deleteMany()
  await prisma.complianceCategory.deleteMany()
  await prisma.user.deleteMany()
  await prisma.company.deleteMany()
  await prisma.role.deleteMany()

  // Roles
  const adminRole = await prisma.role.create({ data: { name: "ADMIN" } })
  const companyAdminRole = await prisma.role.create({ data: { name: "COMPANY_ADMIN" } })

  // Base company
  const company = await prisma.company.create({
    data: {
      name: "ABC Pvt Ltd",
      industry: "IT Services",
      type: "Pvt Ltd",
      employeeCount: 150,
      turnover: 50000000,
      state: "Maharashtra",
    },
  })

  // Admin users
  await prisma.user.create({
    data: {
      email: "admin@portal.com",
      name: "Admin 1",
      password: "admin123",
      roleId: adminRole.id,
      companyId: null,
    },
  })

  await prisma.user.create({
    data: {
      email: "uncle@portal.com",
      name: "Admin 2",
      password: "admin123",
      roleId: adminRole.id,
      companyId: null,
    },
  })

  // Company admin
  await prisma.user.create({
    data: {
      email: "admin@abc.com",
      name: "ABC Admin",
      password: "test123",
      roleId: companyAdminRole.id,
      companyId: company.id,
    },
  })

  // Compliance categories
  const taxCategory = await prisma.complianceCategory.create({ data: { name: "Tax" } })
  const labourCategory = await prisma.complianceCategory.create({ data: { name: "Labour" } })
  const corporateCategory = await prisma.complianceCategory.create({ data: { name: "Corporate" } })

  // Sample compliances
  const gstReturn = await prisma.compliance.create({
    data: {
      title: "GST Return Filing",
      description: "Monthly GST return filing (GSTR-3B / GSTR-1)",
      categoryId: taxCategory.id,
      frequency: "monthly",
      applicableLaw: "GST",
    },
  })

  await prisma.complianceRule.create({
    data: {
      complianceId: gstReturn.id,
      condition: { turnover: ">0" },
    },
  })

  const epf = await prisma.compliance.create({
    data: {
      title: "EPF Contribution Filing",
      description: "Monthly EPF challan filing",
      categoryId: labourCategory.id,
      frequency: "monthly",
      applicableLaw: "EPF",
    },
  })

  await prisma.complianceRule.create({
    data: {
      complianceId: epf.id,
      condition: { employeeCount: ">=20" },
    },
  })

  const esi = await prisma.compliance.create({
    data: {
      title: "ESI Contribution Filing",
      description: "Monthly ESI return",
      categoryId: labourCategory.id,
      frequency: "monthly",
      applicableLaw: "ESI",
    },
  })

  await prisma.complianceRule.create({
    data: {
      complianceId: esi.id,
      condition: { employeeCount: ">=10" },
    },
  })

  const roc = await prisma.compliance.create({
    data: {
      title: "Annual ROC Filing",
      description: "Companies Act annual return filing",
      categoryId: corporateCategory.id,
      frequency: "yearly",
      applicableLaw: "Companies Act",
    },
  })

  await prisma.complianceRule.create({
    data: {
      complianceId: roc.id,
      condition: { type: "any" },
    },
  })

  // --- New MCA Compliances ---

  const aoc4 = await prisma.compliance.create({
    data: {
      title: "Form AOC-4",
      description: "Filing of Financial Statements with MCA",
      categoryId: corporateCategory.id,
      frequency: "yearly",
      applicableLaw: "Companies Act",
    },
  })

  await prisma.complianceRule.create({
    data: {
      complianceId: aoc4.id,
      condition: { type: "any" },
    },
  })

  const mgt7 = await prisma.compliance.create({
    data: {
      title: "Form MGT-7",
      description: "Filing of Annual Return with MCA",
      categoryId: corporateCategory.id,
      frequency: "yearly",
      applicableLaw: "Companies Act",
    },
  })

  await prisma.complianceRule.create({
    data: {
      complianceId: mgt7.id,
      condition: { type: "any" },
    },
  })

  const dir3 = await prisma.compliance.create({
    data: {
      title: "Form DIR-3 KYC",
      description: "Annual KYC of Directors",
      categoryId: corporateCategory.id,
      frequency: "yearly",
      applicableLaw: "Companies Act",
    },
  })

  await prisma.complianceRule.create({
    data: {
      complianceId: dir3.id,
      condition: { type: "any" },
    },
  })

  const dpt3 = await prisma.compliance.create({
    data: {
      title: "Form DPT-3",
      description: "Return of deposits and particulars of transactions not considered as deposits",
      categoryId: corporateCategory.id,
      frequency: "yearly",
      applicableLaw: "Companies Act",
    },
  })

  await prisma.complianceRule.create({
    data: {
      complianceId: dpt3.id,
      condition: { type: "any" },
    },
  })

  const adt1 = await prisma.compliance.create({
    data: {
      title: "Form ADT-1",
      description: "Notice to the Registrar by company for appointment of auditor",
      categoryId: corporateCategory.id,
      frequency: "yearly",
      applicableLaw: "Companies Act",
    },
  })

  await prisma.complianceRule.create({
    data: {
      complianceId: adt1.id,
      condition: { type: "any" },
    },
  })

  const mbp1 = await prisma.compliance.create({
    data: {
      title: "Form MBP-1",
      description: "Notice of interest by director",
      categoryId: corporateCategory.id,
      frequency: "yearly",
      applicableLaw: "Companies Act",
    },
  })

  await prisma.complianceRule.create({
    data: {
      complianceId: mbp1.id,
      condition: { type: "any" },
    },
  })

  console.log("Seed data inserted")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
