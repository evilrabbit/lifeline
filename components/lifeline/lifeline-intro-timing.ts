import { clamp } from "./lifeline-utils"

/** Tweak these */
export const LIFELINE_SLOW_YEARS = 5
export const LIFELINE_SLOW_TIME_RATIO = 0.38
export const LIFELINE_SLOW_MARKER_FADE_MS = 720
export const LIFELINE_FAST_MARKER_FADE_MS = 280
/** Set > 0 to override auto-calibrated ease power */
export const LIFELINE_EASE_POWER = 0

function smoothstep(value: number) {
  const t = clamp(value, 0, 1)
  return t * t * (3 - 2 * t)
}

export function getSlowTrackWidth(widths: number[]) {
  return widths
    .slice(0, LIFELINE_SLOW_YEARS)
    .reduce((sum, width) => sum + width, 0)
}

export function getSlowTrackPortion(widths: number[]) {
  const total = widths.reduce((sum, width) => sum + width, 0)
  if (total <= 0) return 0
  return getSlowTrackWidth(widths) / total
}

function getEasePower(widths: number[]) {
  if (LIFELINE_EASE_POWER > 0) return LIFELINE_EASE_POWER

  const slowPortion = getSlowTrackPortion(widths)
  const softenedPivot = smoothstep(LIFELINE_SLOW_TIME_RATIO)

  if (slowPortion <= 0 || softenedPivot <= 0 || softenedPivot >= 1) {
    return 2.6
  }

  return Math.log(slowPortion) / Math.log(softenedPivot)
}

function softenedTime(elapsedMs: number, railMs: number) {
  return smoothstep(elapsedMs / railMs)
}

export function trackProgressAtTime(
  elapsedMs: number,
  widths: number[],
  railMs: number,
) {
  if (railMs <= 0) return 0

  const t = softenedTime(elapsedMs, railMs)
  const power = getEasePower(widths)

  return clamp(Math.pow(t, power), 0, 1)
}

export function timeAtTrackProgress(
  progress: number,
  widths: number[],
  railMs: number,
) {
  const clamped = clamp(progress, 0, 1)
  if (clamped <= 0) return 0
  if (clamped >= 1) return railMs

  const power = getEasePower(widths)
  const softened = Math.pow(clamped, 1 / power)

  return invertSmoothstep(softened) * railMs
}

function invertSmoothstep(value: number) {
  const target = clamp(value, 0, 1)
  let lo = 0
  let hi = 1

  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2
    if (smoothstep(mid) < target) lo = mid
    else hi = mid
  }

  return (lo + hi) / 2
}

export function isSlowIntroYear(index: number) {
  return index < LIFELINE_SLOW_YEARS
}

export function getTransitionMarkerFadeDuration(index: number) {
  if (index < LIFELINE_SLOW_YEARS) return LIFELINE_SLOW_MARKER_FADE_MS

  const rampYears = 3
  const rampIndex = index - LIFELINE_SLOW_YEARS
  if (rampIndex >= rampYears) return LIFELINE_FAST_MARKER_FADE_MS

  const t = (rampIndex + 1) / rampYears
  const blend = smoothstep(t)

  return Math.round(
    LIFELINE_SLOW_MARKER_FADE_MS +
      (LIFELINE_FAST_MARKER_FADE_MS - LIFELINE_SLOW_MARKER_FADE_MS) * blend,
  )
}