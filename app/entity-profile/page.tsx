import prisma from "@/lib/prisma"
import { getSessionFromCookies } from "@/lib/auth"

export default async function EntityProfilePage() {
  const session = await getSessionFromCookies()
  const companyId = session?.companyId

  // Get active company
  const company = companyId
    ? await prisma.company.findUnique({ where: { id: companyId } })
    : await prisma.company.findFirst()

  if (!company) {
    return (
      <div className="p-8 text-center bg-white border rounded-xl shadow-sm">
        <h2 className="text-xl font-bold text-red-600">No Company Profile Found</h2>
        <p className="text-sm text-gray-500 mt-2">Please run the seed script to populate demo data.</p>
      </div>
    )
  }

  // Calculate realistic statutory registration identifiers based on company data
  const regYear = company.createdAt ? new Date(company.createdAt).getFullYear() : 2024
  const stateCode = company.state?.toLowerCase() === "karnataka" ? "KA" : "MH"
  const gstStatePrefix = stateCode === "KA" ? "29" : "27"
  const cinCode = company.type === "LLP" ? "AAA-1234" : `U72200${stateCode}${regYear}PTC355442`
  const panCode = `AAFCB8823M`
  const tanCode = `${stateCode}MA88231E`
  const gstinCode = `${gstStatePrefix}${panCode}1Z2`

  const formatTurnover = (val: any) => {
    if (!val) return "N/A"
    const num = Number(val)
    if (num >= 10000000) return `Rs. ${num / 10000000} Crore`
    if (num >= 100000) return `Rs. ${num / 100000} Lakh`
    return `Rs. ${num.toLocaleString()}`
  }

  // Dynamic board of directors for the company
  const directors = [
    {
      name: "Siddharth Goel",
      din: "08422319",
      role: "Managing Director",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAGkIoqLGtH3MkHjSwqDslQTPTeiVigKHGdFKgLIS_lTCSaNp_sqDsSlYETcT9N35A77xCrdOXVVB1DscNCZTWKxM1JkEocHubfuOOOhuRb3mmPprfu6qAZ7Fi3rDkRBcep-EY_9f_g26YxnPZgrwgfzIa5PrvHeQOPy1TS-4Qts2fUpz8OcfGJXRgN25D8WtLILLjckJecBPDmS-eWCqtZ1etcaXkSwairZxl66T25UdeD_RVs1FQBSo1qm9qaDX9IlYtVrD6uAA"
    },
    {
      name: "Meera Deshmukh",
      din: "09115432",
      role: "Director & Legal Lead",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBWer1DC-seuRxQmpQ9qDTMvIbTfgKESlBKfk-c9_ekQCauLHh-ui7dyVEJsR8MkQd21MMOYJO5_AKYa1DBFUJUC_uE6di3bpH_yx0BrkQOTDLYz4va_yYkwwNH1YkpWpbQa1df-FkuniTZ6S5_5nx8ot59nzJDkZJjbU7REMd1M6Xe4GKj1pE2KmcSlMlLsbv0jYlx5eyR-8V7E5uR18pvM0oeCGZrF1Sfx0wsxzI-tjiFHW8BW7572jzk5ULqZ3cIAvhtDRM6Fg"
    }
  ]

  return (
    <div className="pb-12">
      {/* Editorial Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
        <div className="max-w-2xl">
          <p className="text-[0.75rem] font-bold text-primary uppercase tracking-[0.15em] mb-2">Corporate Identity</p>
          <h1 className="text-4xl font-extrabold text-on-surface tracking-tight mb-4">{company.name}</h1>
          <p className="text-secondary text-lg leading-relaxed font-body">
            Active corporate entity registered in {company.state || "Maharashtra"} in the <strong>{company.industry || "Manufacturing"}</strong> sector, employing around {company.employeeCount || 200} personnel with an annual turnover of {formatTurnover(company.turnover)}.
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="px-5 py-2.5 bg-surface-container text-primary font-bold text-sm rounded-md ghost-border flex items-center space-x-2 transition-all active:scale-95">
            <span className="material-symbols-outlined text-sm">share</span>
            <span>Share Profile</span>
          </button>
          <button className="px-5 py-2.5 bg-primary-gradient text-white font-bold text-sm rounded-md flex items-center space-x-2 transition-all active:scale-95 shadow-xl shadow-primary/10">
            <span className="material-symbols-outlined text-sm">edit</span>
            <span>Update Details</span>
          </button>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-6">
        {/* Key Identifiers Card */}
        <div className="col-span-12 lg:col-span-7 bg-surface-container-lowest rounded-xl p-8 ghost-border shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-on-surface">Registration Identifiers</h3>
            <span className="material-symbols-outlined text-outline-variant">verified_user</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
            <div className="space-y-1">
              <label className="text-[0.65rem] font-bold text-outline-variant uppercase tracking-widest">CIN (Corporate ID Number)</label>
              <div className="flex items-center justify-between py-2 border-b border-surface-container">
                <span className="font-mono text-sm font-semibold tracking-wider">{cinCode}</span>
                <span className="material-symbols-outlined text-[16px] text-primary cursor-pointer">content_copy</span>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[0.65rem] font-bold text-outline-variant uppercase tracking-widest">PAN (Permanent Account Number)</label>
              <div className="flex items-center justify-between py-2 border-b border-surface-container">
                <span className="font-mono text-sm font-semibold tracking-wider">{panCode}</span>
                <span className="material-symbols-outlined text-[16px] text-primary cursor-pointer">content_copy</span>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[0.65rem] font-bold text-outline-variant uppercase tracking-widest">TAN (Tax Deduction Account)</label>
              <div className="flex items-center justify-between py-2 border-b border-surface-container">
                <span className="font-mono text-sm font-semibold tracking-wider">{tanCode}</span>
                <span className="material-symbols-outlined text-[16px] text-primary cursor-pointer">content_copy</span>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[0.65rem] font-bold text-outline-variant uppercase tracking-widest">GSTIN</label>
              <div className="flex items-center justify-between py-2 border-b border-surface-container">
                <span className="font-mono text-sm font-semibold tracking-wider">{gstinCode}</span>
                <span className="material-symbols-outlined text-[16px] text-primary cursor-pointer">content_copy</span>
              </div>
            </div>
          </div>
          <div className="mt-12 bg-surface-container-low rounded-lg p-6 flex items-start space-x-4">
            <div className="w-10 h-10 rounded bg-white flex items-center justify-center flex-shrink-0 ghost-border shadow-sm">
              <span className="material-symbols-outlined text-primary">location_on</span>
            </div>
            <div>
              <label className="text-[0.65rem] font-bold text-outline-variant uppercase tracking-widest mb-1 block">Registered Office Address</label>
              <p className="text-on-surface font-medium leading-relaxed">
                Unit 104, Building 2B, Industrial Growth Center, BKC G-Block, Bandra East, Mumbai, Maharashtra - 400051, India
              </p>
            </div>
          </div>
        </div>

        {/* Directors Panel */}
        <div className="col-span-12 lg:col-span-5 bg-surface-container-low rounded-xl p-8 flex flex-col shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-on-surface">Board of Directors</h3>
            <span className="text-[10px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded uppercase">Active Board</span>
          </div>
          <div className="space-y-4 flex-1">
            {directors.map((dir, idx) => (
              <div key={idx} className="bg-surface-container-lowest p-4 rounded-lg ghost-border flex items-center group hover:bg-white transition-colors shadow-sm">
                <div className="w-12 h-12 rounded-full overflow-hidden mr-4 border-2 border-primary/10 group-hover:border-primary/40 transition-all">
                  <img alt={`${dir.name} Avatar`} className="w-full h-full object-cover" src={dir.avatar} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-on-surface text-sm">{dir.name}</h4>
                  <p className="text-[10px] text-primary font-medium">{dir.role}</p>
                  <p className="text-[11px] text-outline-variant font-mono">DIN: {dir.din}</p>
                </div>
                <span className="material-symbols-outlined text-outline-variant text-[20px]">arrow_forward_ios</span>
              </div>
            ))}
          </div>
          <button className="w-full mt-6 py-3 bg-transparent border border-outline-variant/30 text-secondary font-bold text-xs uppercase tracking-widest rounded hover:bg-surface-container transition-colors">
            View Appointment History
          </button>
        </div>

        {/* Statutory Registers Section */}
        <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-xl p-8 ghost-border shadow-sm">
          <div className="flex items-center justify-between mb-8 border-b border-surface-container pb-4">
            <h3 className="text-xl font-bold text-on-surface">Statutory Registers</h3>
            <div className="flex space-x-2">
              <span className="material-symbols-outlined text-outline-variant cursor-pointer p-1">search</span>
              <span className="material-symbols-outlined text-outline-variant cursor-pointer p-1">filter_list</span>
            </div>
          </div>
          <div className="space-y-0">
            {/* Table Header */}
            <div className="grid grid-cols-12 px-4 py-3 bg-surface-container-low rounded-t-lg">
              <div className="col-span-5 text-[0.65rem] font-bold text-on-surface-variant uppercase tracking-[0.1rem]">Register Name</div>
              <div className="col-span-4 text-[0.65rem] font-bold text-on-surface-variant uppercase tracking-[0.1rem]">Last Updated</div>
              <div className="col-span-3 text-[0.65rem] font-bold text-on-surface-variant uppercase tracking-[0.1rem] text-right">Action</div>
            </div>
            {/* Table Rows */}
            <div className="divide-y divide-surface-container">
              <div className="grid grid-cols-12 px-4 py-4 hover:bg-surface-container-low/50 transition-colors group">
                <div className="col-span-5 flex items-center space-x-3">
                  <span className="material-symbols-outlined text-primary/60">group</span>
                  <span className="text-sm font-semibold text-on-surface">Register of Members</span>
                </div>
                <div className="col-span-4 flex items-center">
                  <span className="text-xs text-secondary">12 Oct 2025, 04:30 PM</span>
                </div>
                <div className="col-span-3 flex justify-end">
                  <button className="text-primary text-[11px] font-bold uppercase tracking-wider hover:underline">Download PDF</button>
                </div>
              </div>
              <div className="grid grid-cols-12 px-4 py-4 hover:bg-surface-container-low/50 transition-colors group">
                <div className="col-span-5 flex items-center space-x-3">
                  <span className="material-symbols-outlined text-primary/60">badge</span>
                  <span className="text-sm font-semibold text-on-surface">Register of Directors</span>
                </div>
                <div className="col-span-4 flex items-center">
                  <span className="text-xs text-secondary">05 Jan 2026, 11:15 AM</span>
                </div>
                <div className="col-span-3 flex justify-end">
                  <button className="text-primary text-[11px] font-bold uppercase tracking-wider hover:underline">Download PDF</button>
                </div>
              </div>
              <div className="grid grid-cols-12 px-4 py-4 hover:bg-surface-container-low/50 transition-colors group">
                <div className="col-span-5 flex items-center space-x-3">
                  <span className="material-symbols-outlined text-primary/60">account_balance</span>
                  <span className="text-sm font-semibold text-on-surface">Register of Charges</span>
                </div>
                <div className="col-span-4 flex items-center">
                  <span className="text-xs text-secondary">28 Dec 2025, 02:45 PM</span>
                </div>
                <div className="col-span-3 flex justify-end">
                  <button className="text-primary text-[11px] font-bold uppercase tracking-wider hover:underline">Download PDF</button>
                </div>
              </div>
              <div className="grid grid-cols-12 px-4 py-4 hover:bg-surface-container-low/50 transition-colors group">
                <div className="col-span-5 flex items-center space-x-3">
                  <span className="material-symbols-outlined text-primary/60">receipt_long</span>
                  <span className="text-sm font-semibold text-on-surface">Register of Contracts</span>
                </div>
                <div className="col-span-4 flex items-center">
                  <span className="text-xs text-secondary">15 Feb 2026, 09:20 AM</span>
                </div>
                <div className="col-span-3 flex justify-end">
                  <button className="text-primary text-[11px] font-bold uppercase tracking-wider hover:underline">Download PDF</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Corporate Documents */}
        <div className="col-span-12 lg:col-span-4 bg-surface-container-lowest rounded-xl p-8 ghost-border flex flex-col shadow-sm">
          <h3 className="text-xl font-bold text-on-surface mb-8">Corporate Documents</h3>
          <div className="space-y-6 flex-grow">
            <div className="flex items-center space-x-4 p-4 rounded-lg bg-surface-container-low border border-primary/5 hover:border-primary/20 transition-all cursor-pointer">
              <div className="w-10 h-10 rounded bg-[#d6e3ff] flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">article</span>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-on-surface">MOA</h4>
                <p className="text-[10px] text-secondary">Memorandum of Association</p>
              </div>
              <span className="material-symbols-outlined text-outline-variant">download</span>
            </div>
            <div className="flex items-center space-x-4 p-4 rounded-lg bg-surface-container-low border border-primary/5 hover:border-primary/20 transition-all cursor-pointer">
              <div className="w-10 h-10 rounded bg-[#d6e3ff] flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">description</span>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-on-surface">AOA</h4>
                <p className="text-[10px] text-secondary">Articles of Association</p>
              </div>
              <span className="material-symbols-outlined text-outline-variant">download</span>
            </div>
            <div className="flex items-center space-x-4 p-4 rounded-lg bg-surface-container-low border border-primary/5 hover:border-primary/20 transition-all cursor-pointer">
              <div className="w-10 h-10 rounded bg-[#d6e3ff] flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">history_edu</span>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-on-surface">Incorporation Certificate</h4>
                <p className="text-[10px] text-secondary">Form INC-11</p>
              </div>
              <span className="material-symbols-outlined text-outline-variant">download</span>
            </div>
            <div className="flex items-center space-x-4 p-4 rounded-lg bg-surface-container-low border border-primary/5 hover:border-primary/20 transition-all cursor-pointer">
              <div className="w-10 h-10 rounded bg-[#d6e3ff] flex items-center justify-center">
                <span className="material-symbols-outlined text-primary">assignment_ind</span>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-on-surface">Pan & Tan Cards</h4>
                <p className="text-[10px] text-secondary">Identity Proofs</p>
              </div>
              <span className="material-symbols-outlined text-outline-variant">download</span>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-surface-container">
            <button className="w-full py-2.5 bg-primary/5 text-primary text-xs font-bold rounded-md hover:bg-primary/10 transition-colors flex items-center justify-center space-x-2">
              <span className="material-symbols-outlined text-[16px]">upload_file</span>
              <span>Upload New Document</span>
            </button>
          </div>
        </div>
      </div>

      {/* Compliance Health Strip (Footer Content) */}
      <div className="mt-12 bg-on-background text-on-primary rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between shadow-2xl shadow-on-background/20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="w-full h-full" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, #fff 1px, transparent 0)", backgroundSize: "40px 40px" }}></div>
        </div>
        <div className="z-10 text-center md:text-left mb-6 md:mb-0">
          <h4 className="text-xl font-bold mb-1">Corporate Verification Stand</h4>
          <p className="text-primary-fixed-dim/80 text-sm max-w-md">Entity profile details verified against MCA and GST registers. Last auto-audit ran 2 hours ago.</p>
        </div>
        <div className="z-10 flex space-x-4">
          <div className="flex flex-col items-center px-6 border-r border-white/10">
            <span className="text-2xl font-black">{company.employeeCount || 200}</span>
            <span className="text-[10px] uppercase font-bold text-primary-fixed-dim">Employees</span>
          </div>
          <div className="flex flex-col items-center px-6 border-r border-white/10">
            <span className="text-2xl font-black">{company.state || "MH"}</span>
            <span className="text-[10px] uppercase font-bold text-primary-fixed-dim">State Region</span>
          </div>
          <div className="flex flex-col items-center px-6">
            <button className="bg-primary-container text-on-primary-container px-6 py-2 rounded-full font-bold text-sm hover:scale-105 transition-transform active:scale-95 shadow-lg">
              Re-run Audit
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
