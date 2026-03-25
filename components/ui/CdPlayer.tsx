'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

const BAR_COUNT = 24
const SONG_NAME = '周杰倫 — 太陽之子-西西里'

export default function CdPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [playing, setPlaying] = useState(false)
  const [volume, setVolume] = useState(0.5)
  const [expanded, setExpanded] = useState(false)
  const [beat, setBeat] = useState(0)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const ctxRef = useRef<AudioContext | null>(null)
  const rafRef = useRef<number>(0)
  const barsRef = useRef<number[]>(new Array(BAR_COUNT).fill(0))

  // Set initial volume
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = 0.5
  }, [])

  const setupAudio = useCallback(() => {
    if (ctxRef.current || !audioRef.current) return
    const ctx = new AudioContext()
    const source = ctx.createMediaElementSource(audioRef.current)
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 128
    analyser.smoothingTimeConstant = 0.75
    source.connect(analyser)
    analyser.connect(ctx.destination)
    ctxRef.current = ctx
    sourceRef.current = source
    analyserRef.current = analyser
  }, [])

  const drawBars = useCallback(() => {
    const canvas = canvasRef.current
    const analyser = analyserRef.current
    if (!canvas || !analyser) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const data = new Uint8Array(analyser.frequencyBinCount)
    analyser.getByteFrequencyData(data)

    // Bass for beat pulse
    const bass = (data[0] + data[1] + data[2] + data[3]) / 4 / 255
    setBeat(bass)

    // Map frequency data to bars with smoothing
    const step = Math.floor(data.length / BAR_COUNT)
    for (let i = 0; i < BAR_COUNT; i++) {
      const raw = data[i * step] / 255
      barsRef.current[i] += (raw - barsRef.current[i]) * 0.3
    }

    const w = canvas.width
    const h = canvas.height
    const dpr = window.devicePixelRatio || 1
    ctx.clearRect(0, 0, w, h)

    const barW = (w / dpr) / BAR_COUNT
    const maxH = h / dpr

    for (let i = 0; i < BAR_COUNT; i++) {
      const val = barsRef.current[i]
      const barH = Math.max(2, val * maxH * 0.9)

      // Gradient from cyan to purple based on frequency
      const ratio = i / BAR_COUNT
      const r = Math.round(0 + ratio * 191)
      const g = Math.round(212 - ratio * 212)
      const b = Math.round(255)

      ctx.fillStyle = `rgba(${r},${g},${b},${0.6 + val * 0.4})`
      ctx.shadowColor = `rgba(${r},${g},${b},0.5)`
      ctx.shadowBlur = 4 * val

      const x = i * barW + 1
      ctx.fillRect(x * dpr, (maxH - barH) * dpr, (barW - 2) * dpr, barH * dpr)
    }

    rafRef.current = requestAnimationFrame(drawBars)
  }, [])

  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  // Resize canvas for retina
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    canvas.width = 200 * dpr
    canvas.height = 40 * dpr
  }, [])

  const toggle = useCallback(async () => {
    const audio = audioRef.current
    if (!audio) return

    if (!playing) {
      setupAudio()
      if (ctxRef.current?.state === 'suspended') await ctxRef.current.resume()
      await audio.play()
      setPlaying(true)
      setExpanded(true)
      rafRef.current = requestAnimationFrame(drawBars)
    } else {
      audio.pause()
      setPlaying(false)
      cancelAnimationFrame(rafRef.current)
      setBeat(0)
      barsRef.current = new Array(BAR_COUNT).fill(0)
      // Clear canvas
      const canvas = canvasRef.current
      if (canvas) {
        const ctx = canvas.getContext('2d')
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }
  }, [playing, setupAudio, drawBars])

  const handleVolume = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value)
    setVolume(v)
    if (audioRef.current) audioRef.current.volume = v
  }, [])

  const handleEnded = useCallback(() => {
    const audio = audioRef.current
    if (audio) {
      audio.currentTime = 0
      audio.play()
    }
  }, [])

  const glowSize = 8 + beat * 16
  const glowAlpha = 0.1 + beat * 0.35

  return (
    <div
      className="fixed z-40 flex items-end gap-0"
      style={{ bottom: '1.2rem', right: '1.2rem' }}
    >
      {/* Expanded panel */}
      <div
        className="overflow-hidden rounded-xl mr-2"
        style={{
          width: expanded ? '210px' : '0px',
          opacity: expanded ? 1 : 0,
          transition: 'width 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease',
          background: 'rgba(5,5,16,0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: `0 0 ${glowSize}px rgba(0,212,255,${glowAlpha})`,
        }}
      >
        <div className="p-3" style={{ width: '210px' }}>
          {/* Song name marquee */}
          <div className="overflow-hidden mb-2" style={{ height: '16px' }}>
            <div className="whitespace-nowrap animate-marquee">
              <span
                className="text-[10px] font-semibold tracking-wide"
                style={{ color: 'var(--cyan, #00d4ff)', fontFamily: 'Space Grotesk, sans-serif' }}
              >
                {SONG_NAME}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{SONG_NAME}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
            </div>
          </div>

          {/* Visualizer bars */}
          <canvas
            ref={canvasRef}
            className="rounded-md mb-2"
            style={{
              width: '200px',
              height: '40px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '6px',
            }}
          />

          {/* Volume control */}
          <div className="flex items-center gap-2">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2">
              <path d="M11 5L6 9H2v6h4l5 4V5z" />
              {volume > 0.3 && <path d="M15.54 8.46a5 5 0 010 7.07" />}
              {volume > 0.6 && <path d="M19.07 4.93a10 10 0 010 14.14" />}
            </svg>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={handleVolume}
              className="volume-slider flex-1"
              style={{ height: '3px', accentColor: 'var(--cyan, #00d4ff)' }}
            />
            <span className="text-[9px] font-mono w-7 text-right" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {Math.round(volume * 100)}
            </span>
          </div>
        </div>
      </div>

      {/* DJ Disc button */}
      <button
        onClick={toggle}
        onContextMenu={e => { e.preventDefault(); setExpanded(v => !v) }}
        className="relative flex-shrink-0 rounded-full outline-none focus:outline-none group"
        style={{ width: '52px', height: '52px' }}
        title={playing ? 'Pause (right-click: toggle panel)' : 'Play'}
      >
        {/* Outer glow ring */}
        <div
          className="absolute inset-[-4px] rounded-full pointer-events-none"
          style={{
            background: `conic-gradient(from ${playing ? '0deg' : '0deg'},
              rgba(0,212,255,${glowAlpha}) 0%,
              rgba(191,0,255,${glowAlpha * 0.7}) 33%,
              rgba(255,0,168,${glowAlpha * 0.5}) 66%,
              rgba(0,212,255,${glowAlpha}) 100%)`,
            filter: `blur(${4 + beat * 6}px)`,
            animation: playing ? 'spin-cd 4s linear infinite' : 'none',
            opacity: playing ? 1 : 0,
            transition: 'opacity 0.3s ease',
          }}
        />

        {/* Disc body */}
        <div
          className="absolute inset-0 rounded-full overflow-hidden"
          style={{
            background: 'radial-gradient(circle at 35% 35%, #2a2a3a, #0a0a14)',
            border: '2px solid rgba(255,255,255,0.12)',
            animation: playing ? 'spin-cd 3s linear infinite' : 'none',
            boxShadow: playing
              ? `0 0 ${glowSize}px rgba(0,212,255,${glowAlpha}), inset 0 0 12px rgba(0,0,0,0.5)`
              : 'inset 0 0 12px rgba(0,0,0,0.5)',
          }}
        >
          {/* Vinyl grooves */}
          <div
            className="absolute inset-[2px] rounded-full"
            style={{
              background: `repeating-radial-gradient(circle at center,
                transparent 0px, transparent 2px,
                rgba(255,255,255,0.03) 2.5px, transparent 3px)`,
            }}
          />

          {/* CD cover image */}
          <img
            src="/cd-cover.jpg"
            alt=""
            className="absolute rounded-full object-cover"
            style={{
              width: '26px',
              height: '26px',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              border: '1.5px solid rgba(255,255,255,0.1)',
            }}
          />

          {/* Center spindle */}
          <div
            className="absolute rounded-full"
            style={{
              width: '6px',
              height: '6px',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: playing ? 'var(--cyan, #00d4ff)' : '#333',
              boxShadow: playing ? '0 0 6px rgba(0,212,255,0.8)' : 'none',
              transition: 'background 0.3s, box-shadow 0.3s',
            }}
          />
        </div>

        {/* Play/Pause overlay */}
        <div
          className="absolute inset-0 rounded-full flex items-center justify-center transition-opacity"
          style={{
            background: 'rgba(0,0,0,0.35)',
            opacity: playing ? 0 : 1,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white" opacity="0.9">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>

        {/* Hover pause icon */}
        {playing && (
          <div
            className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            style={{ background: 'rgba(0,0,0,0.4)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white" opacity="0.9">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          </div>
        )}
      </button>

      <audio ref={audioRef} src="/bg-music.mp3" preload="none" onEnded={handleEnded} />
    </div>
  )
}
