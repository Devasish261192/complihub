import "dotenv/config"

import { PrismaClient } from "../../app/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!
})

const prisma = new PrismaClient({
  adapter
})

async function main() {

  // roles
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

  // company
  const company =
    (await prisma.company.findFirst({ where: { name: "ABC Pvt Ltd" } })) ||
    (await prisma.company.create({
      data: { name: "ABC Pvt Ltd" },
    }))

  // admin users
  await prisma.user.upsert({
    where: { email: "admin@portal.com" },
    update: {
      password: "admin123",
      roleId: adminRole.id,
    },
    create: {
      email: "admin@portal.com",
      name: "Admin 1",
      password: "admin123",
      roleId: adminRole.id,
      companyId: company.id,
    },
  })

  await prisma.user.upsert({
    where: { email: "uncle@portal.com" },
    update: {
      password: "admin123",
      roleId: adminRole.id,
    },
    create: {
      email: "uncle@portal.com",
      name: "Admin 2",
      password: "admin123",
      roleId: adminRole.id,
      companyId: company.id,
    },
  })

  // company admin user
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

  const pci =
    (await prisma.framework.findFirst({ where: { name: "PCI DSS" } })) ||
    (await prisma.framework.create({
      data: {
        name: "PCI DSS",
        description: "Payment Card Industry Data Security Standard",
      },
    }))

  const firewallControl =
    (await prisma.control.findFirst({
      where: { name: "Firewall Configuration", frameworkId: pci.id },
    })) ||
    (await prisma.control.create({
      data: {
        name: "Firewall Configuration",
        description: "Install and maintain firewall configuration",
        frameworkId: pci.id,
      },
    }))

  const requirement =
    (await prisma.requirement.findFirst({
      where: {
        controlId: firewallControl.id,
        description: "Maintain firewall rules and review monthly",
      },
    })) ||
    (await prisma.requirement.create({
      data: {
        description: "Maintain firewall rules and review monthly",
        controlId: firewallControl.id,
      },
    }))

  console.log("Seed data inserted")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
