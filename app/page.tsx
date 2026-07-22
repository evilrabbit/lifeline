import { Lifeline } from "@/components/lifeline"
import { evilrabbitLifeline } from "@/lib/evilrabbit"

export default function Home() {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-white text-black antialiased transition-colors duration-300 dark:bg-black dark:text-white">
      <header
        data-site-nav-inner
        className="fixed inset-x-0 top-0 z-30 flex h-16 items-center justify-between bg-white/80 px-6 backdrop-blur-sm transition-colors duration-300 dark:bg-black/80"
      >
        <span data-site-nav-logo className="text-[15px] font-medium leading-5">
          Evil Rabbit — Lifeline
        </span>
        <nav className="flex items-center gap-4 text-[13px] text-zinc-500">
          <a
            href="https://github.com/evilrabbit/lifeline"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-black dark:hover:text-white"
          >
            GitHub
          </a>
        </nav>
      </header>
      <main className="flex-1 min-h-0 overflow-y-auto pt-16 md:overflow-hidden">
        <Lifeline
          markers={evilrabbitLifeline.markers}
          birthYear={evilrabbitLifeline.birthYear}
          title={evilrabbitLifeline.name}
          className="h-full"
        />
      </main>
      <footer className="flex h-12 shrink-0 items-center justify-between px-6 text-[12px] text-zinc-400">
        <span className="hidden md:block">
          npx shadcn@latest add https://evilrabbit.com/r/lifeline.json
        </span>
        <span>MIT</span>
      </footer>
    </div>
  )
}
