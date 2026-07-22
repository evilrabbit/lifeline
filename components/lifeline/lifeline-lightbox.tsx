"use client"

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react"
import { createPortal } from "react-dom"
import { cn } from "@/lib/utils"
import type { LifelinePhoto } from "./types"

const OPEN_MS = 520
/**
 * Gentle start, soft landing — the quint curve front-loaded nearly all
 * of the travel into the first 120ms, which read as a jump.
 */
const EASE = "cubic-bezier(0.32, 0.72, 0, 1)"
/** Fraction of the viewport the expanded media may occupy. */
const FIT = 0.85

interface Target {
  left: number
  top: number
  width: number
  height: number
}

/**
 * The card's true geometry at handoff time. Center comes from the
 * bounding box (rotation about center preserves it); width/height are
 * the untransformed layout size (offsetWidth/offsetHeight) — the
 * bounding box of a tilted card is its axis-aligned hull, which is
 * larger than the card and lands the clone visibly off.
 */
export interface LifelineLightboxStart {
  cx: number
  cy: number
  w: number
  h: number
  /** Playback position of the card's video, for a seamless swap. */
  mediaTime?: number
}

/**
 * The clone's media. Videos mount paused, pre-seeked to the card's
 * playback position — a static frame the compositor can scale without
 * decoding — and only play once `playing` flips after the open
 * transition settles. Dismissing pauses again for the return flight.
 */
function LightboxMedia({
  photo,
  playing,
  mediaTime,
}: {
  photo: LifelinePhoto
  playing: boolean
  mediaTime?: number
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const seeded = useRef(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    if (playing) {
      // Seek only now, stationary — a seek during the transition
      // decodes a new frame mid-flight and visibly swaps the image.
      if (!seeded.current) {
        seeded.current = true
        if (mediaTime !== undefined) video.currentTime = mediaTime
      }
      video.play().catch(() => {
        // Autoplay rejection just leaves the poster frame showing.
      })
    } else {
      video.pause()
    }
  }, [playing, mediaTime])

  if (!photo.video) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photo.src}
        alt={photo.alt}
        className="block h-full w-full object-cover"
      />
    )
  }

  return (
    <video
      ref={videoRef}
      src={photo.video}
      poster={photo.src}
      muted
      loop
      playsInline
      preload="auto"
      aria-label={photo.alt}
      className="block h-full w-full object-cover"
    />
  )
}

function computeTarget(start: LifelineLightboxStart): Target {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const aspect = start.h / start.w
  const width = Math.min(vw * FIT, (vh * FIT) / aspect)
  const height = width * aspect
  return { left: (vw - width) / 2, top: (vh - height) / 2, width, height }
}

/**
 * Expands a floating card's media from its spot on the timeline to the
 * center of the screen and back — a FLIP animation on a fixed clone
 * portaled to <body> (the track is transformed, so fixed positioning
 * inside it would break). The original card stays in layout, hidden,
 * and is re-measured on dismiss so the media returns wherever the card
 * now is, even if the timeline moved.
 */
