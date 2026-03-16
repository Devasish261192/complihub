import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-16 px-6 pb-16 pt-20 md:pt-28">

      <section className="text-center" id="features">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary/80">
          Compliance made simple
        </p>
        <h1 className="mt-4 text-4xl font-bold leading-tight md:text-5xl">
          Be Compliant. Not Complicated.
        </h1>
        <p className="mt-4 text-lg text-muted-foreground md:text-xl">
          A unified platform to track and manage Indian regulatory compliance while you focus on growing your business.
        </p>

        <div className="mt-8 flex items-center justify-center gap-4" id="book-demo">
          <Button size="lg">
            Book a Demo
          </Button>
        </div>

        <p className="mt-4 text-sm font-medium text-muted-foreground">
          GST • ROC • Income Tax • Labour Compliance
        </p>
      </section>

      <section className="space-y-8" id="solutions">
        <div className="text-center">
          <h2 className="text-2xl font-bold md:text-3xl">
            Compliance in India is Hard to Track and Easy to Miss
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

          <article className="border rounded-xl bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold">
              Compliance Data is Scattered
            </h3>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Track GST, ROC, tax, and labour filings across multiple government portals and spreadsheets.
            </p>
          </article>

          <article className="border rounded-xl bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold">
              Deadlines Get Missed
            </h3>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Manual tracking often leads to missed filings, penalties, and unnecessary legal risk.
            </p>
          </article>

          <article className="border rounded-xl bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold">
              No Clear Compliance Status
            </h3>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Companies struggle to see which filings are pending, completed, or overdue.
            </p>
          </article>

        </div>
      </section>

    </main>
  )
}
