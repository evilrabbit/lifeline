"use client"

import { useLayoutEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { LifelineDesktop } from "./lifeline-desktop"
import { LifelineFireworksProvider } from "./lifeline-fireworks"
import { LifelineVertical } from "./lifeline-vertical"
import { LIFELINE_MOBILE_BREAKPOINT } from "./lifeline-layout"
import type { LifelineProps } from "./types"

export function Lifeline(props: LifelineProps) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null)

  useLayoutEffect(() => {
    // Matches Tailwind's md: breakpoint so JS and CSS can never disagree.
    const query = window.matchMedia(
      `(min-width: ${LIFELINE_MOBILE_BREAKPOINT}px)`,
    )
    const update = () => setIsMobile(!query.matches)

    update()
    query.addEventListener("change", update)
    return () => query.removeEventListener("change", update)
  }, [])

  if (isMobile === null) {
    return <div className="invisible h-full min-h-[50vh]" aria-hidden="true" />
  }

  if (isMobile) {
    return (
      <LifelineFireworksProvider>
        <div className="pt-5">
          <LifelineVertical {...props} />
        </div>
      </LifelineFireworksProvider>
    )
  }

  return (
    <LifelineFireworksProvider>
      <LifelineDesktop
        {...props}
        className={cn("pt-5", props.className)}
      />
    </LifelineFireworksProvider>
  )
}