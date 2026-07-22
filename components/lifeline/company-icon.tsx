import type { ComponentType } from "react"
import { cn } from "@/lib/utils"

/**
 * Inline logos for the companies/organizations on a timeline.
 *
 * Map your own ids to icon components here — anything that accepts a
 * className and renders an SVG. Unmapped ids fall back to the name's
 * initial in a small ring, so a timeline works before you've drawn a
 * single logo.
 */
export type CompanyIconId = string

const icons: Record<string, ComponentType<{ className?: string }>> = {
  // "acme": AcmeIcon,
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
  const Icon = icons[id]

  if (Icon) {
    return (
      <span title={label} className="inline-flex">
        <Icon className={cn("h-5 w-5", className)} />
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
