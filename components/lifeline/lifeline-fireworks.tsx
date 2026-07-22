"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { useTheme } from "next-themes"
import type { LifelineEventEffect } from "./types"

/** Tweak these */
const DURATION_S = 7.5
const MAX_DPR = 1.5
/** Wait for the theme cross-fade before the first burst. */
const NIGHTFALL_MS = 400

type Palette = [number[], number[], number[]]

const PALETTES: Record<LifelineEventEffect, Palette> = {
  // Old Glory red / white / blue
  fireworks: [
    [0.9, 0.15, 0.25],
    [1.0, 1.0, 1.0],
    [0.25, 0.45, 0.95],
  ],
  // celeste / white / pale celeste
  "fireworks-argentina": [
    [0.45, 0.75, 0.98],
    [1.0, 1.0, 1.0],
    [0.7, 0.87, 1.0],
  ],
}

const VERTEX_SHADER = `
attribute vec2 a_pos;
void main() {
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`

/**
 * Additive point-glow fireworks in Old Glory red, white, and blue,
 * composited over a night-sky scrim via premultiplied canvas alpha.
 */
const FRAGMENT_SHADER = `
precision highp float;

uniform vec2 u_res;
uniform float u_time;
uniform float u_dur;
uniform vec3 u_c0;
uniform vec3 u_c1;
uniform vec3 u_c2;

#define TAU 6.28318530718
#define N_FIREWORKS 10
#define N_PARTICLES 42

float hash(float n) {
  return fract(sin(n) * 43758.5453123);
}

vec3 palette(float m) {
  if (m < 0.5) return u_c0;
  if (m < 1.5) return u_c1;
  return u_c2;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y;
  float t = u_time;
  float env = smoothstep(0.0, 0.5, t) * (1.0 - smoothstep(u_dur - 1.0, u_dur, t));

  vec3 col = vec3(0.0);

  for (int i = 0; i < N_FIREWORKS; i++) {
    float fi = float(i);
    float t0 = 0.35 + fi * (u_dur - 2.8) / float(N_FIREWORKS) + hash(fi * 7.31) * 0.3;
    // No flow control in the loop — some WebGL1 driver translations
    // mishandle continue, so inactive bursts multiply to zero instead.
    float active = step(t0, t) * step(t, t0 + 1.8);
    float lt = clamp((t - t0) / 1.8, 0.0, 1.0);

    vec2 center = vec2((hash(fi * 3.7) - 0.5) * 1.6, -0.05 + hash(fi * 9.1) * 0.5);
    vec3 base = palette(mod(fi, 3.0)); // strict red / white / blue rotation
    // Ramp in fast so overlapping particles at ignition don't stack
    // into a blown-out ball, then decay.
    float fade = exp(-lt * 4.0) * min(1.0, lt * 6.0);

    for (int j = 0; j < N_PARTICLES; j++) {
      float fj = float(j);
      float angle = (fj / float(N_PARTICLES)) * TAU + hash(fi * 100.0 + fj) * 0.15;
      float speed = 0.16 + 0.22 * hash(fj * 7.77 + fi * 31.3);

      vec2 p = center + vec2(cos(angle), sin(angle)) * speed * sqrt(lt);
      p.y -= 0.09 * lt * lt; // gravity

      float d = max(length(uv - p), 0.004);
      float sparkle = 0.7 + 0.3 * sin(30.0 * lt + fj * 1.7);
      col += base * active * fade * sparkle * 0.0006 / (d * d);
    }
  }

  col = clamp(col * env, 0.0, 1.0);
  float spark = max(col.r, max(col.g, col.b));
  float scrim = 0.45 * env;
  gl_FragColor = vec4(col, max(spark, scrim));
}
`

interface LifelineFireworksApi {
  launch: (effect: LifelineEventEffect) => void
}

const LifelineFireworksContext = createContext<LifelineFireworksApi | null>(
  null,
)

export function useLifelineFireworks() {
  return useContext(LifelineFireworksContext)
}

function FireworksCanvas({
  palette,
  onDone,
}: {
  palette: Palette
  onDone: () => void
}) {
  const paletteRef = useRef(palette)
  paletteRef.current = palette
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const onDoneRef = useRef(onDone)
  onDoneRef.current = onDone

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false,
    })
    if (!gl) {
      onDoneRef.current()
      return
    }

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)!
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.warn("fireworks shader:", gl.getShaderInfoLog(shader))
      }
      return shader
    }

    const program = gl.createProgram()!
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX_SHADER))
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT_SHADER))
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn("fireworks link:", gl.getProgramInfoLog(program))
      onDoneRef.current()
      return
    }
    gl.useProgram(program)

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    )
    const aPos = gl.getAttribLocation(program, "a_pos")
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    const uRes = gl.getUniformLocation(program, "u_res")
    const uTime = gl.getUniformLocation(program, "u_time")
    const uDur = gl.getUniformLocation(program, "u_dur")

    const [c0, c1, c2] = paletteRef.current
    gl.uniform3f(gl.getUniformLocation(program, "u_c0"), c0[0], c0[1], c0[2])
    gl.uniform3f(gl.getUniformLocation(program, "u_c1"), c1[0], c1[1], c1[2])
    gl.uniform3f(gl.getUniformLocation(program, "u_c2"), c2[0], c2[1], c2[2])

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
      canvas.width = Math.round(window.innerWidth * dpr)
      canvas.height = Math.round(window.innerHeight * dpr)
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    resize()
    window.addEventListener("resize", resize)

    let frame = 0
    const start = performance.now()

    const step = (now: number) => {
      const t = (now - start) / 1000
      if (t >= DURATION_S) {
        onDoneRef.current()
        return
      }

      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.uniform1f(uTime, t)
      gl.uniform1f(uDur, DURATION_S)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLES, 0, 3)

      frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("resize", resize)
      // No manual loseContext: StrictMode re-runs this effect on the
      // same canvas, and a lost context can never compile again.
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[70] h-full w-full"
    />
  )
}

export function LifelineFireworksProvider({
  children,
}: {
  children: ReactNode
}) {
  const [playing, setPlaying] = useState(false)
  const [effect, setEffect] = useState<LifelineEventEffect>("fireworks")
  const { resolvedTheme, setTheme } = useTheme()
  const restoreThemeRef = useRef<string | null>(null)
  const nightfallRef = useRef(0)
  const playingRef = useRef(false)
  playingRef.current = playing

  useEffect(() => {
    return () => window.clearTimeout(nightfallRef.current)
  }, [])

  const launch = useCallback((nextEffect: LifelineEventEffect) => {
    if (playingRef.current) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    setEffect(nextEffect)

    // Fireworks belong in the dark: switch a light page to dark for
    // the show, and restore afterwards.
    if (resolvedTheme === "light") {
      restoreThemeRef.current = "light"
      setTheme("dark")
      window.clearTimeout(nightfallRef.current)
      nightfallRef.current = window.setTimeout(
        () => setPlaying(true),
        NIGHTFALL_MS,
      )
      return
    }

    restoreThemeRef.current = null
    setPlaying(true)
  }, [resolvedTheme, setTheme])

  const done = useCallback(() => {
    setPlaying(false)
    if (restoreThemeRef.current) {
      setTheme(restoreThemeRef.current)
      restoreThemeRef.current = null
    }
  }, [setTheme])

  return (
    <LifelineFireworksContext.Provider value={{ launch }}>
      {children}
      {playing && <FireworksCanvas palette={PALETTES[effect]} onDone={done} />}
    </LifelineFireworksContext.Provider>
  )
}
