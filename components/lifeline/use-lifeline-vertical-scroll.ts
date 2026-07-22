"use client"

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import { clamp } from "./lifeline-utils"

function getScrollParent(element: HTMLElement | null): HTMLElement | null {
  let node = element?.parentElement ?? null

  while (node) {
    const { overflowY } = window.getComputedStyle(node)
    if (overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay") {
      return node
    }
    node = node.parentElement
  }

  return null
}

interface LifelineVerticalScrollOptions {
  introLocked?: boolean
  introAnimating?: boolean
  introSkipped?: boolean
  introRailMs?: number
  introGetTrackProgress?: (elapsedMs: number) => number
  onIntroSettleComplete?: () => void
  onIntroScrollStart?: () => void
}

export function useLifelineVerticalScroll(
  markerCount: number,
  options: LifelineVerticalScrollOptions = {},
) {
  const sectionRef = useRef<HTMLElement>(null)
  const entryRefs = useRef<(HTMLLIElement | null)[]>([])
  const maxScrollRef = useRef(0)
  const scrollParentRef = useRef<HTMLElement | null>(null)
  const initialized = useRef(false)
  const introLockedRef = useRef(options.introLocked ?? false)
  const introAnimatingRef = useRef(options.introAnimating ?? false)
  const introSkippedRef = useRef(options.introSkipped ?? false)
  const onIntroSettleCompleteRef = useRef(options.onIntroSettleComplete)
  const onIntroScrollStartRef = useRef(options.onIntroScrollStart)
  const introGetTrackProgressRef = useRef(options.introGetTrackProgress)
  const introStartedRef = useRef(false)
  const introScrollId = useRef(0)
  const introScrollStart = useRef(0)
  const introWasAnimatingRef = useRef(false)
  const scheduleMeasureRef = useRef<() => void>(() => {})
  const [isLayoutReady, setIsLayoutReady] = useState(false)

  introLockedRef.current = options.introLocked ?? false
  introAnimatingRef.current = options.introAnimating ?? false
  introSkippedRef.current = options.introSkipped ?? false
  onIntroSettleCompleteRef.current = options.onIntroSettleComplete
  onIntroScrollStartRef.current = options.onIntroScrollStart
  introGetTrackProgressRef.current = options.introGetTrackProgress

  const setEntryRef = useCallback((index: number, node: HTMLLIElement | null) => {
    entryRefs.current[index] = node

    if (index === markerCount - 1 && node) {
      scheduleMeasureRef.current()
    }
  }, [markerCount])

  const applyScroll = useCallback((value: number) => {
    const scrollParent = scrollParentRef.current
    if (!scrollParent) return

    scrollParent.scrollTop = clamp(value, 0, maxScrollRef.current)
  }, [])

  const measureLayout = useCallback(() => {
    const section = sectionRef.current
    if (!section) return 0

    const scrollParent = getScrollParent(section)
    scrollParentRef.current = scrollParent

    if (!scrollParent) return 0

    const heights = entryRefs.current.map((entry) => entry?.offsetHeight ?? 0)
    if (heights.length < markerCount || heights.some((height) => height <= 0)) {
      return 0
    }

    const max = Math.max(0, scrollParent.scrollHeight - scrollParent.clientHeight)
    maxScrollRef.current = max

    return max
  }, [markerCount])

  useLayoutEffect(() => {
    entryRefs.current.length = markerCount
  }, [markerCount])

  useLayoutEffect(() => {
    const max = measureLayout()

    const scrollParent = scrollParentRef.current
    if (!scrollParent) return

    if (!initialized.current) {
      scrollParent.scrollTop = introSkippedRef.current ? max : 0
      initialized.current = true
    }

    setIsLayoutReady(entryRefs.current.every((entry) => Boolean(entry)))
    // Sync initial position once before first paint; resize uses measure().
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!isLayoutReady) return
    if (options.introSkipped || !options.introAnimating) {
      cancelAnimationFrame(introScrollId.current)
      introScrollId.current = 0
      introStartedRef.current = false
      return
    }

    introWasAnimatingRef.current = true
    const railMs = options.introRailMs ?? 3200

    const step = (now: number) => {
      const max = maxScrollRef.current

      if (!introStartedRef.current) {
        introStartedRef.current = true
        introScrollStart.current = now
        onIntroScrollStartRef.current?.()
        sectionRef.current?.style.setProperty("--lifeline-intro-progress", "0")
        if (max > 0) applyScroll(0)
      }

      const elapsed = now - introScrollStart.current
      const progress = introGetTrackProgressRef.current
        ? clamp(introGetTrackProgressRef.current(elapsed), 0, 1)
        : clamp(elapsed / railMs, 0, 1)

      sectionRef.current?.style.setProperty(
        "--lifeline-intro-progress",
        String(progress),
      )

      if (max > 0) {
        applyScroll(progress * max)
      }

      if (progress < 1) {
        introScrollId.current = requestAnimationFrame(step)
        return
      }

      sectionRef.current?.style.setProperty("--lifeline-intro-progress", "1")
      if (max > 0) applyScroll(max)
      introScrollId.current = 0
    }

    introScrollId.current = requestAnimationFrame(step)

    return () => {
      cancelAnimationFrame(introScrollId.current)
      introScrollId.current = 0
      introStartedRef.current = false
    }
  }, [
    applyScroll,
    isLayoutReady,
    options.introAnimating,
    options.introRailMs,
    options.introSkipped,
  ])

  useEffect(() => {
    if (options.introSkipped) return
    if (options.introAnimating) return
    if (!introWasAnimatingRef.current) return

    introWasAnimatingRef.current = false
    sectionRef.current?.style.removeProperty("--lifeline-intro-progress")
    onIntroSettleCompleteRef.current?.()
  }, [options.introAnimating, options.introSkipped])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    let frameId = 0
    let resizeObserver: ResizeObserver | null = null

    const measure = () => {
      measureLayout()

      const scrollParent = scrollParentRef.current
      if (!scrollParent) return

      if (!(introAnimatingRef.current && introStartedRef.current)) {
        scrollParent.scrollTop = clamp(
          scrollParent.scrollTop,
          0,
          maxScrollRef.current,
        )
      }

      setIsLayoutReady(
        entryRefs.current.length === markerCount &&
          entryRefs.current.every((entry) => Boolean(entry)),
      )
    }

    const scheduleMeasure = () => {
      cancelAnimationFrame(frameId)
      frameId = requestAnimationFrame(measure)
    }

    scheduleMeasureRef.current = scheduleMeasure

    scheduleMeasure()
    frameId = requestAnimationFrame(() => {
      measure()
      requestAnimationFrame(measure)
    })

    resizeObserver = new ResizeObserver(scheduleMeasure)
    resizeObserver.observe(section)

    window.addEventListener("resize", scheduleMeasure)

    const isScrollLocked = () =>
      introLockedRef.current && introStartedRef.current

    const preventScroll = (event: Event) => {
      if (!isScrollLocked()) return
      event.preventDefault()
    }

    const scrollParent = getScrollParent(section)
    scrollParentRef.current = scrollParent

    scrollParent?.addEventListener("wheel", preventScroll, { passive: false })
    scrollParent?.addEventListener("touchmove", preventScroll, { passive: false })

    return () => {
      cancelAnimationFrame(frameId)
      resizeObserver?.disconnect()
      window.removeEventListener("resize", scheduleMeasure)
      scrollParent?.removeEventListener("wheel", preventScroll)
      scrollParent?.removeEventListener("touchmove", preventScroll)
      initialized.current = false
    }
  }, [markerCount, measureLayout])

  return {
    sectionRef,
    setEntryRef,
    isLayoutReady,
  }
}