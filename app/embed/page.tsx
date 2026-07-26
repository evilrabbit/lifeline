import Link from "next/link"
import { Lifeline, LifelineLegend } from "@/components/lifeline"
import { DemoCompanyIcons } from "@/components/demo-company-icons"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { evilrabbitLifeline } from "@/lib/evilrabbit"

/**
 * The embedded case, deliberately without `LifelineShell` — that shell is
 * `h-dvh overflow-hidden`, the opposite of what a module inside a
 * scrolling page needs. Here the page scrolls, and each timeline is just
 * a box in the flow with a height the page chose.
 *
 * Two instances on purpose: one explicit `mode="embed"`, one left on the
 * default `"auto"`. The second is the only thing that catches a
 * regression in mode detection.
 */
export default function EmbedDemo() {
  return (
    <div className="min-h-dvh bg-white text-black antialiased transition-colors duration-300 dark:bg-black dark:text-white">
      <DemoCompanyIcons />

      <main className="mx-auto w-full max-w-5xl px-6 py-24">
        <header className="flex items-center justify-between">
          <Link
            href="/"
            className="text-sm text-zinc-500 transition-colors duration-300 hover:text-black dark:hover:text-white"
          >
            ← Lifeline
          </Link>
          <ThemeSwitcher />
        </header>

        <h1 className="mt-16 text-3xl font-medium tracking-tight">
          Lifeline, embedded
        </h1>

        <div className="mt-6 space-y-4 text-zinc-500">
          <p>
            This page scrolls. The timeline below is one module in it, not the
            page itself — so it does not take the scroll away from you. Rest
            the pointer over it and scroll: the rail runs sideways. Keep
            going, and when the rail reaches its end the page picks the scroll
            back up and carries on down. Coming back up works the same way in
            reverse.
          </p>
          <p>
            Nothing is pinned and nothing is faked with a tall spacer. The
            module stays exactly where the layout put it; only the wheel is
            borrowed, and only while there is still rail left to travel.
          </p>
        </div>

        <div className="mt-16 h-[600px] w-full overflow-hidden rounded-xl border border-black/10 transition-colors duration-300 dark:border-white/10">
          <Lifeline
            mode="embed"
            markers={evilrabbitLifeline.markers}
            birthYear={evilrabbitLifeline.birthYear}
            title={`${evilrabbitLifeline.name} — embedded`}
            className="h-full"
          />
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-zinc-500">
          <span>
            <code className="text-black dark:text-white">mode=&quot;embed&quot;</code>{" "}
            in a 600px box
          </span>
          <LifelineLegend />
        </div>

        <div className="mt-24 space-y-4 text-zinc-500">
          <p>
            Below is the same timeline with no <code>mode</code> at all, left
            on the default <code>&quot;auto&quot;</code>. It resolves to
            embedded here without being told: it does not cover the viewport,
            and there is plainly page left to scroll behind it.
          </p>
          <p>
            The same component with the same default, dropped into a page that
            is nothing but the timeline, resolves the other way and owns the
            wheel outright.
          </p>
        </div>

        <div className="mt-16 h-[520px] w-full overflow-hidden rounded-xl border border-black/10 transition-colors duration-300 dark:border-white/10">
          <Lifeline
            markers={evilrabbitLifeline.markers}
            birthYear={evilrabbitLifeline.birthYear}
            title={`${evilrabbitLifeline.name} — auto`}
            className="h-full"
          />
        </div>

        <p className="mt-4 text-sm text-zinc-500">
          No <code className="text-black dark:text-white">mode</code> — resolved
          automatically
        </p>

        <div className="mt-24 space-y-4 pb-16 text-zinc-500">
          <p>
            Room to scroll past. If the wheel had been swallowed at the end of
            either rail above, you would not have reached this paragraph
            without lifting the pointer off the module — which is the whole
            bug this mode exists to avoid.
          </p>
        </div>
      </main>
    </div>
  )
}
