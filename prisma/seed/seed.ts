import "dotenv/config"
import { PrismaClient } from "../../app/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})

const prisma = new PrismaClient({ adapter })

async function main() {
  // Roles
  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: { name: "ADMIN" },
  })

  const companyAdminRole = await prisma.role.upsert({
    where: { name: "COMPANY_ADMIN" },
    update: {},
    create: { name: "COMPANY_ADMIN" },
  })

  // Base company
  const company = await prisma.company.upsert({
    where: { name: "ABC Pvt Ltd" },
    update: {},
    create: {
      name: "ABC Pvt Ltd",
      industry: "IT Services",
      type: "Pvt Ltd",
      employeeCount: 150,
      turnover: 50000000,
      state: "Maharashtra",
    },
  })

  // Admin users
  await prisma.user.upsert({
    where: { email: "admin@portal.com" },
    update: {
      password: "admin123",
      roleId: adminRole.id,
      companyId: null,
    },
    create: {
      email: "admin@portal.com",
      name: "Admin 1",
      password: "admin123",
      roleId: adminRole.id,
      companyId: null,
    },
  })

  await prisma.user.upsert({
    where: { email: "uncle@portal.com" },
    update: {
      password: "admin123",
      roleId: adminRole.id,
      companyId: null,
    },
    create: {
      email: "uncle@portal.com",
      name: "Admin 2",
      password: "admin123",
      roleId: adminRole.id,
      companyId: null,
    },
  })

  // Company admin
  await prisma.user.upsert({
    where: { email: "admin@abc.com" },
    update: {
      password: "test123",
      roleId: companyAdminRole.id,
      companyId: company.id,
    },
    create: {
      email: "admin@abc.com",
      name: "ABC Admin",
      password: "test123",
      roleId: companyAdminRole.id,
      companyId: company.id,
    },
  })

  // Compliance categories
  const taxCategory = await prisma.complianceCategory.upsert({
    where: { name: "Tax" },
    update: {},
    create: { name: "Tax" },
  })
  const labourCategory = await prisma.complianceCategory.upsert({
    where: { name: "Labour" },
    update: {},
    create: { name: "Labour" },
  })
  const corporateCategory = await prisma.complianceCategory.upsert({
    where: { name: "Corporate" },
    update: {},
    create: { name: "Corporate" },
  })

  // Sample compliances
  const gstReturn = await prisma.compliance.upsert({
    where: { title: "GST Return Filing" },
    update: {},
    create: {
      title: "GST Return Filing",
      description: "Monthly GST return filing (GSTR-3B / GSTR-1)",
      categoryId: taxCategory.id,
      frequency: "monthly",
      applicableLaw: "GST",
    },
  })

  await prisma.complianceRule.upsert({
    where: { complianceId: gstReturn.id },
    update: {},
    create: {
      complianceId: gstReturn.id,
      condition: { turnover: ">0" },
    },
  })

  const epf = await prisma.compliance.upsert({
    where: { title: "EPF Contribution Filing" },
    update: {},
    create: {
      title: "EPF Contribution Filing",
      description: "Monthly EPF challan filing",
      categoryId: labourCategory.id,
      frequency: "monthly",
      applicableLaw: "EPF",
    },
  })

  await prisma.complianceRule.upsert({
    where: { complianceId: epf.id },
    update: {},
    create: {
      complianceId: epf.id,
      condition: { employeeCount: ">=20" },
    },
  })

  const esi = await prisma.compliance.upsert({
    where: { title: "ESI Contribution Filing" },
    update: {},
    create: {
      title: "ESI Contribution Filing",
      description: "Monthly ESI return",
      categoryId: labourCategory.id,
      frequency: "monthly",
      applicableLaw: "ESI",
    },
  })

  await prisma.complianceRule.upsert({
    where: { complianceId: esi.id },
    update: {},
    create: {
      complianceId: esi.id,
      condition: { employeeCount: ">=10" },
    },
  })

  const roc = await prisma.compliance.upsert({
    where: { title: "Annual ROC Filing" },
    update: {},
    create: {
      title: "Annual ROC Filing",
      description: "Companies Act annual return filing",
      categoryId: corporateCategory.id,
      frequency: "yearly",
      applicableLaw: "Companies Act",
    },
  })

  await prisma.complianceRule.upsert({
    where: { complianceId: roc.id },
    update: {},
    create: {
      complianceId: roc.id,
      condition: { type: "any" },
    },
  })

  console.log("Seed data inserted")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
