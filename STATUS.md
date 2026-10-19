# Compliance Portal – Status Report (Mar 18, 2026)

## Overview
- Next.js App Router frontend with Tailwind/ShadCN.
- Role-based auth (cookie session) gating public landing, company dashboard, and admin area.
- Compliance engine, API routes, and admin control UI implemented.

## Frontend
- **Landing page** at `/` with hero, problem cards, and minimal navbar (Features, Solutions, Login, Book Demo).
- **Authentication pages**: company login `/login` → `/dashboard`; admin login `/admin` → `/admin/dashboard`.
- **Company dashboard** summarizes counts for companies, compliances, assignments, and tasks.
- **Tasks page** lists compliance tasks; **Frameworks** page shows compliance library details.
- **Admin dashboard** now includes quick links to Companies list and JSON Upload.
- **Admin companies UI**:
  - List: `/admin/companies`
  - Create: `/admin/companies/new`
  - Detail: `/admin/companies/[id]` with assignment toggles, run engine, and manual add.
  - JSON upload page: `/admin/upload` to import compliance definitions.
- Navbar shows Logout when authenticated; logout missing on some views was addressed earlier.

## Backend & APIs
- Prisma schema trimmed to core models: Company, User, Role, ComplianceCategory, Compliance, ComplianceRule, AssignedCompliance, Task.
- Compliance engine (`lib/complianceEngine.ts`) evaluates rules, assigns compliances, and creates tasks based on frequency.
- API routes:
  - `POST /api/company` create company (admin)
  - `GET /api/company/[id]/compliances` fetch assigned
  - `POST /api/company/[id]/compliances` manual assign (admin)
  - `POST /api/assign-compliances/[companyId]` run engine (admin)
  - `PATCH /api/compliance/[id]/toggle` toggle assignment status
  - `POST /api/admin/upload-compliance-json` bulk import

## Database & Seed
- Migration `20260317170000_core_compliance_engine` applied (Prisma migrate reset used).
- Seed script creates:
  - Roles: ADMIN, COMPANY_ADMIN
  - Users: admin@portal.com/admin123, uncle@portal.com/admin123 (ADMIN); admin@abc.com/test123 (COMPANY_ADMIN, ABC Pvt Ltd)
  - Company: ABC Pvt Ltd
  - Categories: Tax, Labour, Corporate
  - Sample compliances: GST Return Filing, EPF Contribution, ESI Filing, Annual ROC Filing with rules and tasks via engine.

## Recent Fixes
- Replaced deprecated `middleware.ts` with `proxy.ts` (Next.js 16 requirement) to remove dev warning.
- Adjusted login/admin/upload pages to unwrap async `searchParams`.
- Ensured UTF-8 safety on admin companies page.

## Known/To-Do
- Middleware deprecation warning resolved; ensure dev server is restarted.
- Feature anchor `/features` still 404 if visited directly; currently only used as navbar hash.
- Add logout buttons on any remaining layouts if missing.
- Consider adding tests and handling for task due date generation cadence.

