export const LIFELINE_LABEL_COLUMN_WIDTH = 56
export const LIFELINE_LABEL_GAP = 16
export const LIFELINE_STICKY_SHIELD_WIDTH =
  LIFELINE_LABEL_COLUMN_WIDTH + LIFELINE_LABEL_GAP
export const LIFELINE_STICKY_LEFT = 20

export function LifelineStickyLabels() {
  return (
    <div
      className="relative"
      style={{ width: LIFELINE_LABEL_COLUMN_WIDTH }}
      aria-hidden="true"
    >
      <div className="flex flex-col items-start text-left">
        <p className="mb-5 h-4 text-[11px] font-medium uppercase leading-4 tracking-[0.08em] text-zinc-500 transition-colors duration-300 dark:text-zinc-600">
          Age
        </p>
        <p className="mb-6 h-5 text-[11px] font-medium uppercase leading-5 tracking-[0.08em] text-zinc-500 transition-colors duration-300 dark:text-zinc-600">
          Years
        </p>
      </div>
    </div>
  )
}