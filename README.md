# Lifeline

A timeline component for the stories that unfold over time — a career, a company, a journey.

Lifeline lays milestones on a single rail: horizontal and scrubbed by scroll on desktop, vertical on mobile. Years carry events, links, and the people who mattered; media attaches as hover reveals or floating cards that expand into a lightbox. On first load, an intro draws the rail across the years.

It ships as a [shadcn registry](https://ui.shadcn.com/docs/registry) — the source lands in your codebase, so every easing, breakpoint, and class is yours to change.

## Install

**Starting from nothing?** This gets you a page that runs, framing included:

```bash
npx shadcn@latest add evilrabbit/lifeline/lifeline-page
```

Components, starter data, the shell, and a route at `app/lifeline/page.tsx`. If that route already exists, shadcn asks before touching it — answer no and nothing of yours is lost.

**Already have a page?** Take the shell without the route, so the rail still sits inset and aligned inside your own layout:

```bash
npx shadcn@latest add evilrabbit/lifeline/lifeline-shell
```

**Just want the data template?** Pick the starter that matches your subject — each brings the component system plus a commented template file, and no framing:

```bash
npx shadcn@latest add evilrabbit/lifeline/personal   # a life, year by year
npx shadcn@latest add evilrabbit/lifeline/company    # founding to today
npx shadcn@latest add evilrabbit/lifeline/journey    # a bounded run, day by day
```

Or just the component system, no starter and no framing:

```bash
npx shadcn@latest add evilrabbit/lifeline/lifeline
```

The sun/moon toggle from the demo is its own item:

```bash
npx shadcn@latest add evilrabbit/lifeline/theme-switcher
```

Any item installs the components into `components/lifeline/`, the data helper into `lib/lifeline-data.ts`, adds the intro keyframes to your CSS, and installs `lucide-react` + `next-themes`. The registry is also served at `https://evilrabbit.com/r/{name}.json` if you prefer URLs.

## Use

Define a timeline as milestones keyed by year, and render it:

```tsx
import { Lifeline, LifelineLegend } from "@/components/lifeline"
import {
  LifelineFooter,
  LifelineNav,
  LifelineShell,
  LifelineStage,
} from "@/components/lifeline-shell"
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
    <LifelineShell>
      {/* Not decoration: the rail measures its start and end from this
          nav, which is what keeps it inset from the viewport instead of
          running edge to edge. That span is what the intro draws. */}
      <LifelineNav logo={<YourLogo className="h-6 w-6" />} />

      <LifelineStage>
        <Lifeline
          markers={life.markers}
          birthYear={life.birthYear}
          title={life.name}
          className="h-full"
        />
      </LifelineStage>

      <LifelineFooter>
        <LifelineLegend />
      </LifelineFooter>
    </LifelineShell>
  )
}
```

The layout switches automatically at the `md` breakpoint: horizontal scroll-scrubbed timeline above it, vertical scrolling timeline below.

`LifelineNav` is the whole reason the rail sits inset rather than bleeding to both edges — see [Alignment with your site chrome](#alignment-with-your-site-chrome) if you already have chrome of your own and would rather mark it up yourself.

### Props

```tsx
<Lifeline markers={life.markers} birthYear={life.birthYear} />
```

| Prop | Type | |
| --- | --- | --- |
| `markers` | `LifelineMarker[]` | Required. `defineLifeline` returns these from your milestones. |
| `birthYear` | `number` | Required. Year zero for the age row and the axis start. |
| `title` | `string` | Becomes the `aria-label` on the timeline region. Defaults to `"Lifeline"`. |
| `className` | `string` | Merged onto the horizontal timeline's root, after its own `pt-5` — `h-full` is what you want inside `LifelineStage`. Desktop only: the vertical layout below `md` ignores it. |

The shell pieces, all of which pass `className` through:

| Component | Props | |
| --- | --- | --- |
| `LifelineShell` | `children`, `className` | The `h-dvh` column that clips overflow. |
| `LifelineNav` | `logo`, `logoHref`, `logoLabel`, `children`, `className`, `containerClassName` | `logo` is required and goes inside the marked anchor — the rail starts at its left edge. `logoHref` defaults to `/`, `logoLabel` to `"Home"`. `children` land on the right: links, a theme switcher. |
| `LifelineStage` | `children`, `className` | The `<main>`. Clears the fixed nav and hands scrolling to the horizontal scrub above `md`. |
| `LifelineFooter` | `children`, `className`, `containerClassName` | Where `LifelineLegend` usually goes. |

`containerClassName` overrides the width cap on the nav and the footer. Change it on **both** — one constant is shared between them, and the rail's end follows the nav, so a mismatch shows up as a rail that stops short of the footer's edge.

### What a milestone can carry

| Field | What it does |
| --- | --- |
| `events` | Strings, or `{ text, image?, effect? }` — `image` shows on hover (desktop) / tap (mobile); `video` on the image makes it a looping clip. `effect: "fireworks"` hides a WebGL easter egg behind a click. |
| `photos` | Always-visible media cards scattered over the timeline — tilted like a notebook, draggable, tap-to-expand. `x` (0–1 across the year's slot), `y`, `rotate`, `width` are all optional. |
| `badges` | Small images above the events (flags, logos). |
| `companies` | Inline organization marks — register your logos once via `registerCompanyIcons({ acme: { icon: AcmeIcon } })`; unregistered ids fall back to the name's initial. |
| `mentors` / `met` | People rows with portraits along the rail; label them via `legend`. |
| `age` | Override the computed age label (e.g. `"QF"`, `"F"` for a tournament). |

### Alignment with your site chrome

On desktop, the timeline measures where to begin and end from your navigation, so the rail lines up with the rest of the page instead of running to the viewport edges:

| Marker | Effect |
| --- | --- |
| `data-site-nav-logo` | The rail's first marker starts at this element's left edge. |
| `data-site-nav-inner` | The rail ends 24px inside this element's right edge. Cap it — `mx-auto max-w-5xl px-6` on the demo — and the timeline inherits that width. |

Both are read from the document on mount and re-read on resize, so the nav can live anywhere in the tree, not just above the Lifeline.

`lifeline-shell` and `lifeline-page` ship all of this wired up — `LifelineShell`, `LifelineNav`, `LifelineStage`, and `LifelineFooter`, with the markers already in place and one `max-w-5xl` constant shared by the nav and the footer so they can't drift apart. Already have a nav? Put the two attributes on it yourself and skip the shell entirely; the rail only cares about the attributes, not about who rendered them.

Without the markers the rail falls back to the stage's own box: it fills whatever width the Lifeline's container has. In a bare `<main>` that means edge to edge, and the intro sweeps the full viewport. If that's what you want, drop the attributes; if you want it narrower without a nav, put the Lifeline in a capped, centered container and the fallback follows it.

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
