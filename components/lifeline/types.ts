import type { CompanyIconId } from "./company-icon"


export interface LifelineMentor {
  name: string
  role?: string
  color?: string
  photo?: string
}

export interface LifelineMetPerson {
  name: string
  photo?: string
}

export interface LifelineCompany {
  id: CompanyIconId
  name: string
}

export type LifelineEventSegment =
  | { type: "text"; value: string }
  | { type: "link"; value: string; href: string }

export interface LifelineEventImage {
  src: string
  alt: string
  /** Optional mp4/webm — hover shows this (muted, looping) with src as fallback. */
  video?: string
}

/**
 * An always-visible photo/video card that floats over the timeline,
 * anchored to its marker's position and scrolling with the track —
 * scattered, tilted, and draggable, like photos loose in a notebook.
 */
export interface LifelinePhoto extends LifelineEventImage {
  /** 0..1 across the marker's slot; defaults to a seeded scatter. */
  x?: number
  /** Pixels below the rail; defaults to a seeded scatter. */
  y?: number
  /** Degrees; defaults to a seeded tilt. */
  rotate?: number
  /** Card width in pixels. Default 180. */
  width?: number
}

export type LifelineEventEffect = "fireworks" | "fireworks-argentina"

/**
 * Object form lets an event carry a cursor-following hover image
 * and/or a click-triggered easter egg effect.
 */
export interface LifelineEventObject {
  text: string | LifelineEventSegment[]
  image?: LifelineEventImage
  effect?: LifelineEventEffect
}

export type LifelineEvent =
  | string
  | LifelineEventSegment[]
  | LifelineEventObject

export interface LifelineMarker {
  id: string
  /** Position on the numeric axis — a year, or any sequential unit (e.g. tournament day). */
  year: number
  /** Shown above the label; defaults to year - birthYear. Strings allowed for round tags etc. */
  age?: number | string
  /** Shown in place of the raw year — e.g. "Jun 16" on a day-based timeline. */
  label?: string
  events: LifelineEvent[]
  /** Small emblems (team shields etc.) rendered above the events. */
  badges?: { src: string; alt: string }[]
  /** Floating media cards anchored to this marker's stretch of the timeline. */
  photos?: LifelinePhoto[]
  companies?: LifelineCompany[]
  mentors?: LifelineMentor[]
  met?: LifelineMetPerson[]
}

/**
 * A legend entry maps one of the two people slots to a subject-appropriate
 * label — "Mentors" for a person, "Presidents" for a nation.
 */
export interface LifelineLegendItem {
  type: "mentor" | "met"
  label: string
}

export interface LifelineProps {
  markers: LifelineMarker[]
  birthYear: number
  className?: string
  title?: string
}