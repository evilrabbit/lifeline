"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  getTransitionMarkerFadeDuration,
  LIFELINE_FAST_MARKER_FADE_MS,
  timeAtTrackProgress,
  trackProgressAtTime,
} from "./lifeline-intro-timing"

/** Tweak these */
export const LIFELINE_LABELS_MS = 600
export const LIFELINE_RAIL_MS = 3200
/**
 * Track length (px on desktop, tall lifelines on mobile) the base rail
 * duration was tuned for — roughly a 40-year personal lifeline. Longer
 * tracks slow the sweep sublinearly so dense timelines stay readable,
 * capped so a 250-year nation doesn't become a screensaver.
 */
export const LIFELINE_REFERENCE_TRACK = 9000
export const LIFELINE_RAIL_MAX_MS = 7200
export const LIFELINE_RAIL_SCALE_POWER = 0.45
/**
 * Keep fade stretching subtle — long fades lag behind the sweeping
 * line and read as out of sync.
 */
export const LIFELINE_FADE_SCALE_MAX = 1.5

export function useLifelineIntro(markerWidths: number[]) {
  // Skip straight to the settled end state for users who prefer reduced motion.
  const [shouldPlay] = useState(
    () =>
      typeof window === "undefined" ||
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  )
  const [isPlaying, setIsPlaying] = useState(true)
  const [isComplete, setIsComplete] = useState(false)
  const introTimeoutRef = useRef(0)

  const totalMarkersWidth = useMemo(
    () => markerWidths.reduce((sum, width) => sum + width, 0),
    [markerWidths],
  )

  const railDuration = useMemo(() => {
    if (totalMarkersWidth <= LIFELINE_REFERENCE_TRACK) return LIFELINE_RAIL_MS

    const scale = Math.pow(
      totalMarkersWidth / LIFELINE_REFERENCE_TRACK,
      LIFELINE_RAIL_SCALE_POWER,
    )
    return Math.min(LIFELINE_RAIL_MAX_MS, Math.round(LIFELINE_RAIL_MS * scale))
  }, [totalMarkersWidth])

  // Stretch each marker's fade with the sweep so dense timelines bloom
  // in a trailing wave instead of flickering past.
  const fadeScale = Math.min(
    LIFELINE_FADE_SCALE_MAX,
    railDuration / LIFELINE_RAIL_MS,
  )

  const introDuration =
    railDuration + Math.round(LIFELINE_FAST_MARKER_FADE_MS * fadeScale)

  const getTrackProgressAtTime = useCallback(
    (elapsedMs: number) => {
      if (!shouldPlay || totalMarkersWidth <= 0) {
        return Math.min(elapsedMs / railDuration, 1)
      }

      return trackProgressAtTime(elapsedMs, markerWidths, railDuration)
    },
    [markerWidths, railDuration, shouldPlay, totalMarkersWidth],
  )

  const getMarkerDelay = useCallback(
    (index: number) => {
      if (!shouldPlay || totalMarkersWidth <= 0) return 0

      const offset = markerWidths
        .slice(0, index)
        .reduce((sum, width) => sum + width, 0)

      return timeAtTrackProgress(
        offset / totalMarkersWidth,
        markerWidths,
        railDuration,
      )
    },
    [markerWidths, railDuration, shouldPlay, totalMarkersWidth],
  )

  const getMarkerFadeDuration = useCallback(
    (index: number) => {
      return Math.round(getTransitionMarkerFadeDuration(index) * fadeScale)
    },
    [fadeScale],
  )

  const completeIntro = useCallback(() => {
    setIsComplete(true)
  }, [])

  const startIntroTimer = useCallback(() => {
    window.clearTimeout(introTimeoutRef.current)
    setIsPlaying(true)
    setIsComplete(false)

    introTimeoutRef.current = window.setTimeout(() => {
      setIsPlaying(false)
    }, introDuration)
  }, [introDuration])

  useEffect(() => {
    return () => window.clearTimeout(introTimeoutRef.current)
  }, [])

  return {
    shouldPlay,
    isPlaying,
    isComplete,
    labelsDuration: LIFELINE_LABELS_MS,
    railDuration,
    getTrackProgressAtTime,
    getMarkerDelay,
    getMarkerFadeDuration,
    startIntroTimer,
    completeIntro,
  }
}