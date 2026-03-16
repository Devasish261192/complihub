import "dotenv/config"
import { PrismaClient } from "../../app/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!
})

const prisma = new PrismaClient({ adapter })

async function main() {

  await prisma.company.create({
    data: {
      name: "ABC Pvt Ltd"
    }
  })

  console.log("Company created")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())