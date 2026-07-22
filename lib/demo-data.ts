import { defineLifeline } from "@/lib/lifeline-data"

/**
 * The demo timeline — the Web itself, year by year. Swap this file for
 * your own subject: a person, a company, a country, a tournament.
 *
 * Milestones are keyed by year. Events can be plain strings, carry a
 * hover image/video, or trigger an effect. `photos` float over the
 * timeline as draggable, tappable cards.
 */
const record = defineLifeline({
  slug: "web",
  name: "The World Wide Web",
  birthYear: 1989,
  endYear: 2026,
  description:
    "The Web, year by year — from a memo at CERN to everywhere at once.",
  milestones: {
    1989: {
      id: "proposal",
      events: [
        "At CERN, Tim Berners-Lee circulated “Information Management: A Proposal.” His boss wrote “vague, but exciting” in the margin.",
      ],
    },
    1991: {
      id: "first-site",
      events: [
        {
          text: "The first website went live at info.cern.ch — a page explaining the project it ran on.",
          image: {
            src: "https://picsum.photos/seed/lifeline-cern/560/400",
            alt: "Placeholder — swap for your own moment",
          },
        },
      ],
    },
    1993: {
      id: "public-domain",
      events: [
        "CERN released the Web into the public domain.",
        "Mosaic put images inline, and the Web got a face.",
      ],
    },
    1995: {
      id: "js",
      events: [
        "JavaScript was written in ten days.",
        "Amazon and eBay opened their doors.",
      ],
    },
    1998: {
      id: "search",
      events: [
        "Google started indexing the growing Web from a garage in Menlo Park.",
      ],
    },
    2004: {
      id: "web20",
      events: [
        "Gmail launched with a whole gigabyte of storage — on April 1, so nobody believed it.",
        "The Web turned social.",
      ],
    },
    2007: {
      id: "mobile",
      events: ["The iPhone put the whole Web in a pocket."],
      photos: [
        {
          src: "https://picsum.photos/seed/lifeline-pocket/400/560",
          alt: "Placeholder photo card — drag me, tap me",
        },
      ],
    },
    2015: {
      id: "https",
      events: [
        "Let's Encrypt began signing certificates for free, and the padlock became the default.",
      ],
    },
    2022: {
      id: "ai",
      events: ["Conversational AI arrived in a browser tab."],
    },
    2026: {
      id: "open-source",
      events: [
        {
          text: "Lifeline went open source. Click here for the celebration.",
          effect: "fireworks",
        },
      ],
    },
  },
})

export const webLifeline = record
