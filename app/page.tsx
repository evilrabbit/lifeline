import Link from "next/link"
import { Lifeline, LifelineLegend } from "@/components/lifeline"
import {
  LifelineFooter,
  LifelineNav,
  LifelineShell,
  LifelineStage,
} from "@/components/lifeline-shell"
import { DemoCompanyIcons } from "@/components/demo-company-icons"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { CopyCommand } from "@/components/copy-command"
import { RabbitLogo } from "@/components/rabbit-logo"
import { evilrabbitLifeline } from "@/lib/evilrabbit"

export default function Home() {
  return (
    <LifelineShell>
      {/* The same shell the registry ships as `page` — the nav's
          capped inner container is what the rail aligns its start and
          end to. */}
      <LifelineNav
        logo={<RabbitLogo className="h-6 w-6" />}
        logoLabel="Evil Rabbit — Lifeline"
      >
        <Link
          href="/embed"
          className="text-sm text-zinc-500 transition-colors duration-300 hover:text-black dark:hover:text-white"
        >
          Embedded
        </Link>
        <a
          href="https://github.com/evilrabbit/lifeline"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-zinc-500 transition-colors duration-300 hover:text-black dark:hover:text-white"
        >
          GitHub
        </a>
      </LifelineNav>

      <DemoCompanyIcons />

      <LifelineStage>
        <Lifeline
          markers={evilrabbitLifeline.markers}
          birthYear={evilrabbitLifeline.birthYear}
          title={evilrabbitLifeline.name}
          className="h-full"
        />
      </LifelineStage>

      <LifelineFooter>
        <div className="flex items-center gap-6">
          <ThemeSwitcher />
          <LifelineLegend />
        </div>
        <CopyCommand command="npx shadcn add evilrabbit/lifeline/personal" />
      </LifelineFooter>
    </LifelineShell>
  )
}
