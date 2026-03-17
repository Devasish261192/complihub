-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Frequency" AS ENUM ('monthly', 'quarterly', 'yearly', 'event_based');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('pending', 'completed');

-- CreateEnum
CREATE TYPE "AssignedStatus" AS ENUM ('active', 'inactive');

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "industry" TEXT,
    "type" TEXT,
    "employeeCount" INTEGER,
    "turnover" DECIMAL(18,2),
    "state" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "companyId" TEXT,
    "roleId" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplianceCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ComplianceCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Compliance" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "categoryId" TEXT NOT NULL,
    "frequency" "Frequency" NOT NULL,
    "applicableLaw" TEXT NOT NULL,

    CONSTRAINT "Compliance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplianceRule" (
    "id" TEXT NOT NULL,
    "complianceId" TEXT NOT NULL,
    "condition" JSONB NOT NULL,

    CONSTRAINT "ComplianceRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssignedCompliance" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "complianceId" TEXT NOT NULL,
    "status" "AssignedStatus" NOT NULL DEFAULT 'active',
    "isManualOverride" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssignedCompliance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "assignedComplianceId" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3),
    "status" "TaskStatus" NOT NULL DEFAULT 'pending',
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ComplianceCategory_name_key" ON "ComplianceCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ComplianceRule_complianceId_key" ON "ComplianceRule"("complianceId");

-- CreateIndex
CREATE UNIQUE INDEX "AssignedCompliance_companyId_complianceId_key" ON "AssignedCompliance"("companyId", "complianceId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Compliance" ADD CONSTRAINT "Compliance_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ComplianceCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceRule" ADD CONSTRAINT "ComplianceRule_complianceId_fkey" FOREIGN KEY ("complianceId") REFERENCES "Compliance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignedCompliance" ADD CONSTRAINT "AssignedCompliance_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssignedCompliance" ADD CONSTRAINT "AssignedCompliance_complianceId_fkey" FOREIGN KEY ("complianceId") REFERENCES "Compliance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_assignedComplianceId_fkey" FOREIGN KEY ("assignedComplianceId") REFERENCES "AssignedCompliance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
