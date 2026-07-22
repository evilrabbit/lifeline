import { defineLifeline, type LifelineMilestones } from "@/lib/lifeline-data"

/**
 * Journey timeline starter — a bounded run with a beginning, an arc,
 * and an end: a tournament, a tour, a launch, a sabbatical.
 *
 * Instead of years, markers are days: `birthYear`/`endYear` become
 * day 1..N, and the label helpers below turn day numbers into
 * calendar labels. The `age` field carries stage labels ("W1", "F")
 * instead of an age.
 */
const JOURNEY_START_UTC = Date.UTC(2026, 5, 1) // June 1
const FIRST_DAY = 1
const LAST_DAY = 39

function dayLabel(day: number) {
  const date = new Date(JOURNEY_START_UTC + (day - 1) * 86_400_000)
  const month = date.toLocaleString("en-US", { month: "short", timeZone: "UTC" })
  const dayOfMonth = date.getUTCDate()
  // Spell the month out on day one and at each month turn.
  if (day === FIRST_DAY || dayOfMonth === 1) return `${month} ${dayOfMonth}`
  return `${dayOfMonth}`
}

function fullLabel(day: number) {
  const date = new Date(JOURNEY_START_UTC + (day - 1) * 86_400_000)
  const month = date.toLocaleString("en-US", { month: "short", timeZone: "UTC" })
  return `${month} ${date.getUTCDate()}`
}

const milestones: LifelineMilestones = {
  1: {
    id: "departure",
    age: "",
    events: ["It began, as these things do, with a one-way ticket."],
  },
  6: {
    id: "first-stop",
    age: "W1",
    events: [
      "First stop. Nothing went to plan, which was the plan.",
      // Badges are small images above a day's events — flags, crests:
      // badges: [{ src: "/flags/somewhere.svg", alt: "Somewhere" }],
    ],
  },
  14: {
    id: "the-turn",
    age: "W2",
    events: [
      {
        text: "The day everything turned.",
        // image: { src: "/moments/the-turn.jpg", alt: "The turn" },
      },
    ],
  },
  23: {
    id: "the-low",
    age: "W3",
    events: ["The low point. Every journey has one; this was ours."],
  },
  31: {
    id: "the-comeback",
    age: "W4",
    events: [
      "The comeback, against every expectation including our own.",
      // photos: [{ src: "/moments/comeback.jpg", alt: "That night" }],
    ],
  },
  39: {
    id: "the-end",
    age: "F",
    events: [{ text: "The last day. 🎆", effect: "fireworks" }],
  },
}

const record = defineLifeline({
  slug: "journey",
  name: "The Journey",
  birthYear: FIRST_DAY,
  endYear: LAST_DAY,
  description: "Thirty-nine days, day by day.",
  milestones,
})

export const journeyLifeline = {
  ...record,
  markers: record.markers.map((marker) => ({
    ...marker,
    // Days with events get the full "Jun 6" label; quiet days just
    // the day number — and no age unless a stage label is set.
    label: marker.events.length > 0 ? fullLabel(marker.year) : dayLabel(marker.year),
    age: marker.age ?? "",
  })),
}