export function LifelineLightbox({
  photo,
  rotate,
  start,
  getHome,
  onClosed,
}: {
  photo: LifelinePhoto
  /** The card's resting tilt — animated away as the media centers. */
  rotate: number
  /** The card's geometry at click time. */
  start: LifelineLightboxStart
  /** Re-measures the card at dismiss time. */
  getHome: () => LifelineLightboxStart | null
  onClosed: () => void
}) {
  const target = useRef<Target | null>(null)
  if (target.current === null) target.current = computeTarget(start)
  const { left, top, width, height } = target.current

  const figureRef = useRef<HTMLElement>(null)

  const reduceMotion = useRef(
    typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  ).current

  // Center-anchored FLIP: rotation and scale about the center match
  // how the card itself is transformed, so the first frame is
  // pixel-identical to the card underneath.
  const toTransform = useCallback(
    (home: LifelineLightboxStart) =>
      `translate(${home.cx - (left + width / 2)}px, ${
        home.cy - (top + height / 2)
      }px) scale(${home.w / width}) rotate(${rotate}deg)`,
    [left, top, width, height, rotate],
  )

  const [entered, setEntered] = useState(reduceMotion)
  const [transform, setTransform] = useState(() =>
    reduceMotion ? "none" : toTransform(start),
  )
  const closing = useRef(false)
  // Playback waits for the open transition to finish — a playing
  // video decodes frames while the transform animates and drops
  // transition frames on mobile; a paused, pre-seeked frame is a
  // static layer and animates cheaply.
  const [settled, setSettled] = useState(reduceMotion)

  // Safety net if transitionend never fires for the open.
  useEffect(() => {
    if (reduceMotion) return
    const timeout = window.setTimeout(() => {
      if (!closing.current) setSettled(true)
    }, OPEN_MS + 80)
    return () => window.clearTimeout(timeout)
  }, [reduceMotion])

  // FLIP: first paint sits over the card, next frame eases to center.
  useLayoutEffect(() => {
    if (reduceMotion) return
    let inner = 0
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => {
        setEntered(true)
        setTransform("translate(0px, 0px) scale(1) rotate(0deg)")
      })
    })
    return () => {
      cancelAnimationFrame(outer)
      cancelAnimationFrame(inner)
    }
  }, [reduceMotion])

  // No gesture may pan while the lightbox is up — iOS otherwise
  // rubber-bands the body behind the fixed overlay and can leave the
  // whole page stuck offset after dismiss. React's root touch
  // listeners are passive, so this needs a native non-passive one.
  const rootRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const block = (event: TouchEvent) => event.preventDefault()
    root.addEventListener("touchmove", block, { passive: false })
    return () => root.removeEventListener("touchmove", block)
  }, [])

  // The press that opens the card dispatches one more click right
  // after pointerup — by then the clone is mounted underneath the
  // pointer and would dismiss itself. Swallow exactly that click;
  // every later click dismisses normally.
  useEffect(() => {
    const swallow = (event: MouseEvent) => {
      event.stopPropagation()
      event.preventDefault()
    }
    window.addEventListener("click", swallow, { capture: true, once: true })
    const timeout = window.setTimeout(() => {
      window.removeEventListener("click", swallow, { capture: true })
    }, 500)
    return () => {
      window.clearTimeout(timeout)
      window.removeEventListener("click", swallow, { capture: true })
    }
  }, [])

  const dismiss = useCallback(() => {
    if (closing.current) return
    closing.current = true
    if (reduceMotion) {
      onClosed()
      return
    }
    setSettled(false) // freeze the video so the return flight is cheap
    setEntered(false)
    setTransform(toTransform(getHome() ?? start))
    // transitionend is the primary signal; this is the safety net.
    window.setTimeout(onClosed, OPEN_MS + 120)
  }, [reduceMotion, onClosed, toTransform, getHome, start])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [dismiss])

  return createPortal(
    <div
      ref={rootRef}
      className="fixed inset-0 z-[999] touch-none overscroll-contain"
      role="dialog"
      aria-modal="true"
      aria-label={photo.alt}
      // The portal lives under <body>, but React events still bubble up
      // the component tree — without this, a backdrop press would reach
      // the card's drag handlers and the track's scrubber.
      onPointerDown={(event) => event.stopPropagation()}
      onPointerMove={(event) => event.stopPropagation()}
      onPointerUp={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
    >
      <div
        className={cn(
          "absolute inset-0 cursor-zoom-out bg-black/70 transition-opacity",
          entered ? "opacity-100" : "opacity-0",
        )}
        // Synced to the media's travel — a faster fade left the clone
        // flying over an undimmed page at the end of the dismiss.
        style={{ transitionDuration: `${OPEN_MS}ms` }}
        onClick={dismiss}
      />
      <figure
        ref={figureRef}
        className="absolute cursor-zoom-out overflow-hidden rounded-xl shadow-2xl ring-1 ring-black/10 dark:ring-white/15"
        style={{
          left,
          top,
          width,
          height,
          transform,
          transformOrigin: "center",
          transition: reduceMotion ? undefined : `transform ${OPEN_MS}ms ${EASE}`,
          // Promoted for the whole flight — mobile otherwise
          // re-rasterizes the shadowed, corner-clipped media mid-scale.
          willChange: "transform",
        }}
        onClick={dismiss}
        onTransitionEnd={(event) => {
          if (event.propertyName !== "transform") return
          if (closing.current) onClosed()
          else setSettled(true)
        }}
      >
        <LightboxMedia
          photo={photo}
          playing={settled}
          mediaTime={start.mediaTime}
        />
      </figure>
    </div>,
    document.body,
  )
}
