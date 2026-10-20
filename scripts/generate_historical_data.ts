import "dotenv/config"
import prisma from "../lib/prisma"
import { Frequency, TaskStatus } from "../app/generated/prisma/client"

async function main() {
  console.log("=== STARTING COMPREHENSIVE DATA GENERATION (2024 - 2027) ===");

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

  // Ensure Admin User for Login
  let adminUser = await prisma.user.findUnique({ where: { email: "admin@abc.com" } });
  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        email: "admin@abc.com",
        name: "ABC Admin",
        password: "test123",
        roleId: coAdminRole.id,
        companyId: company.id,
        department: "Management"
      }
    });
    console.log("Created admin user: admin@abc.com");
  } else {
    await prisma.user.update({
      where: { id: adminUser.id },
      data: {
        roleId: coAdminRole.id,
        companyId: company.id
      }
    });
  }

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
    let comp = await prisma.compliance.findFirst({ where: { title: def.title } });
    if (!comp) {
      comp = await prisma.compliance.create({ data: def });
    } else {
      comp = await prisma.compliance.update({
        where: { id: comp.id },
        data: { description: def.description, categoryId: def.categoryId, frequency: def.frequency, applicableLaw: def.applicableLaw }
      });
    }
    
    await prisma.complianceRule.upsert({
      where: { complianceId: comp.id },
      update: {},
      create: {
        complianceId: comp.id,
        condition: def.frequency === "monthly" && def.applicableLaw === "EPF" ? { employeeCount: ">=20" } : { turnover: ">0" }
      }
    });

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

  // 6. Generate history and future schedules: May 2024 to December 2027
  // Activity from 2024/05 to 2027/12 (generating due dates June 2024 through January 2028)
  const todayYear = 2026;
  const todayMonth = 10;
  const todayDay = 20;
  const nowTime = makeDate(todayYear, todayMonth, todayDay, 23).getTime();

  let generatedCount = 0;

  let actYear = 2024;
  let actMonth = 5; // May 2024 activity -> Due in June 2024

  const targetEndYear = 2027;
  const targetEndMonth = 12; // Dec 2027 activity -> Due in Jan 2028

  while (actYear < targetEndYear || (actYear === targetEndYear && actMonth <= targetEndMonth)) {
    // Calculate due date month
    let dueYear = actYear;
    let dueMonth = actMonth + 1;
    if (dueMonth > 12) {
      dueMonth = 1;
      dueYear += 1;
    }

    // Monthly Compliances
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

      const dueDateTime = dueDate.getTime();
      let status: TaskStatus = TaskStatus.completed;
      let completedAt: Date | null = null;
      let remarks = `Filing completed for period ${actMonth}/${actYear}`;

      if (dueDateTime > nowTime) {
        // Future / Upcoming
        status = TaskStatus.pending;
        completedAt = null;
        remarks = `Scheduled upcoming filing for period ${actMonth}/${actYear}`;
      } else if (dueYear === 2026 && dueMonth === 10) {
        // October 2026 (Current active period)
        if (title === "GSTR-3B Return Filing") {
          status = TaskStatus.pending;
          completedAt = null;
          remarks = "Due today: Final input tax reconciliation complete. Ready for OTP sign-off.";
        } else if (title === "TDS Deposit") {
          status = TaskStatus.completed;
          completedAt = makeDate(2026, 10, 6);
          remarks = "Challan ITNS 281 deposited successfully. BSR: 0210042, Challan No: 88192.";
        } else if (title === "GSTR-1 Return Filing") {
          status = TaskStatus.completed;
          completedAt = makeDate(2026, 10, 10);
          remarks = "Return GSTR-1 filed on portal. ARN: AA2710260018921.";
        } else if (title === "EPF Contribution Filing") {
          status = TaskStatus.completed;
          completedAt = makeDate(2026, 10, 14);
          remarks = "Monthly ECR generated and payment cleared. TRRN: 2026101490218.";
        } else if (title === "ESI Contribution Filing") {
          status = TaskStatus.completed;
          completedAt = makeDate(2026, 10, 14);
          remarks = "Monthly ESI contribution paid. Challan No: 05261014892.";
        }
      } else {
        // Historical filings (pre-October 2026)
        if (title === "TDS Deposit" && actMonth === 12 && actYear === 2024) {
          status = TaskStatus.completed;
          completedAt = makeDate(dueYear, dueMonth, 13);
          remarks = "Challan ITNS 281 filed late. Interest of Rs. 1,250 paid u/s 201(1A).";
        } else if (title === "TDS Deposit" && actMonth === 10 && actYear === 2025) {
          status = TaskStatus.completed;
          completedAt = makeDate(dueYear, dueMonth, 14);
          remarks = "Clarification on vendor section 194C resolved. Challan filed with nominal interest.";
        } else if (title === "GSTR-1 Return Filing" && actMonth === 4 && actYear === 2025) {
          status = TaskStatus.completed;
          completedAt = makeDate(dueYear, dueMonth, 15);
          remarks = "Return GSTR-1 filed late. Late fee of Rs. 200 paid.";
        } else if (title === "EPF Contribution Filing" && actMonth === 8 && actYear === 2024) {
          status = TaskStatus.completed;
          completedAt = makeDate(dueYear, dueMonth, 23);
          remarks = "Challan generated late due to payroll software integration error. Penal damages paid.";
        } else if (title === "EPF Contribution Filing" && actMonth === 4 && actYear === 2026) {
          status = TaskStatus.completed;
          completedAt = makeDate(dueYear, dueMonth, 20);
          remarks = "UAN verification cleared with regional EPFO office. Filed with interest.";
        } else {
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

    actMonth++;
    if (actMonth > 12) {
      actMonth = 1;
      actYear++;
    }
  }

  // 7. Generate yearly MCA / Corporate tasks (2024 to 2027)
  const amitUser = usersMap["Amit S."];
  
  const yearlyTasks = [
    // 2024
    {
      title: "Form MBP-1",
      fy: "FY 2024-25",
      dueDate: makeDate(2024, 4, 30),
      status: TaskStatus.completed,
      completedAt: makeDate(2024, 4, 28),
      remarks: "Director interest disclosures taken on record in Board Meeting.",
    },
    // 2025
    {
      title: "Form MBP-1",
      fy: "FY 2025-26",
      dueDate: makeDate(2025, 4, 30),
      status: TaskStatus.completed,
      completedAt: makeDate(2025, 5, 5),
      remarks: "Director interest disclosures submitted late. Disclosed in Board meeting on May 5.",
    },
    {
      title: "Form DPT-3",
      fy: "FY 2024-25",
      dueDate: makeDate(2025, 6, 30),
      status: TaskStatus.completed,
      completedAt: makeDate(2025, 6, 28),
      remarks: "Annual return of deposits filed successfully with MCA. SRN: T88392102.",
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
    // 2026
    {
      title: "Form MBP-1",
      fy: "FY 2026-27",
      dueDate: makeDate(2026, 4, 30),
      status: TaskStatus.completed,
      completedAt: makeDate(2026, 4, 29),
      remarks: "Disclosures collected and filed for all directors for FY 2026-27.",
    },
    {
      title: "Form DPT-3",
      fy: "FY 2025-26",
      dueDate: makeDate(2026, 6, 30),
      status: TaskStatus.completed,
      completedAt: makeDate(2026, 6, 29),
      remarks: "Annual return of deposits filed successfully with MCA. SRN: T99482103.",
    },
    {
      title: "Form DIR-3 KYC",
      fy: "FY 2025-26",
      dueDate: makeDate(2026, 9, 30),
      status: TaskStatus.completed,
      completedAt: makeDate(2026, 9, 27),
      remarks: "Annual KYC web service verification completed for directors. SRN: T10293847.",
    },
    {
      title: "Form ADT-1",
      fy: "FY 2025-26",
      dueDate: makeDate(2026, 10, 14),
      status: TaskStatus.completed,
      completedAt: makeDate(2026, 10, 12),
      remarks: "Auditor reappointment filed with ROC. SRN: T11283740.",
    },
    {
      title: "Form AOC-4",
      fy: "FY 2025-26",
      dueDate: makeDate(2026, 10, 29),
      status: TaskStatus.pending,
      completedAt: null,
      remarks: "Draft balance sheet and P&L under final review by board; filing scheduled by Oct 28.",
    },
    {
      title: "Form MGT-7",
      fy: "FY 2025-26",
      dueDate: makeDate(2026, 11, 29),
      status: TaskStatus.pending,
      completedAt: null,
      remarks: "Annual return compilation following AGM. Scheduled for filing by Nov 25.",
    },
    // 2027
    {
      title: "Form MBP-1",
      fy: "FY 2027-28",
      dueDate: makeDate(2027, 4, 30),
      status: TaskStatus.pending,
      completedAt: null,
      remarks: "Scheduled annual disclosure of directors' interests for the first board meeting.",
    },
    {
      title: "Form DPT-3",
      fy: "FY 2026-27",
      dueDate: makeDate(2027, 6, 30),
      status: TaskStatus.pending,
      completedAt: null,
      remarks: "Scheduled annual return of deposits & exempted loans for FY 2026-27.",
    },
    {
      title: "Form DIR-3 KYC",
      fy: "FY 2026-27",
      dueDate: makeDate(2027, 9, 30),
      status: TaskStatus.pending,
      completedAt: null,
      remarks: "Scheduled web-based KYC verification for all DIN holders.",
    },
    {
      title: "Form ADT-1",
      fy: "FY 2026-27",
      dueDate: makeDate(2027, 10, 14),
      status: TaskStatus.pending,
      completedAt: null,
      remarks: "Scheduled notice to Registrar for appointment/ratification of statutory auditor.",
    },
    {
      title: "Form AOC-4",
      fy: "FY 2026-27",
      dueDate: makeDate(2027, 10, 29),
      status: TaskStatus.pending,
      completedAt: null,
      remarks: "Scheduled annual audited financial statement filing for FY 2026-27.",
    },
    {
      title: "Form MGT-7",
      fy: "FY 2026-27",
      dueDate: makeDate(2027, 11, 29),
      status: TaskStatus.pending,
      completedAt: null,
      remarks: "Scheduled annual return filing with MCA for FY 2026-27.",
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

  console.log(`\n=== GENERATION COMPLETE: Successfully generated ${generatedCount} tasks up to December 2027. ===`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
