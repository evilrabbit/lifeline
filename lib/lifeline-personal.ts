import { defineLifeline } from "@/lib/lifeline-data"

/**
 * Personal timeline starter — a life, year by year.
 *
 * Swap the milestones for your own. Anything you leave out of a year
 * still renders as a tick on the rail, so the empty years carry the
 * shape of a life too. Omit `endYear` while you're alive.
 */
export const personalLifeline = defineLifeline({
  slug: "me",
  name: "Your Name",
  birthYear: 1990,
  description: "A life, year by year.",
  milestones: {
    1990: {
      id: "born",
      events: ["Born somewhere worth mentioning."],
    },
    2008: {
      id: "school",
      events: [
        "Finished school. Started something else.",
        // Portraits along the rail — mentors get a role and a color:
        //
        // mentors: [
        //   {
        //     name: "Someone Formative",
        //     role: "Teacher",
        //     color: "#3E63DD",
        //     photo: "/images/people/someone.png",
        //   },
        // ],
      ],
    },
    2014: {
      id: "first-job",
      // Inline organization marks — map ids to icons in
      // components/lifeline/company-icon.tsx (unmapped ids render
      // the name's initial).
      companies: [{ id: "acme", name: "Acme" }],
      events: [
        [
          { type: "text", value: "Joined " },
          { type: "link", value: "Acme", href: "https://example.com" },
          { type: "text", value: " and shipped the first real thing." },
        ],
      ],
    },
    2019: {
      id: "the-move",
      events: [
        {
          text: "Moved across the world.",
          // A hover image (desktop) / tap-to-expand (mobile); add
          // `video` for a muted looping clip:
          // image: { src: "/moments/the-move.jpg", alt: "The move" },
        },
        // People you met — photo-only portraits under the rail:
        //
        // met: [{ name: "A Hero", photo: "/images/people/hero.png" }],
      ],
    },
    2023: {
      id: "the-project",
      events: ["Started the project everything since has grown from."],
      // Always-visible floating cards, tilted like a notebook —
      // draggable, tap to expand. x is 0..1 across the year's slot:
      //
      // photos: [
      //   { src: "/moments/project.jpg", alt: "Day one", x: 0.7 },
      // ],
    },
    2026: {
      id: "today",
      events: [{ text: "Still going. 🎆", effect: "fireworks" }],
    },
  },
})
