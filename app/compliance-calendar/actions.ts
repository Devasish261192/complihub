"use server"

import prisma from "@/lib/prisma"
import { TaskStatus } from "@/app/generated/prisma/client"
import { revalidatePath } from "next/cache"

export async function toggleTaskStatus(taskId: string, currentStatus: TaskStatus) {
  const newStatus = currentStatus === TaskStatus.pending ? TaskStatus.completed : TaskStatus.pending
  const completedAt = newStatus === TaskStatus.completed ? new Date() : null
  const remarks = newStatus === TaskStatus.completed 
    ? "Completed via Calendar Portal" 
    : "Reopened via Calendar Portal"

  await prisma.task.update({
    where: { id: taskId },
    data: {
      status: newStatus,
      completedAt,
      remarks
    }
  })

  revalidatePath("/compliance-calendar")
  revalidatePath("/dashboard")
  revalidatePath("/tasks")
}

export async function reassignTask(taskId: string, assigneeId: string) {
  // Fetch the user to get their details
  const user = await prisma.user.findUnique({
    where: { id: assigneeId },
    include: { role: true }
  })

  if (!user) {
    throw new Error("User not found")
  }

  const roleLabel = user.role.name === "COMPANY_ADMIN"
    ? "Company Admin"
    : user.role.name === "COMPANY_OFFICER"
    ? "Compliance Officer"
    : "Staff/Assignee"

  await prisma.task.update({
    where: { id: taskId },
    data: {
      assigneeId,
      assigneeName: user.name,
      assigneeRole: roleLabel,
      department: user.department
    }
  })

  revalidatePath("/compliance-calendar")
  revalidatePath("/dashboard")
  revalidatePath("/tasks")
}
