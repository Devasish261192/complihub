import Link from "next/link"

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col bg-[#f7fafc]">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 md:pt-48 md:pb-32 px-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background"></div>
        <div className="relative max-w-5xl mx-auto text-center z-10">
          <div className="inline-flex items-center space-x-2 bg-primary/10 px-4 py-2 rounded-full mb-8 border border-primary/20">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span className="text-xs font-bold text-primary uppercase tracking-[0.2em]">Institutional GRC Engine</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-on-surface tracking-tight leading-[1.1] mb-6 font-['Manrope']">
            Master Compliance. <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#455f88] to-[#1e2a3b]">
              Eliminate Complexity.
            </span>
          </h1>
          
          <p className="mt-6 text-lg md:text-xl text-secondary max-w-2xl mx-auto font-medium leading-relaxed">
            The sovereign operating system for Indian regulatory compliance. Track GST, ROC, Tax, and Labour filings with cryptographic certainty and automated oversight.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4" id="book-demo">
            <button className="w-full sm:w-auto px-8 py-4 bg-primary-gradient text-white font-bold text-sm rounded-lg shadow-xl shadow-primary/20 hover:shadow-2xl hover:-translate-y-0.5 transition-all active:scale-95 flex items-center justify-center space-x-2">
              <span>Deploy Complihub</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
            <button className="w-full sm:w-auto px-8 py-4 bg-surface-container-lowest text-primary border border-outline-variant/20 font-bold text-sm rounded-lg shadow-sm hover:bg-white transition-all active:scale-95 flex items-center justify-center space-x-2">
              <span className="material-symbols-outlined text-sm">play_circle</span>
              <span>View Platform Demo</span>
            </button>
          </div>
          
          <div className="mt-16 pt-10 border-t border-outline-variant/10 flex flex-wrap justify-center gap-x-12 gap-y-6 opacity-60">
            <div className="flex items-center space-x-2"><span className="material-symbols-outlined text-2xl">account_balance</span><span className="font-bold text-sm tracking-wider">MCA</span></div>
            <div className="flex items-center space-x-2"><span className="material-symbols-outlined text-2xl">receipt_long</span><span className="font-bold text-sm tracking-wider">GST</span></div>
            <div className="flex items-center space-x-2"><span className="material-symbols-outlined text-2xl">real_estate_agent</span><span className="font-bold text-sm tracking-wider">INCOME TAX</span></div>
            <div className="flex items-center space-x-2"><span className="material-symbols-outlined text-2xl">group</span><span className="font-bold text-sm tracking-wider">EPFO</span></div>
          </div>
        </div>
      </section>

      {/* Solutions Section (Bento Grid) */}
      <section className="py-20 bg-surface-container-low" id="solutions">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-16 text-center max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-extrabold text-on-surface tracking-tight mb-4 font-['Manrope']">
              Regulatory Infrastructure, <br/> Reimagined.
            </h2>
            <p className="text-secondary text-lg">
              Manual tracking leads to missed filings, severe penalties, and unnecessary legal exposure. Complihub provides real-time visibility.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Main Feature */}
            <div className="md:col-span-8 bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/10 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/10 transition-colors"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-primary text-2xl">dashboard_customize</span>
                </div>
                <h3 className="text-2xl font-extrabold text-on-surface mb-3 font-['Manrope']">Unified Compliance Matrix</h3>
                <p className="text-secondary leading-relaxed max-w-md">
                  Stop chasing spreadsheets. Bring your entire organizational hierarchy and its corresponding regulatory obligations into a single, cryptographically secure dashboard.
                </p>
              </div>
            </div>

            {/* Secondary Feature */}
            <div className="md:col-span-4 bg-primary-gradient rounded-2xl p-8 shadow-lg relative overflow-hidden text-white group">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-white text-2xl">alarm_on</span>
                </div>
                <h3 className="text-xl font-extrabold mb-3 font-['Manrope']">Zero Missed Deadlines</h3>
                <p className="text-white/80 leading-relaxed text-sm">
                  Automated chronological mapping of statutory due dates with predictive penalty warnings and integrated calendar sync.
                </p>
              </div>
            </div>

            {/* Tertiary Features */}
            <div className="md:col-span-4 bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/10 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-[#e7eff3] rounded-lg flex items-center justify-center mb-5">
                <span className="material-symbols-outlined text-primary">policy</span>
              </div>
              <h3 className="text-lg font-bold text-on-surface mb-2 font-['Manrope']">Dynamic Rule Engine</h3>
              <p className="text-sm text-secondary leading-relaxed">
                Our engine evaluates company parameters (turnover, employees) against real-time MCA and GST laws to automatically assign relevant compliances.
              </p>
            </div>

            <div className="md:col-span-4 bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/10 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-[#e7eff3] rounded-lg flex items-center justify-center mb-5">
                <span className="material-symbols-outlined text-primary">folder_supervised</span>
              </div>
              <h3 className="text-lg font-bold text-on-surface mb-2 font-['Manrope']">Statutory Registers</h3>
              <p className="text-sm text-secondary leading-relaxed">
                Maintain unalterable digital records of members, directors, charges, and contracts exactly as mandated by the Companies Act.
              </p>
            </div>

            <div className="md:col-span-4 bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/10 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-[#e7eff3] rounded-lg flex items-center justify-center mb-5">
                <span className="material-symbols-outlined text-primary">verified</span>
              </div>
              <h3 className="text-lg font-bold text-on-surface mb-2 font-['Manrope']">Audit Readiness</h3>
              <p className="text-sm text-secondary leading-relaxed">
                Generate instant compliance health reports. Prove adherence to statutory norms with one-click export for internal and external auditors.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 relative" id="features">
        <div className="max-w-4xl mx-auto bg-[#1e2a3b] rounded-3xl p-12 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="w-full h-full" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, #fff 1px, transparent 0)", backgroundSize: "40px 40px" }}></div>
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 font-['Manrope']">Ready to secure your compliance?</h2>
            <p className="text-[#a7b4ba] text-lg max-w-xl mx-auto mb-10">
              Join leading Indian enterprises that trust Complihub for their statutory governance and regulatory filings.
            </p>
            <Link 
              href="/login" 
              className="inline-flex px-8 py-4 bg-white text-[#1e2a3b] font-extrabold text-sm rounded-lg hover:scale-105 transition-transform active:scale-95 items-center space-x-2"
            >
              <span>Access Corporate Portal</span>
              <span className="material-symbols-outlined text-sm">login</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="border-t border-outline-variant/10 bg-white py-8">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-2 font-['Manrope'] mb-4 md:mb-0">
             <span className="material-symbols-outlined text-primary text-xl">account_balance</span>
             <span className="font-extrabold text-on-surface text-sm">Complihub</span>
          </div>
          <p className="text-xs font-medium text-secondary">
            &copy; {new Date().getFullYear()} Sovereign Tech Solutions Pvt Ltd. All rights reserved.
          </p>
        </div>
      </footer>

    </main>
  )
}

