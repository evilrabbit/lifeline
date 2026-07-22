"use client"

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import {
  LIFELINE_STICKY_LEFT,
  LIFELINE_STICKY_SHIELD_WIDTH,
} from "./lifeline-labels"
import { clamp } from "./lifeline-utils"

const NAV_HEIGHT = 64
const FOOTER_HEIGHT = 64
const FADE_ZONE = 200
const FADE_ZONE_COARSE = 72
const LEFT_EXIT_FADE_ZONE = 400
const LEFT_EXIT_FADE_ZONE_COARSE = 160
const WHEEL_SPEED = 1.4
const WHEEL_VELOCITY_FRAME_MS = 16.67
const WHEEL_MOMENTUM_BLEND = 0.65
const DRAG_SPEED = 1
const TOUCH_DRAG_SPEED = 1.15
const TOUCH_GESTURE_LOCK_PX = 8
const NAV_HORIZONTAL_PADDING = 24
const MOMENTUM_FRICTION = 0.94
const MOMENTUM_MIN_VELOCITY = 0.025
const MOMENTUM_MIN_START = 0.08

function normalizeWheelDelta(event: WheelEvent) {
  let delta = Math.abs(event.deltaX) > Math.abs(event.deltaY)
    ? event.deltaX
    : event.deltaY

  if (event.deltaMode === 1) delta *= 16
  if (event.deltaMode === 2) delta *= window.innerHeight

  return delta
}

function isInteractiveTarget(target: EventTarget | null) {
  // Pointer capture during drag retargets clicks to the section, so
  // anything clickable must opt out of drag-start here.
  return (
    target instanceof Element &&
    Boolean(target.closest("a, button, [data-lifeline-interactive]"))
  )
}

function isInStage(clientY: number, isCoarsePointer: boolean) {
  if (isCoarsePointer) return clientY >= NAV_HEIGHT

  return (
    clientY >= NAV_HEIGHT &&
    clientY <= window.innerHeight - FOOTER_HEIGHT
  )
}

interface LifelineScrollOptions {
  isCoarsePointer?: boolean
  introLocked?: boolean
  introAnimating?: boolean
  introSkipped?: boolean
  introRailMs?: number
  introGetTrackProgress?: (elapsedMs: number) => number
  onIntroSettleComplete?: () => void
  onIntroScrollStart?: () => void
}

