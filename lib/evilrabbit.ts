import { defineLifeline } from "@/lib/lifeline-data"

/**
 * The demo timeline — Evil Rabbit's own, mentors and met-in-person
 * included. Event photos and videos land later; see the README for
 * how events carry hover images and floating photo cards.
 */
const record = defineLifeline({
  slug: "evilrabbit",
  name: "Evil Rabbit",
  birthYear: 1986,
  endYear: 2026,
  description:
    "The life and career of Evil Rabbit — from Buenos Aires to Vercel.",
  milestones: {
    1986: {
      id: "born",
      events: ["I was born in Ramos Mejia, Buenos Aires, Argentina."],
    },
    1993: {
      id: "school",
      events: [
        "Started primary school.",
        "Joined my first basketball team: Argentinos del Oeste.",
      ],
      mentors: [
        {
          name: "Horacio Mansilla",
          role: "Basketball Coach",
          color: "#E5484D",
          photo: "/images/people/horacio-mansilla.png",
        },
        {
          name: "Fernando Prats",
          role: "Computer Teacher",
          color: "#3E63DD",
          photo: "/images/people/fernando-prats.jpg",
        },
      ],
    },
    1995: {
      id: "graphic-design",
      events: ["Started learning Graphic Design."],
    },
    1998: {
      id: "freelance",
      events: [
        "Got my first job as a Web Designer for legendary Argentinian Turismo Carretera drivers.",
      ],
    },
    2004: {
      id: "university",
      events: [
        "Started studying Graphic Design at the University of Buenos Aires.",
      ],
    },
    2006: {
      id: "tsya-identidad",
      companies: [{ id: "tsya", name: "TSYA" }],
      events: [
        [
          { type: "text", value: "Joined " },
          { type: "link", value: "TSYA", href: "https://www.tsya.net/?lang=en" },
          { type: "text", value: " to open their Web Design department." },
        ],
        "Joined Identidad as Freelance Designer.",
      ],
    },
    2008: {
      id: "john-legend",
      events: [
        [
          { type: "text", value: "Designed an album for John Legend, called " },
          {
            type: "link",
            value: "Legend Network",
            href: "https://www.discogs.com/release/11682137-John-Legend-Legend-Network-John-Legend-2008",
          },
          { type: "text", value: "." },
        ],
      ],
    },
    2009: {
      id: "bunbury",
      events: [],
      met: [
        {
          name: "Enrique Bunbury",
          photo: "/images/people/enrique-bunbury.png",
        },
      ],
    },
    2010: {
      id: "viacom",
      companies: [{ id: "viacom", name: "Viacom" }],
      events: [
        "Joined Viacom as Head of Design for Latin America.",
        "My first son Bruno, was born.",
      ],
    },
    2011: {
      id: "trimarchi",
      events: [
        "Sponsored Trimarchi, Latin America's largest interdisciplinary design conference.",
        [
          { type: "text", value: "Redesigned " },
          { type: "link", value: "mtvla.com", href: "https://mtvla.com" },
          { type: "text", value: ", " },
          { type: "link", value: "mundonick.com", href: "https://mundonick.com" },
        ],
      ],
      met: [
        {
          name: "David Carson",
          photo: "/images/people/david-carson.png",
        },
      ],
    },
    2014: {
      id: "aerolab",
      companies: [{ id: "aerolab", name: "Aerolab" }],
      events: [
        "Joined Aerolab as Product Designer.",
        [
          { type: "text", value: "Redesigned " },
          {
            type: "link",
            value: "PopcornTime!",
            href: "https://en.wikipedia.org/wiki/Popcorn_Time",
          },
        ],
        "My daughter Ninette was born.",
      ],
      mentors: [
        {
          name: "Guillermo Rauch",
          role: "Entrepreneur",
          color: "#8B5CF6",
          photo: "/images/people/guillermo-rauch.png",
        },
      ],
      met: [
        {
          name: "Guillermo Rauch",
          photo: "/images/people/guillermo-rauch.png",
        },
      ],
    },
    2015: {
      id: "auth0",
      companies: [{ id: "auth0", name: "Auth0" }],
      events: [
        [
          { type: "text", value: "Joined " },
          { type: "link", value: "Auth0", href: "https://auth0.com" },
          { type: "text", value: " as Product Designer." },
        ],
      ],
    },
    2016: {
      id: "zeit",
      companies: [{ id: "vercel", name: "ZEIT" }],
      events: [
        [
          { type: "text", value: "Joined " },
          { type: "link", value: "ZEIT", href: "https://zeit.co" },
          { type: "text", value: " as Founding Designer." },
        ],
      ],
    },
    2017: {
      id: "zeit-day",
      events: [
        "Visited SF for the first time.",
        "Hosted our very first ZEIT Day conference event.",
      ],
    },
    2019: {
      id: "vercel",
      companies: [{ id: "vercel", name: "Vercel" }],
      events: [
        [
          { type: "link", value: "ZEIT", href: "https://zeit.co" },
          { type: "text", value: " became " },
          { type: "link", value: "Vercel", href: "https://vercel.com" },
          { type: "text", value: "." },
        ],
        "My daughter Fadhila was born.",
      ],
    },
    2022: {
      id: "nextjs-2022",
      events: [
        "Shipped the Next.js rebrand.",
        "Designed the Next.js Conf '22 website and live event.",
        "My O-1B visa for individuals with extraordinary ability in the arts was approved.",
        "Moved to San Francisco, California.",
      ],
      met: [
        {
          name: "Jony Ive",
          photo: "/images/people/jony-ive.png",
        },
        {
          name: "Rasmus Andersson",
          photo: "/images/people/rasmus-andersson.png",
        },
      ],
    },
    2023: {
      id: "geist",
      events: [
        [
          { type: "text", value: "Directed " },
          { type: "link", value: "Geist", href: "https://vercel.com/font" },
          {
            type: "text",
            value:
              ", Vercel's main Typeface, releasing it in October with the versions Sans and Mono.",
          },
        ],
      ],
    },
    2024: {
      id: "elon-musk",
      events: [],
      met: [
        {
          name: "Elon Musk",
          photo: "/images/people/elon-musk.png",
        },
      ],
    },
    2025: {
      id: "v0-mobile",
      events: ["v0 Mobile App Design.", "Got married."],
    },
    2026: {
      id: "today",
      events: [
        [
          { type: "text", value: "Directed " },
          {
            type: "link",
            value: "Geist Pixel",
            href: "https://vercel.com/font?type=pixel",
          },
          { type: "text", value: ", launched." },
        ],
        "Designed Eve's brand, the framework for building agents.",
        [
          { type: "text", value: "Open-sourced " },
          {
            type: "link",
            value: "Lifeline",
            href: "https://github.com/evilrabbit/lifeline",
          },
          { type: "text", value: " — the component you are looking at." },
        ],
      ],
    },
  },
})

export const evilrabbitLifeline = record
