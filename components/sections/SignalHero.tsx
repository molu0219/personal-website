'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import NeonButton from '@/components/ui/NeonButton'
import { SignalField, type FieldStats, type Signal } from '@/lib/ascii/signal-field'

const FPS = 30
const BOOT_KEY = 'ascii-boot-seen'

interface Props {
  name: string
  tagline: string
  description: string
  signals: Signal[]
  stats: FieldStats & { lastWrite: string | null }
}

interface HudState {
  title: string
  href: string
  hovered: boolean
}

export default function SignalHero({ name, tagline, description, signals, stats }: Props) {
  const router = useRouter()
  const sectionRef = useRef<HTMLElement>(null)
  const preRef = useRef<HTMLPreElement>(null)
  const copyRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [hud, setHud] = useState<HudState | null>(null)

  useEffect(() => {
    const section = sectionRef.current
    const pre = preRef.current
    const copy = copyRef.current
    const container = containerRef.current
    if (!section || !pre || !copy || !container) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // Resolved family list of the page (next/font hashes the Geist name), for the canvas mask.
    const font = getComputedStyle(document.body).fontFamily || 'sans-serif'
    const field = new SignalField(pre, [name], signals, stats, font)

    let seenBoot = false
    try {
      seenBoot = sessionStorage.getItem(BOOT_KEY) === '1'
      sessionStorage.setItem(BOOT_KEY, '1')
    } catch {}
    if (seenBoot || reduceMotion) field.skipBoot()

    let lastHud = ''
    const syncHud = () => {
      const s = field.hovered ?? field.focus
      const key = s ? `${s.href}|${field.hovered ? 1 : 0}` : ''
      if (key === lastHud) return
      lastHud = key
      setHud(s ? { title: s.title, href: s.href, hovered: !!field.hovered } : null)
      section.style.cursor = field.hovered ? 'pointer' : ''
    }

    const layout = () => {
      const origin = section.getBoundingClientRect()
      const box = container.getBoundingClientRect()
      field.layout(origin.width, origin.height, box.left - origin.left, box.width, copy.getBoundingClientRect(), origin)
      field.render()
    }

    let raf = 0
    let last = 0
    let visible = true
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      if (now - last < 1000 / FPS) return
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      field.step(dt)
      field.render()
      syncHud()
    }
    const start = () => {
      if (reduceMotion || raf || !visible || document.hidden) return
      last = performance.now()
      raf = requestAnimationFrame(loop)
    }
    const stop = () => {
      cancelAnimationFrame(raf)
      raf = 0
    }

    const onMove = (e: PointerEvent) => field.pointerMove(e.clientX, e.clientY)
    const onLeave = () => field.pointerLeave()
    const onClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('a,button')) return
      const hit = field.click(e.clientX, e.clientY)
      if (hit) router.push(hit.href)
    }
    const onVisibility = () => (document.hidden ? stop() : start())

    const ro = new ResizeObserver(layout)
    ro.observe(section)
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) start()
      else stop()
    })
    io.observe(section)
    section.addEventListener('pointermove', onMove)
    section.addEventListener('pointerdown', onMove)
    section.addEventListener('pointerleave', onLeave)
    section.addEventListener('click', onClick)
    document.addEventListener('visibilitychange', onVisibility)
    document.fonts?.ready.then(layout).catch(() => {})

    layout()
    if (reduceMotion) {
      // One still frame with the first signal already decoded.
      field.step(5)
      field.render()
      syncHud()
    }
    start()

    return () => {
      stop()
      ro.disconnect()
      io.disconnect()
      section.removeEventListener('pointermove', onMove)
      section.removeEventListener('pointerdown', onMove)
      section.removeEventListener('pointerleave', onLeave)
      section.removeEventListener('click', onClick)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [name, signals, stats, router])

  return (
    <section ref={sectionRef} className="relative h-[100svh] min-h-[640px] overflow-hidden select-none">
      <pre
        ref={preRef}
        aria-hidden="true"
        className="ascii absolute inset-0 m-0 whitespace-pre text-[10px] leading-[10px] md:text-[12px] md:leading-[12px]"
        style={{ fontFamily: 'var(--font-mono)' }}
      />

      <div ref={containerRef} className="absolute inset-x-6 bottom-0 top-0 max-w-6xl mx-auto pointer-events-none">
        <h1 className="sr-only">{name}</h1>
        <div ref={copyRef} className="pointer-events-auto absolute left-0 bottom-24 max-w-md">
          <p className="mb-3 text-sm" style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>
            {tagline}
          </p>
          <p className="mb-8 text-base md:text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            {description}
          </p>
          <div className="flex flex-wrap gap-3">
            <NeonButton href="/projects" variant="cyan">View projects</NeonButton>
            <NeonButton href="/blog" variant="purple">Read the blog</NeonButton>
          </div>
        </div>

        <div
          className="absolute inset-x-0 bottom-6 flex flex-wrap items-center justify-between gap-x-6 gap-y-1 text-xs"
          style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}
        >
          <span>
            <span style={{ color: 'var(--accent)' }}>●</span> {stats.posts} posts · {stats.projects} projects
            {stats.lastWrite && <> · last write {stats.lastWrite}</>}
          </span>
          <span aria-live="polite" className="min-w-0 truncate pointer-events-auto">
            {hud ? (
              <a href={hud.href} style={{ color: hud.hovered ? 'var(--accent)' : 'var(--text-secondary)' }}>
                decoding → {hud.title} {hud.hovered && '↵'}
              </a>
            ) : (
              'move the cursor to decode · click anywhere'
            )}
          </span>
        </div>
      </div>
    </section>
  )
}
