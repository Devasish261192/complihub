"use server"

import prisma from "@/lib/prisma"
import { getSessionFromCookies } from "@/lib/auth"
import { revalidatePath } from "next/cache"

export async function addTeamMember(formData: FormData) {
  const session = await getSessionFromCookies()
  if (!session || session.role !== "COMPANY_ADMIN") {
    throw new Error("Unauthorized to perform this action.")
  }

  const name = String(formData.get("name") || "").trim()
  const email = String(formData.get("email") || "").toLowerCase().trim()
  const roleName = String(formData.get("role") || "COMPANY_STAFF") // "COMPANY_OFFICER" or "COMPANY_STAFF"
  const department = String(formData.get("department") || "").trim()

  if (!name || !email) {
    throw new Error("Name and Email are required fields.")
  }

  // Find the role in the database
  const role = await prisma.role.findUnique({
    where: { name: roleName }
  })

  if (!role) {
    throw new Error(`Role ${roleName} does not exist.`)
  }

  // Create the new User
  await prisma.user.create({
    data: {
      name,
      email,
      password: "test123", // default password
      roleId: role.id,
      companyId: session.companyId,
      department
    }
  })

  revalidatePath("/settings")
}

export async function removeTeamMember(userId: string) {
  const session = await getSessionFromCookies()
  if (!session || session.role !== "COMPANY_ADMIN") {
    throw new Error("Unauthorized to perform this action.")
  }

  // Ensure the user being deleted belongs to the same company
  const user = await prisma.user.findUnique({
    where: { id: userId }
  })

  if (!user || user.companyId !== session.companyId) {
    throw new Error("User not found or does not belong to your company.")
  }

  // Delete the User
  await prisma.user.delete({
    where: { id: userId }
  })

  revalidatePath("/settings")
}
