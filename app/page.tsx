import { Lifeline, LifelineLegend } from "@/components/lifeline"
import { DemoCompanyIcons } from "@/components/demo-company-icons"
import { RabbitLogo } from "@/components/rabbit-logo"
import { evilrabbitLifeline } from "@/lib/evilrabbit"

export default function Home() {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-white text-black antialiased transition-colors duration-300 dark:bg-black dark:text-white">
      {/* Same shell as evilrabbit.com: a fixed nav whose inner container
          is centered and capped at max-w-5xl — the timeline aligns its
          start to the logo and its end to the container's right edge. */}
      <nav className="fixed inset-x-0 top-0 z-50">
        <div className="border-b border-black/10 bg-white/80 backdrop-blur-xl transition-colors duration-300 dark:border-white/10 dark:bg-black/80">
          <div
            data-site-nav-inner
            className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6"
          >
            <a
              href="/"
              data-site-nav-logo
              aria-label="Evil Rabbit — Lifeline"
              className="text-black transition-[color,opacity] duration-300 hover:opacity-70 dark:text-white"
            >
              <RabbitLogo className="h-6 w-6" />
            </a>

            <div className="flex items-center gap-8">
              <a
                href="https://github.com/evilrabbit/lifeline"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-zinc-500 transition-colors duration-300 hover:text-black dark:hover:text-white"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </nav>

      <DemoCompanyIcons />
      <main className="flex-1 min-h-0 overflow-y-auto pt-16 md:overflow-hidden">
        <Lifeline
          markers={evilrabbitLifeline.markers}
          birthYear={evilrabbitLifeline.birthYear}
          title={evilrabbitLifeline.name}
          className="h-full"
        />
      </main>

      <footer className="shrink-0 border-t border-black/10 bg-white/95 transition-colors duration-300 dark:border-white/10 dark:bg-black/95">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-6 px-6">
          <LifelineLegend />
          <p className="hidden truncate text-sm text-zinc-500 transition-colors duration-300 dark:text-zinc-600 md:block">
            npx shadcn add evilrabbit/lifeline/personal
          </p>
        </div>
      </footer>
    </div>
  )
}
