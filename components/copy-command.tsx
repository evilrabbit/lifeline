"use client"

import { Check, Copy } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

export function CopyCommand({ command }: { command: string }) {
  const [copied, setCopied] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command)
      setCopied(true)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard unavailable (e.g. insecure context) — leave the text selectable.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "Copied" : `Copy ${command}`}
      className="group relative hidden items-center text-sm md:flex"
    >
      <span
        className={cn(
          "truncate transition duration-300 ease-out",
          copied
            ? "-translate-x-[22px] text-black dark:text-white"
            : "text-zinc-500 group-hover:-translate-x-[22px] group-hover:text-black dark:group-hover:text-white",
        )}
      >
        {command}
      </span>
      <span className="absolute right-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2">
        <Check
          strokeWidth={1.75}
          className={cn(
            "absolute inset-0 h-3.5 w-3.5 text-zinc-500 transition-opacity duration-300",
            copied ? "opacity-100" : "opacity-0",
          )}
        />
        <Copy
          strokeWidth={1.75}
          className={cn(
            "absolute inset-0 h-3.5 w-3.5 text-zinc-500 transition-opacity duration-300 group-hover:text-black dark:group-hover:text-white",
            copied ? "opacity-0" : "opacity-0 group-hover:opacity-100",
          )}
        />
      </span>
    </button>
  )
}