export function useLifelineScroll(
  markerCount: number,
  options: LifelineScrollOptions = {},
) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const labelsRef = useRef<HTMLDivElement>(null)
  const markerRefs = useRef<(HTMLDivElement | null)[]>([])
  const maxTranslate = useRef(0)
  const startInset = useRef(24)
  const endInset = useRef(0)
  const translatePx = useRef(0)
  const initialized = useRef(false)
  const dragging = useRef(false)
  const gestureAxis = useRef<"x" | "y" | null>(null)
  const gestureStart = useRef({ x: 0, y: 0 })
  const dragOrigin = useRef({ x: 0, translate: 0 })
  const dragVelocity = useRef(0)
  const lastPointerSample = useRef({ x: 0, t: 0 })
  const activePointerId = useRef<number | null>(null)
  const isCoarsePointerRef = useRef(options.isCoarsePointer ?? false)
  const momentumId = useRef(0)
  const settleId = useRef(0)
  const introLockedRef = useRef(options.introLocked ?? false)
  const introAnimatingRef = useRef(options.introAnimating ?? false)
  const introSkippedRef = useRef(options.introSkipped ?? false)
  const onIntroSettleCompleteRef = useRef(options.onIntroSettleComplete)
  const onIntroScrollStartRef = useRef(options.onIntroScrollStart)
  const settlingRef = useRef(false)
  const introWasAnimatingRef = useRef(false)
  const introScrollId = useRef(0)
  const introScrollStart = useRef(0)
  const introStartedRef = useRef(false)
  const introGetTrackProgressRef = useRef(options.introGetTrackProgress)
  const applyTranslateRef = useRef<(value: number) => void>(() => {})
  const scheduleMeasureRef = useRef<() => void>(() => {})
  const [isLayoutReady, setIsLayoutReady] = useState(false)

  isCoarsePointerRef.current = options.isCoarsePointer ?? false
  introLockedRef.current = options.introLocked ?? false
  introAnimatingRef.current = options.introAnimating ?? false
  introSkippedRef.current = options.introSkipped ?? false
  onIntroSettleCompleteRef.current = options.onIntroSettleComplete
  onIntroScrollStartRef.current = options.onIntroScrollStart
  introGetTrackProgressRef.current = options.introGetTrackProgress

  const setMarkerRef = useCallback(
    (index: number, node: HTMLDivElement | null) => {
      markerRefs.current[index] = node

      if (index === markerCount - 1 && node) {
        scheduleMeasureRef.current()
      }
    },
    [markerCount],
  )

  const getLabelViewportLeft = useCallback((translate: number) => {
    const section = sectionRef.current
    if (!section) return { isSticky: false, labelLeft: 0 }

    const stageLeft = section.getBoundingClientRect().left
    const naturalLeft = stageLeft + startInset.current - translate
    const isSticky = naturalLeft <= LIFELINE_STICKY_LEFT

    return {
      isSticky,
      labelLeft: isSticky ? LIFELINE_STICKY_LEFT : naturalLeft,
    }
  }, [])

  const applyLabelSticky = useCallback(
    (translate: number) => {
      const section = sectionRef.current
      const labels = labelsRef.current
      const { isSticky, labelLeft } = getLabelViewportLeft(translate)

      if (!section || !labels) return { isSticky, labelLeft }

      if (isSticky) {
        const stageLeft = section.getBoundingClientRect().left
        const labelExtra =
          LIFELINE_STICKY_LEFT - stageLeft - startInset.current + translate
        labels.style.transform = `translate3d(${labelExtra}px, 0, 0)`
        labels.classList.add("is-pinned")
      } else {
        labels.style.transform = ""
        labels.classList.remove("is-pinned")
      }

      return { isSticky, labelLeft }
    },
    [getLabelViewportLeft],
  )

  const isScrollLocked = useCallback(() => {
    return (
      (introLockedRef.current && introStartedRef.current) ||
      settlingRef.current
    )
  }, [])

  const updateFades = useCallback(() => {
    if (settlingRef.current) return

    const width = window.innerWidth
    const isCoarse = isCoarsePointerRef.current
    const fadeZone = isCoarse ? FADE_ZONE_COARSE : FADE_ZONE
    const leftFadeZone = isCoarse
      ? LEFT_EXIT_FADE_ZONE_COARSE
      : LEFT_EXIT_FADE_ZONE

    markerRefs.current.forEach((marker) => {
      if (!marker) return

      const rect = marker.getBoundingClientRect()
      const center = rect.left + rect.width / 2

      let opacity = 1

      // Fade a marker out only as scrubbing carries it left of where
      // it rests at translate 0 — the first markers naturally live
      // inside the fade zone and must not open dimmed.
      const naturalLeft = rect.left + translatePx.current
      const restLeft = Math.min(naturalLeft, leftFadeZone)
      if (rect.left < restLeft) {
        opacity = rect.left <= 0 ? 0 : rect.left / restLeft
      }

      if (center > width - fadeZone) {
        opacity = Math.min(opacity, (width - center) / fadeZone)
      }

      if (isCoarse) {
        const readableLeft = LIFELINE_STICKY_SHIELD_WIDTH
        const readableRight = width - 12
        const visibleWidth =
          Math.min(rect.right, readableRight) - Math.max(rect.left, readableLeft)
        const visibility = rect.width > 0 ? visibleWidth / rect.width : 0

        if (visibility >= 0.5) {
          opacity = 1
        }
      }

      marker.style.opacity = String(clamp(opacity, 0, 1))
    })
  }, [])

  const applyTranslate = useCallback(
    (value: number) => {
      const max = maxTranslate.current
      const next = clamp(value, 0, max)
      translatePx.current = next

      if (trackRef.current) {
        trackRef.current.style.transform = `translate3d(${startInset.current - next}px, 0, 0)`
      }

      applyLabelSticky(next)
      updateFades()
    },
    [applyLabelSticky, updateFades],
  )

  applyTranslateRef.current = applyTranslate

  const measureLayout = useCallback(() => {
    const track = trackRef.current
    const section = sectionRef.current
    if (!track || !section) return 0

    const stageRect = section.getBoundingClientRect()
    const navLogo = document.querySelector("[data-site-nav-logo]")
    const navInner = document.querySelector("[data-site-nav-inner]")

    if (navLogo) {
      const logoRect = navLogo.getBoundingClientRect()
      startInset.current = logoRect.left - stageRect.left
    }

    if (navInner) {
      const navRect = navInner.getBoundingClientRect()
      endInset.current =
        navRect.right - stageRect.left - NAV_HORIZONTAL_PADDING
    } else {
      // No host nav to align with ([data-site-nav-inner] missing) —
      // end the track at the stage's own right edge instead.
      endInset.current = stageRect.width - NAV_HORIZONTAL_PADDING
    }

    const lastMarker = markerRefs.current[markerCount - 1]
    const lastMarkerRight = lastMarker
      ? LIFELINE_STICKY_SHIELD_WIDTH +
        lastMarker.offsetLeft +
        lastMarker.offsetWidth
      : track.scrollWidth

    const max = Math.max(
      0,
      startInset.current + lastMarkerRight - endInset.current,
    )
    maxTranslate.current = max

    return max
  }, [markerCount])

  useLayoutEffect(() => {
    markerRefs.current.length = markerCount
  }, [markerCount])

  useLayoutEffect(() => {
    const max = measureLayout()
    if (max <= 0) return

    if (!initialized.current) {
      translatePx.current = introSkippedRef.current ? max : 0
      initialized.current = true
    }

    applyTranslate(translatePx.current)
    setIsLayoutReady(true)
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
      const max = maxTranslate.current

      if (max <= 0) {
        introScrollId.current = requestAnimationFrame(step)
        return
      }

      if (!introStartedRef.current) {
        introStartedRef.current = true
        introScrollStart.current = now
        onIntroScrollStartRef.current?.()
        sectionRef.current?.style.setProperty("--lifeline-intro-progress", "0")
        applyTranslateRef.current(0)
      }

      const elapsed = now - introScrollStart.current
      const progress = introGetTrackProgressRef.current
        ? clamp(introGetTrackProgressRef.current(elapsed), 0, 1)
        : clamp(elapsed / railMs, 0, 1)

      sectionRef.current?.style.setProperty(
        "--lifeline-intro-progress",
        String(progress),
      )
      applyTranslateRef.current(progress * max)

      if (progress < 1) {
        introScrollId.current = requestAnimationFrame(step)
        return
      }

      sectionRef.current?.style.setProperty("--lifeline-intro-progress", "1")
      applyTranslateRef.current(max)
      introScrollId.current = 0
    }

    introScrollId.current = requestAnimationFrame(step)

    return () => {
      cancelAnimationFrame(introScrollId.current)
      introScrollId.current = 0
      introStartedRef.current = false
    }
  }, [
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
    markerRefs.current.forEach((marker) => {
      if (marker) marker.style.opacity = ""
    })
    updateFades()
    onIntroSettleCompleteRef.current?.()
  }, [
    options.introAnimating,
    options.introSkipped,
    updateFades,
  ])

  useEffect(() => {
    const html = document.documentElement
    const body = document.body

    html.classList.add("lifeline-scroll")
    const previousHtmlOverflow = html.style.overflow
    const previousBodyOverflow = body.style.overflow
    html.style.overflow = "hidden"
    body.style.overflow = "hidden"
    window.scrollTo(0, 0)

    return () => {
      html.classList.remove("lifeline-scroll")
      html.style.overflow = previousHtmlOverflow
      body.style.overflow = previousBodyOverflow
      initialized.current = false
    }
  }, [])

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    let frameId = 0
    let resizeObserver: ResizeObserver | null = null

    const stopMomentum = () => {
      cancelAnimationFrame(momentumId.current)
      momentumId.current = 0
    }

    const startMomentum = () => {
      if (Math.abs(dragVelocity.current) < MOMENTUM_MIN_START) return

      stopMomentum()
      let lastFrameTime = performance.now()

      const step = (now: number) => {
        const dt = Math.min(now - lastFrameTime, 32)
        lastFrameTime = now

        const velocity = dragVelocity.current
        if (Math.abs(velocity) < MOMENTUM_MIN_VELOCITY) {
          dragVelocity.current = 0
          momentumId.current = 0
          return
        }

        const max = maxTranslate.current
        const next = clamp(translatePx.current + velocity * dt, 0, max)

        if (next !== translatePx.current) {
          applyTranslate(next)
        }

        if (next <= 0 || next >= max) {
          dragVelocity.current = 0
          momentumId.current = 0
          return
        }

        dragVelocity.current =
          velocity * Math.pow(MOMENTUM_FRICTION, dt / 16.67)
        momentumId.current = requestAnimationFrame(step)
      }

      momentumId.current = requestAnimationFrame(step)
    }

    const measure = () => {
      const max = measureLayout()
      if (max <= 0) return

      translatePx.current = clamp(translatePx.current, 0, max)

      // During intro scroll, the rAF loop owns translate — only refresh bounds.
      if (!(introAnimatingRef.current && introStartedRef.current)) {
        applyTranslate(translatePx.current)
      }

      setIsLayoutReady(true)
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
    if (trackRef.current) resizeObserver.observe(trackRef.current)

    window.addEventListener("resize", scheduleMeasure)

    const onWheel = (event: WheelEvent) => {
      if (!isInStage(event.clientY, isCoarsePointerRef.current)) return
      if (isScrollLocked()) return

      if (maxTranslate.current <= 0) {
        scheduleMeasure()
        return
      }

      event.preventDefault()

      const delta = normalizeWheelDelta(event)
      const movement = -delta * WHEEL_SPEED

      applyTranslate(translatePx.current + movement)

      const impulse = (movement / WHEEL_VELOCITY_FRAME_MS) * 0.35
      dragVelocity.current =
        dragVelocity.current * (1 - WHEEL_MOMENTUM_BLEND) +
        impulse * WHEEL_MOMENTUM_BLEND

      if (momentumId.current === 0) {
        startMomentum()
      }
    }

    const beginDrag = (event: PointerEvent) => {
      stopMomentum()
      dragVelocity.current = 0
      dragging.current = true
      activePointerId.current = event.pointerId
      dragOrigin.current = { x: event.clientX, translate: translatePx.current }
      lastPointerSample.current = {
        x: event.clientX,
        t: performance.now(),
      }

      if (section.setPointerCapture) {
        section.setPointerCapture(event.pointerId)
      }

      section.style.cursor = "grabbing"
      section.style.touchAction = "none"
    }

    const onPointerDown = (event: PointerEvent) => {
      if (!isInStage(event.clientY, isCoarsePointerRef.current)) return
      if (isScrollLocked()) return
      if (isInteractiveTarget(event.target)) return
      if (maxTranslate.current <= 0) return
      if (activePointerId.current !== null) return

      gestureAxis.current = null
      gestureStart.current = { x: event.clientX, y: event.clientY }

      if (event.pointerType === "touch") {
        activePointerId.current = event.pointerId
        return
      }

      beginDrag(event)
    }

    const onPointerMove = (event: PointerEvent) => {
      if (activePointerId.current !== null && event.pointerId !== activePointerId.current) {
        return
      }

      if (!dragging.current && event.pointerType === "touch") {
        const deltaX = event.clientX - gestureStart.current.x
        const deltaY = event.clientY - gestureStart.current.y

        if (gestureAxis.current === null) {
          if (
            Math.abs(deltaX) < TOUCH_GESTURE_LOCK_PX &&
            Math.abs(deltaY) < TOUCH_GESTURE_LOCK_PX
          ) {
            return
          }

          gestureAxis.current =
            Math.abs(deltaX) >= Math.abs(deltaY) ? "x" : "y"

          if (gestureAxis.current === "y") {
            activePointerId.current = null
            return
          }

          beginDrag(event)
        }
      }

      if (!dragging.current) return

      if (event.pointerType === "touch") {
        event.preventDefault()
      }

      const now = performance.now()
      const sample = lastPointerSample.current
      const elapsed = now - sample.t
      const dragSpeed = event.pointerType === "touch" ? TOUCH_DRAG_SPEED : DRAG_SPEED

      if (elapsed > 0 && elapsed < 80) {
        const instantVelocity =
          (-(event.clientX - sample.x) / elapsed) * dragSpeed
        dragVelocity.current =
          instantVelocity * 0.65 + dragVelocity.current * 0.35
      }

      lastPointerSample.current = { x: event.clientX, t: now }

      const deltaX = event.clientX - dragOrigin.current.x
      applyTranslate(dragOrigin.current.translate - deltaX * dragSpeed)
    }

    const endDrag = (event: PointerEvent) => {
      if (activePointerId.current !== null && event.pointerId !== activePointerId.current) {
        return
      }

      const wasDragging = dragging.current

      dragging.current = false
      gestureAxis.current = null
      activePointerId.current = null

      if (section.hasPointerCapture(event.pointerId)) {
        section.releasePointerCapture(event.pointerId)
      }

      section.style.cursor = ""
      section.style.touchAction = ""

      if (wasDragging) {
        startMomentum()
      }
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (maxTranslate.current <= 0) return
      if (isScrollLocked()) return

      stopMomentum()
      dragVelocity.current = 0

      if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault()
        applyTranslate(translatePx.current - maxTranslate.current * 0.05)
      }

      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault()
        applyTranslate(translatePx.current + maxTranslate.current * 0.05)
      }
    }

    window.addEventListener("wheel", onWheel, { passive: false })
    section.addEventListener("pointerdown", onPointerDown)
    section.addEventListener("pointermove", onPointerMove, { passive: false })
    section.addEventListener("pointerup", endDrag)
    section.addEventListener("pointercancel", endDrag)
    window.addEventListener("keydown", onKeyDown)

    return () => {
      cancelAnimationFrame(frameId)
      stopMomentum()
      cancelAnimationFrame(settleId.current)
      settlingRef.current = false
      resizeObserver?.disconnect()
      window.removeEventListener("resize", scheduleMeasure)
      window.removeEventListener("wheel", onWheel)
      section.removeEventListener("pointerdown", onPointerDown)
      section.removeEventListener("pointermove", onPointerMove)
      section.removeEventListener("pointerup", endDrag)
      section.removeEventListener("pointercancel", endDrag)
      window.removeEventListener("keydown", onKeyDown)
      dragging.current = false
      gestureAxis.current = null
      activePointerId.current = null
      section.style.cursor = ""
      section.style.touchAction = ""
    }
  }, [applyTranslate, isScrollLocked, markerCount, measureLayout])

  return { sectionRef, trackRef, labelsRef, setMarkerRef, isLayoutReady }
}