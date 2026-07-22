# Lifeline

An interactive timeline of a life — a person, a company, a country, a World Cup run. Horizontal and scrubbed by scroll on desktop, vertical on mobile, with floating draggable photo cards, hover media, a tap-to-expand lightbox, and a cinematic intro that draws the rail across the years.

Distributed as a [shadcn registry](https://ui.shadcn.com/docs/registry) item: the source lands in your codebase, so every curve, easing, and zinc-toned class is yours to tweak.

## Install

```bash
npx shadcn@latest add https://evilrabbit.com/r/lifeline.json
```

This copies the components into `components/lifeline/`, the data helper into `lib/lifeline-data.ts`, adds the intro keyframes to your CSS, and installs `lucide-react` + `next-themes`.

## Use

Define a timeline as milestones keyed by year, and render it:

```tsx
import { Lifeline } from "@/components/lifeline"
import { defineLifeline } from "@/lib/lifeline-data"

const life = defineLifeline({
  slug: "web",
  name: "The World Wide Web",
  birthYear: 1989,
  endYear: 2026,
  description: "From a memo at CERN to everywhere at once.",
  milestones: {
    1989: {
      id: "proposal",
      events: ["Tim Berners-Lee circulated a proposal. “Vague, but exciting.”"],
    },
    1991: {
      id: "first-site",
      events: [
        {
          text: "The first website went live.",
          image: { src: "/moments/cern.jpg", alt: "info.cern.ch" }, // hover reveal
        },
      ],
    },
    2007: {
      id: "mobile",
      events: ["The iPhone put the Web in a pocket."],
      photos: [
        // always-visible floating card — drag it, tap to expand;
        // add `video` for a muted looping clip
        { src: "/moments/pocket.jpg", alt: "The Web, pocket-sized" },
      ],
    },
    2026: {
      id: "fireworks",
      events: [{ text: "It kept going. 🎆", effect: "fireworks" }],
    },
  },
})

export default function Page() {
  return (
    <main className="h-dvh overflow-y-auto pt-16 md:overflow-hidden">
      <Lifeline
        markers={life.markers}
        birthYear={life.birthYear}
        title={life.name}
        className="h-full"
      />
    </main>
  )
}
```

The layout switches automatically at the `md` breakpoint: horizontal scroll-scrubbed timeline above it, vertical scrolling timeline below.

### What a milestone can carry

| Field | What it does |
| --- | --- |
| `events` | Strings, or `{ text, image?, effect? }` — `image` shows on hover (desktop) / tap (mobile); `video` on the image makes it a looping clip. `effect: "fireworks"` hides a WebGL easter egg behind a click. |
| `photos` | Always-visible media cards scattered over the timeline — tilted like a notebook, draggable, tap-to-expand. `x` (0–1 across the year's slot), `y`, `rotate`, `width` are all optional. |
| `badges` | Small images above the events (flags, logos). |
| `companies` | Inline organization icons — map your own in `components/lifeline/company-icon.tsx`. |
| `mentors` / `met` | People rows with portraits along the rail; label them via `legend`. |
| `age` | Override the computed age label (e.g. `"QF"`, `"F"` for a tournament). |

### Alignment with your site chrome

On desktop, the timeline aligns its start and end with your navigation if you mark it: put `data-site-nav-logo` on your logo element and `data-site-nav-inner` on the nav's inner container. Without the markers it falls back to the stage's own edges.

## Requirements

Next.js (App Router) with Tailwind CSS — the components use `next/image` and `next-themes` (theme flip during the fireworks). Tailwind v3 and v4 both work; the palette is plain `zinc` utilities, restyle at will.

## Develop

This repo is the registry and the demo:

```bash
pnpm install
pnpm dev            # demo at localhost:3000
npx shadcn build    # rebuilds public/r/lifeline.json from registry.json
```

## License

[MIT](./LICENSE)
