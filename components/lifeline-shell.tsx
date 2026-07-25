import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

/**
 * The page framing the Lifeline expects.
 *
 * The rail is not sized by CSS — on desktop it measures where to start
 * and end from the nav: `data-site-nav-logo` gives it the start, and the
 * right edge of `data-site-nav-inner` gives it the end. That is what
 * keeps the timeline inset from the viewport and aligned with the rest
 * of the page, and it's the span the intro animation draws across.
 *
 * Change `containerClassName` on both the nav and the footer together
 * and the rail follows. Drop the nav entirely and the rail falls back
 * to filling its own container, edge to edge.
 */

const CONTAINER = "mx-auto flex w-full max-w-5xl items-center px-6"

export function LifelineShell({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex h-dvh flex-col overflow-hidden bg-white text-black antialiased transition-colors duration-300 dark:bg-black dark:text-white",
        className,
      )}
    >
      {children}
    </div>
  )
}

export function LifelineNav({
  logo,
  logoHref = "/",
  logoLabel = "Home",
  children,
  className,
  containerClassName,
}: {
  /** Rendered inside the marked anchor — the rail starts at its left edge. */
  logo: ReactNode
  logoHref?: string
  /** Accessible name for the logo link. */
  logoLabel?: string
  /** Anything on the right: links, a theme switcher. */
  children?: ReactNode
  className?: string
  containerClassName?: string
}) {
  return (
    <nav
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b border-black/10 bg-white/80 backdrop-blur-xl transition-colors duration-300 dark:border-white/10 dark:bg-black/80",
        className,
      )}
    >
      <div
        data-site-nav-inner
        className={cn(CONTAINER, "h-16 justify-between", containerClassName)}
      >
        <a
          href={logoHref}
          data-site-nav-logo
          aria-label={logoLabel}
          className="text-black transition-[color,opacity] duration-300 hover:opacity-70 dark:text-white"
        >
          {logo}
        </a>

        {children ? (
          <div className="flex items-center gap-8">{children}</div>
        ) : null}
      </div>
    </nav>
  )
}

/**
 * The stage. `pt-16` clears the fixed nav; `md:overflow-hidden` hands
 * scrolling to the horizontal scrub above the mobile breakpoint.
 */
export function LifelineStage({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <main
      className={cn(
        "flex-1 min-h-0 overflow-y-auto pt-16 md:overflow-hidden",
        className,
      )}
    >
      {children}
    </main>
  )
}

export function LifelineFooter({
  children,
  className,
  containerClassName,
}: {
  children?: ReactNode
  className?: string
  containerClassName?: string
}) {
  return (
    <footer
      className={cn(
        "shrink-0 border-t border-black/10 bg-white/95 backdrop-blur-sm transition-colors duration-300 dark:border-white/10 dark:bg-black/95",
        className,
      )}
    >
      <div
        className={cn(
          CONTAINER,
          "h-16 justify-between gap-6",
          containerClassName,
        )}
      >
        {children}
      </div>
    </footer>
  )
}
