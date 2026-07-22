import { defineLifeline } from "@/lib/lifeline-data"

/**
 * Company timeline starter — founding to today.
 *
 * `birthYear` is the founding year, so the AGE column reads as the
 * company's age. Milestones work exactly like a personal timeline:
 * launches, pivots, the outage nobody forgets.
 */
export const companyLifeline = defineLifeline({
  slug: "acme",
  name: "Acme Inc.",
  birthYear: 2015,
  description: "Acme, from a kitchen table to the enterprise.",
  milestones: {
    2015: {
      id: "founded",
      events: ["Founded at a kitchen table with a terrible first name."],
    },
    2016: {
      id: "v1",
      events: [
        [
          { type: "text", value: "Shipped " },
          { type: "link", value: "v1", href: "https://example.com" },
          { type: "text", value: " to eleven users. Nine were family." },
        ],
      ],
    },
    2018: {
      id: "seed",
      events: [
        "Raised a seed round.",
        "Hired the first person neither founder had met before.",
      ],
    },
    2020: {
      id: "the-outage",
      events: [
        {
          text: "The outage. Four hours that taught us more than four years.",
          // Attach the post-mortem screenshot as a hover reveal:
          // image: { src: "/moments/outage.png", alt: "The graph" },
        },
      ],
    },
    2022: {
      id: "pivot",
      events: ["Killed the flagship. Kept the side feature. It was the company all along."],
    },
    2024: {
      id: "profitable",
      events: ["Profitable. Quietly, then suddenly."],
    },
    2026: {
      id: "today",
      events: [{ text: "A decade in sight. 🎆", effect: "fireworks" }],
    },
  },
})
