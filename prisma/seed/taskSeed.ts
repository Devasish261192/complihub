import "dotenv/config"
import { PrismaClient } from "../../app/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!
})

const prisma = new PrismaClient({ adapter })

async function main() {

  const requirement = await prisma.requirement.findFirst()
  const company = await prisma.company.findFirst()

  if (!requirement || !company) {
    console.log("Missing requirement or company")
    return
  }

  await prisma.task.create({
    data: {
      title: "Review firewall rules",
      description: "Ensure firewall rules comply with PCI DSS",
      requirementId: requirement.id,
      companyId: company.id
    }
  })

  console.log("Task created")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())