import type { ComponentType } from "react"
import { cn } from "@/lib/utils"

export type CompanyIconId = string

export interface CompanyIconEntry {
  icon: ComponentType<{ className?: string }>
  /** Tailwind size for the mark — wordmarks want a wide box. */
  sizeClassName?: string
}

const registry: Record<string, CompanyIconEntry> = {}

/**
 * Map your organization ids to icon components. Call once at module
 * scope, from a module that loads before the timeline renders:
 *
 *   registerCompanyIcons({
 *     acme: { icon: AcmeIcon, sizeClassName: "h-4 w-4" },
 *   })
 *
 * Unregistered ids fall back to the name's initial in a small ring,
 * so a timeline reads cleanly before you've drawn a single logo.
 */
export function registerCompanyIcons(
  entries: Record<string, CompanyIconEntry>,
) {
  Object.assign(registry, entries)
}

export function CompanyIcon({
  id,
  label,
  className,
}: {
  id: CompanyIconId
  label: string
  className?: string
}) {
  const entry = registry[id]

  if (entry) {
    const Icon = entry.icon
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center text-black transition-colors duration-300 dark:text-white",
          entry.sizeClassName ?? "h-4 w-4",
          className,
        )}
        aria-label={label}
        title={label}
      >
        <Icon className="h-full w-full" />
      </span>
    )
  }

  return (
    <span
      title={label}
      aria-label={label}
      className={cn(
        "inline-flex h-5 w-5 select-none items-center justify-center rounded-full text-[10px] font-semibold uppercase leading-none ring-1 ring-current/30",
        className,
      )}
    >
      {label.charAt(0)}
    </span>
  )
}
