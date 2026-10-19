import "dotenv/config"
import prisma from "../lib/prisma"
import { Frequency, TaskStatus } from "../app/generated/prisma/client"

async function main() {
  console.log("=== STARTING HISTORICAL DATA GENERATION ===");

  const makeDate = (y: number, m: number, d: number, hour = 18) => new Date(Date.UTC(y, m - 1, d, hour, 0, 0));

  // 1. Find or create Company ABC Pvt Ltd
  let company = await prisma.company.findFirst({
    where: { name: "ABC Pvt Ltd" }
  });

  if (!company) {
    console.log("Creating Company ABC Pvt Ltd...");
    company = await prisma.company.create({
      data: {
        name: "ABC Pvt Ltd",
        industry: "Manufacturing",
        type: "Pvt Ltd",
        employeeCount: 200,
        turnover: 120000000, // 12 Crores
        state: "Maharashtra"
      }
    });
  } else {
    console.log("Updating Company ABC Pvt Ltd details...");
    company = await prisma.company.update({
      where: { id: company.id },
      data: {
        industry: "Manufacturing",
        employeeCount: 200,
        turnover: 120000000,
        state: "Maharashtra"
      }
    });
  }

  // 2. Fetch or create Categories
  const categories = await prisma.complianceCategory.findMany();
  let taxCat = categories.find(c => c.name === "Tax");
  let labourCat = categories.find(c => c.name === "Labour");
  let corpCat = categories.find(c => c.name === "Corporate");

  if (!taxCat) taxCat = await prisma.complianceCategory.create({ data: { name: "Tax" } });
  if (!labourCat) labourCat = await prisma.complianceCategory.create({ data: { name: "Labour" } });
  if (!corpCat) corpCat = await prisma.complianceCategory.create({ data: { name: "Corporate" } });

  // 3. Ensure Roles exist
  let officerRole = await prisma.role.findUnique({ where: { name: "COMPANY_OFFICER" } });
  let staffRole = await prisma.role.findUnique({ where: { name: "COMPANY_STAFF" } });
  let coAdminRole = await prisma.role.findUnique({ where: { name: "COMPANY_ADMIN" } });

  if (!officerRole) officerRole = await prisma.role.create({ data: { name: "COMPANY_OFFICER" } });
  if (!staffRole) staffRole = await prisma.role.create({ data: { name: "COMPANY_STAFF" } });
  if (!coAdminRole) coAdminRole = await prisma.role.create({ data: { name: "COMPANY_ADMIN" } });

  // 4. Seed/Update Compliance Users
  const userSeeds = [
    { name: "Anjali K.", email: "anjali@abc.com", roleId: officerRole.id, department: "Finance" },
    { name: "Rahul V.", email: "rahul@abc.com", roleId: officerRole.id, department: "HR & Admin" },
    { name: "Amit S.", email: "amit@abc.com", roleId: officerRole.id, department: "Legal & Secretarial" },
    { name: "Rajesh M.", email: "rajesh@abc.com", roleId: staffRole.id, department: "Finance" }
  ];

  const usersMap: Record<string, any> = {};
  for (const u of userSeeds) {
    let dbUser = await prisma.user.findUnique({ where: { email: u.email } });
    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          email: u.email,
          name: u.name,
          password: "test123",
          roleId: u.roleId,
          companyId: company.id,
          department: u.department
        }
      });
      console.log(`Created user: ${u.name}`);
    } else {
      dbUser = await prisma.user.update({
        where: { id: dbUser.id },
        data: {
          name: u.name,
          roleId: u.roleId,
          companyId: company.id,
          department: u.department
        }
      });
      console.log(`Updated user: ${u.name}`);
    }
    usersMap[u.name] = dbUser;
  }

  // 5. Define the desired compliances
  const complianceDefs = [
    // Monthly
    { title: "GSTR-1 Return Filing", description: "Monthly details of outward supplies", categoryId: taxCat.id, frequency: "monthly" as Frequency, applicableLaw: "GST" },
    { title: "GSTR-3B Return Filing", description: "Monthly self-declared summary return", categoryId: taxCat.id, frequency: "monthly" as Frequency, applicableLaw: "GST" },
    { title: "TDS Deposit", description: "Monthly deposit of Tax Deducted at Source", categoryId: taxCat.id, frequency: "monthly" as Frequency, applicableLaw: "Income Tax" },
    { title: "EPF Contribution Filing", description: "Monthly EPF contribution and challan filing", categoryId: labourCat.id, frequency: "monthly" as Frequency, applicableLaw: "EPF" },
    { title: "ESI Contribution Filing", description: "Monthly ESI contribution and return filing", categoryId: labourCat.id, frequency: "monthly" as Frequency, applicableLaw: "ESI" },
    // Yearly
    { title: "Form DPT-3", description: "Return of deposits and transactions not considered deposits", categoryId: corpCat.id, frequency: "yearly" as Frequency, applicableLaw: "Companies Act" },
    { title: "Form DIR-3 KYC", description: "Annual KYC of Directors", categoryId: corpCat.id, frequency: "yearly" as Frequency, applicableLaw: "Companies Act" },
    { title: "Form ADT-1", description: "Notice to Registrar for appointment of auditor", categoryId: corpCat.id, frequency: "yearly" as Frequency, applicableLaw: "Companies Act" },
    { title: "Form AOC-4", description: "Filing of Financial Statements with MCA", categoryId: corpCat.id, frequency: "yearly" as Frequency, applicableLaw: "Companies Act" },
    { title: "Form MGT-7", description: "Filing of Annual Return with MCA", categoryId: corpCat.id, frequency: "yearly" as Frequency, applicableLaw: "Companies Act" },
    { title: "Form MBP-1", description: "Notice of interest by director", categoryId: corpCat.id, frequency: "yearly" as Frequency, applicableLaw: "Companies Act" }
  ];

  // Insert compliances and assign them
  const activeCompliances = [];
  for (const def of complianceDefs) {
    // Upsert compliance
    let comp = await prisma.compliance.findFirst({ where: { title: def.title } });
    if (!comp) {
      comp = await prisma.compliance.create({ data: def });
    } else {
      comp = await prisma.compliance.update({
        where: { id: comp.id },
        data: { description: def.description, categoryId: def.categoryId, frequency: def.frequency, applicableLaw: def.applicableLaw }
      });
    }
    
    // Create rule for this compliance
    await prisma.complianceRule.upsert({
      where: { complianceId: comp.id },
      update: {},
      create: {
        complianceId: comp.id,
        condition: def.frequency === "monthly" && def.applicableLaw === "EPF" ? { employeeCount: ">=20" } : { turnover: ">0" }
      }
    });

    // Upsert assigned compliance for company
    const assigned = await prisma.assignedCompliance.upsert({
      where: {
        companyId_complianceId: {
          companyId: company.id,
          complianceId: comp.id
        }
      },
      update: { status: "active" },
      create: {
        companyId: company.id,
        complianceId: comp.id,
        status: "active"
      }
    });

    activeCompliances.push({ compliance: comp, assignment: assigned });
  }

  // Clear existing tasks for this company's assignments
  const assignedIds = activeCompliances.map(ac => ac.assignment.id);
  await prisma.task.deleteMany({
    where: { assignedComplianceId: { in: assignedIds } }
  });
  console.log(`Cleared existing tasks for ${assignedIds.length} assignments.`);

  // 6. Generate history from June 2024 to June 2026
  const currentYear = 2026;
  const currentMonth = 6; // June
  const currentDay = 6;

  const startYear = 2024;
  const startMonth = 6; // June 2024

  let generatedCount = 0;

  let year = startYear;
  let month = startMonth;

  while (year < currentYear || (year === currentYear && month <= currentMonth)) {
    const activityYear = year;
    const activityMonth = month;

    // Calculate next month for due date
    let dueYear = activityYear;
    let dueMonth = activityMonth + 1;
    if (dueMonth > 12) {
      dueMonth = 1;
      dueYear += 1;
    }

    // For monthly items:
    for (const item of activeCompliances) {
      if (item.compliance.frequency !== "monthly") continue;

      const title = item.compliance.title;
      let dueDate = new Date();
      let assigneeUser = null;

      if (title === "TDS Deposit") {
        dueDate = makeDate(dueYear, dueMonth, 7);
        assigneeUser = usersMap["Anjali K."];
      } else if (title === "GSTR-1 Return Filing") {
        dueDate = makeDate(dueYear, dueMonth, 11);
        assigneeUser = usersMap["Rajesh M."];
      } else if (title === "GSTR-3B Return Filing") {
        dueDate = makeDate(dueYear, dueMonth, 20);
        assigneeUser = usersMap["Rajesh M."];
      } else if (title === "EPF Contribution Filing") {
        dueDate = makeDate(dueYear, dueMonth, 15);
        assigneeUser = usersMap["Rahul V."];
      } else if (title === "ESI Contribution Filing") {
        dueDate = makeDate(dueYear, dueMonth, 15);
        assigneeUser = usersMap["Rahul V."];
      }

      // Determine status and completion date
      let status: TaskStatus = TaskStatus.completed;
      let completedAt: Date | null = null;
      let remarks = `Filing completed for ${activityMonth}/${activityYear}`;

      const dueDateTime = dueDate.getTime();
      const nowTime = makeDate(currentYear, currentMonth, currentDay).getTime();

      if (dueDateTime > nowTime) {
        status = TaskStatus.pending;
        completedAt = null;
        remarks = `Upcoming filing for ${activityMonth}/${activityYear}`;
      } else {
        // Overdue and late filing overrides
        if (title === "TDS Deposit" && activityMonth === 12 && activityYear === 2024) {
          status = TaskStatus.completed;
          completedAt = makeDate(dueYear, dueMonth, 13);
          remarks = "Challan ITNS 281 filed late. Interest of Rs. 1,250 paid u/s 201(1A).";
        }
        else if (title === "TDS Deposit" && activityMonth === 10 && activityYear === 2025) {
          status = TaskStatus.pending;
          completedAt = null;
          remarks = "PENDING - Query raised on vendor TDS rates. Review required.";
        }
        else if (title === "GSTR-1 Return Filing" && activityMonth === 4 && activityYear === 2025) {
          status = TaskStatus.completed;
          completedAt = makeDate(dueYear, dueMonth, 15);
          remarks = "Return GSTR-1 filed late. Late fee of Rs. 200 paid.";
        }
        else if (dueDateTime > makeDate(currentYear, currentMonth, 1).getTime() && dueDateTime <= nowTime + 10 * 24 * 60 * 60 * 1000) {
          status = TaskStatus.pending;
          completedAt = null;
          remarks = "Draft prepared, awaiting final verification of outward ledger.";
        }
        else if (title === "EPF Contribution Filing" && activityMonth === 8 && activityYear === 2024) {
          status = TaskStatus.completed;
          completedAt = makeDate(dueYear, dueMonth, 23);
          remarks = "Challan generated late due to payroll software integration error. Penal damages paid.";
        }
        else if (title === "EPF Contribution Filing" && activityMonth === 4 && activityYear === 2026) {
          status = TaskStatus.pending;
          completedAt = null;
          remarks = "OVERDUE - Discrepancy in UAN verification for new hires in production unit.";
        }
        else {
          status = TaskStatus.completed;
          const offsetDays = Math.floor(Math.random() * 3) + 1;
          completedAt = makeDate(dueYear, dueMonth, dueDate.getDate() - offsetDays);
          remarks = `Filing submitted successfully. TRRN/Ack Number: ${Math.floor(1000000000 + Math.random() * 9000000000)}`;
        }
      }

      await prisma.task.create({
        data: {
          assignedComplianceId: item.assignment.id,
          dueDate,
          completedAt,
          status,
          remarks,
          assigneeName: assigneeUser?.name || null,
          assigneeRole: assigneeUser ? (assigneeUser.roleId === officerRole.id ? "Compliance Officer" : "Staff/Assignee") : null,
          department: assigneeUser?.department || null,
          assigneeId: assigneeUser?.id || null
        }
      });
      generatedCount++;
    }

    month++;
    if (month > 12) {
      month = 1;
      year++;
    }
  }

  // 7. Generate yearly MCA / Corporate tasks
  const amitUser = usersMap["Amit S."];
  
  const yearlyTasks = [
    {
      title: "Form DPT-3",
      fy: "FY 2024-25",
      dueDate: makeDate(2025, 6, 30),
      status: TaskStatus.completed,
      completedAt: makeDate(2025, 6, 28),
      remarks: "Annual return of deposits filed successfully with MCA. SRN: T88392102.",
    },
    {
      title: "Form DPT-3",
      fy: "FY 2025-26",
      dueDate: makeDate(2026, 6, 30),
      status: TaskStatus.pending,
      completedAt: null,
      remarks: "Data compiling from financial books. Scheduled for filing by mid-June.",
    },
    {
      title: "Form DIR-3 KYC",
      fy: "FY 2024-25",
      dueDate: makeDate(2025, 9, 30),
      status: TaskStatus.completed,
      completedAt: makeDate(2025, 9, 25),
      remarks: "Director KYC for all 3 active directors completed. SRN: T99283748.",
    },
    {
      title: "Form ADT-1",
      fy: "FY 2024-25",
      dueDate: makeDate(2025, 10, 14),
      status: TaskStatus.completed,
      completedAt: makeDate(2025, 10, 10),
      remarks: "Auditor appointment notice for 5 years filed with ROC. SRN: T10283749.",
    },
    {
      title: "Form AOC-4",
      fy: "FY 2024-25",
      dueDate: makeDate(2025, 10, 29),
      status: TaskStatus.completed,
      completedAt: makeDate(2025, 10, 28),
      remarks: "Audited financial statements filed with MCA. SRN: T11293847.",
    },
    {
      title: "Form MGT-7",
      fy: "FY 2024-25",
      dueDate: makeDate(2025, 11, 29),
      status: TaskStatus.completed,
      completedAt: makeDate(2025, 11, 27),
      remarks: "Annual Return for FY25 filed with MCA. SRN: T12938475.",
    },
    {
      title: "Form MBP-1",
      fy: "FY 2024-25",
      dueDate: makeDate(2024, 4, 30),
      status: TaskStatus.completed,
      completedAt: makeDate(2024, 4, 28),
      remarks: "Director interest disclosures taken on record in Board Meeting.",
    },
    {
      title: "Form MBP-1",
      fy: "FY 2025-26",
      dueDate: makeDate(2025, 4, 30),
      status: TaskStatus.completed,
      completedAt: makeDate(2025, 5, 5),
      remarks: "Director interest disclosures submitted late. Disclosed in Board meeting on May 5.",
    },
    {
      title: "Form MBP-1",
      fy: "FY 2026-27",
      dueDate: makeDate(2026, 4, 30),
      status: TaskStatus.completed,
      completedAt: makeDate(2026, 4, 29),
      remarks: "Disclosures collected and filed for all directors for current FY.",
    }
  ];

  for (const yt of yearlyTasks) {
    const item = activeCompliances.find(ac => ac.compliance.title === yt.title);
    if (!item) continue;

    await prisma.task.create({
      data: {
        assignedComplianceId: item.assignment.id,
        dueDate: yt.dueDate,
        completedAt: yt.completedAt,
        status: yt.status,
        remarks: `${yt.fy} - ${yt.remarks}`,
        assigneeName: amitUser?.name || null,
        assigneeRole: amitUser ? "Compliance Officer" : null,
        department: amitUser?.department || null,
        assigneeId: amitUser?.id || null
      }
    });
    generatedCount++;
  }

  console.log(`\n=== GENERATION COMPLETE: Generated ${generatedCount} tasks. ===`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
