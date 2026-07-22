"use client"

import { useMemo, type CSSProperties } from "react"
import { cn } from "@/lib/utils"
import {
  LifelineStickyLabels,
  LIFELINE_STICKY_SHIELD_WIDTH,
} from "./lifeline-labels"
import { LifelineMarkerColumn } from "./lifeline-marker"
import type { LifelineEventImage, LifelineProps } from "./types"
import { getLifelineEventImage } from "./lifeline-event"
import { LifelineHoverImageProvider } from "./lifeline-hover-image"
import { LifelineFloatingPhotos } from "./lifeline-photos"
import { useLifelineIntro } from "./use-lifeline-intro"
import { useLifelineScroll } from "./use-lifeline-scroll"
import { getMarkerWidth } from "./lifeline-utils"

export function LifelineDesktop({
  markers,
  birthYear,
  className,
  title = "Lifeline",
}: LifelineProps) {
  const widths = useMemo(
    () =>
      markers.map((marker, index) =>
        getMarkerWidth(marker, markers[index + 1]?.year),
      ),
    [markers],
  )

  // Left edge of each marker's slot within the track — anchors for the
  // floating photo cards.
  const offsets = useMemo(() => {
    const result: number[] = []
    let sum = 0
    for (const width of widths) {
      result.push(sum)
      sum += width
    }
    return result
  }, [widths])

  const hoverImages = useMemo(() => {
    const images: LifelineEventImage[] = []
    for (const marker of markers) {
      for (const event of marker.events) {
        const image = getLifelineEventImage(event)
        if (image) images.push(image)
      }
    }
    return images
  }, [markers])

  const intro = useLifelineIntro(widths)
  const isIntroAnimating = intro.shouldPlay && intro.isPlaying

  const { sectionRef, trackRef, labelsRef, setMarkerRef, isLayoutReady } =
    useLifelineScroll(markers.length, {
      introLocked: isIntroAnimating,
      introAnimating: isIntroAnimating,
      introSkipped: !intro.shouldPlay,
      introRailMs: intro.railDuration,
      introGetTrackProgress: intro.getTrackProgressAtTime,
      onIntroScrollStart: intro.startIntroTimer,
      onIntroSettleComplete: intro.completeIntro,
    })

  const showIntro = isIntroAnimating && isLayoutReady

  const trackWidth =
    LIFELINE_STICKY_SHIELD_WIDTH + widths.reduce((sum, width) => sum + width, 0)

  const introStyle = {
    "--lifeline-labels-ms": `${intro.labelsDuration}ms`,
    "--lifeline-rail-ms": `${intro.railDuration}ms`,
  } as CSSProperties

  return (
    <section
      ref={sectionRef}
      className={cn(
        "relative h-full min-h-0 select-none overflow-hidden [&_a]:cursor-pointer",
        !isLayoutReady && "invisible",
        className,
      )}
      aria-label={title}
      style={showIntro ? introStyle : undefined}
    >
      <LifelineHoverImageProvider preload={hoverImages}>
      <div className="flex h-full items-center overflow-hidden">
        <div
          ref={trackRef}
          className="relative flex w-max items-start will-change-transform [--lifeline-people-top:calc(14.5rem+40px)] [--lifeline-rail:5rem]"
          style={{ width: trackWidth }}
        >
          <div
            ref={labelsRef}
            className="lifeline-labels shrink-0 will-change-transform"
            style={{ width: LIFELINE_STICKY_SHIELD_WIDTH }}
          >
            <div className={cn(showIntro && "lifeline-labels-intro")}>
              <LifelineStickyLabels />
            </div>
          </div>

          <div className="relative">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-[var(--lifeline-rail)] h-px overflow-hidden"
            >
              <div
                className={cn(
                  "h-px w-full border-t border-dashed border-zinc-300 transition-colors duration-300 dark:border-zinc-800",
                  showIntro && "lifeline-rail-intro",
                )}
              />
            </div>

            <div className="relative flex items-start">
              {markers.map((marker, index) => (
                <LifelineMarkerColumn
                  key={marker.id}
                  ref={(node) => setMarkerRef(index, node)}
                  marker={marker}
                  birthYear={birthYear}
                  minWidth={widths[index]}
                  animateIntro={showIntro}
                  introDelay={intro.getMarkerDelay(index)}
                  introDuration={intro.getMarkerFadeDuration(index)}
                />
              ))}
            </div>

            <LifelineFloatingPhotos
              markers={markers}
              offsets={offsets}
              widths={widths}
              animateIntro={showIntro}
              getIntroDelay={intro.getMarkerDelay}
              getIntroDuration={intro.getMarkerFadeDuration}
            />
          </div>
        </div>
      </div>

      </LifelineHoverImageProvider>
    </section>
  )
}