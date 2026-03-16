-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "cin" TEXT,
ADD COLUMN     "companyType" TEXT,
ADD COLUMN     "employeeCount" INTEGER,
ADD COLUMN     "gstNumber" TEXT,
ADD COLUMN     "gstRegistered" BOOLEAN DEFAULT false,
ADD COLUMN     "incorporationDate" TIMESTAMP(3),
ADD COLUMN     "industry" TEXT,
ADD COLUMN     "pan" TEXT,
ADD COLUMN     "state" TEXT;
