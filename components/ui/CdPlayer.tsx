'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

const BAR_COUNT = 20
const SONG_NAME = '周杰倫 — 太陽之子-西西里'

export default function CdPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [playing, setPlaying] = useState(false)
  const [volume, setVolume] = useState(0.5)
  const [beat, setBeat] = useState(0)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const ctxRef = useRef<AudioContext | null>(null)
  const rafRef = useRef<number>(0)
  const barsRef = useRef<number[]>(new Array(BAR_COUNT).fill(0))

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

    const bass = (data[0] + data[1] + data[2] + data[3]) / 4 / 255
    setBeat(bass)

    const step = Math.floor(data.length / BAR_COUNT)
    for (let i = 0; i < BAR_COUNT; i++) {
      const raw = data[i * step] / 255
      barsRef.current[i] += (raw - barsRef.current[i]) * 0.3
    }

    const dpr = window.devicePixelRatio || 1
    const w = canvas.width / dpr
    const h = canvas.height / dpr
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const barW = w / BAR_COUNT

    for (let i = 0; i < BAR_COUNT; i++) {
      const val = barsRef.current[i]
      const barH = Math.max(1.5, val * h * 0.85)

      const ratio = i / BAR_COUNT
      const r = Math.round(ratio * 191)
      const g = Math.round(212 - ratio * 212)

      ctx.fillStyle = `rgba(${r},${g},255,${0.5 + val * 0.5})`
      ctx.shadowColor = `rgba(${r},${g},255,0.4)`
      ctx.shadowBlur = 3 * val

      const x = i * barW + 0.5
      ctx.fillRect(x * dpr, (h - barH) * dpr, (barW - 1) * dpr, barH * dpr)
    }

    rafRef.current = requestAnimationFrame(drawBars)
  }, [])

  useEffect(() => () => cancelAnimationFrame(rafRef.current), [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    canvas.width = 140 * dpr
    canvas.height = 32 * dpr
  }, [])

  const toggle = useCallback(async () => {
    const audio = audioRef.current
    if (!audio) return

    if (!playing) {
      setupAudio()
      if (ctxRef.current?.state === 'suspended') await ctxRef.current.resume()
      await audio.play()
      setPlaying(true)
      rafRef.current = requestAnimationFrame(drawBars)
    } else {
      audio.pause()
      setPlaying(false)
      cancelAnimationFrame(rafRef.current)
      setBeat(0)
      barsRef.current = new Array(BAR_COUNT).fill(0)
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
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play()
    }
  }, [])

  const glowAlpha = 0.08 + beat * 0.3

  return (
    <div
      className="fixed z-40"
      style={{ bottom: '1.2rem', right: '1.2rem' }}
    >
      <div
        className="flex items-center gap-3 rounded-2xl px-3 py-2.5"
        style={{
          background: 'rgba(5,5,16,0.88)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: `0 0 ${6 + beat * 14}px rgba(0,212,255,${glowAlpha}), 0 4px 20px rgba(0,0,0,0.4)`,
          transition: 'box-shadow 0.08s ease-out',
        }}
      >
        {/* ── CD Disc ── */}
        <button
          onClick={toggle}
          className="relative flex-shrink-0 rounded-full outline-none focus:outline-none group"
          style={{ width: '44px', height: '44px' }}
          title={playing ? 'Pause' : 'Play'}
        >
          {/* Glow ring */}
          <div
            className="absolute inset-[-3px] rounded-full pointer-events-none"
            style={{
              background: `conic-gradient(from 0deg,
                rgba(0,212,255,${glowAlpha}) 0%,
                rgba(191,0,255,${glowAlpha * 0.6}) 33%,
                rgba(255,0,168,${glowAlpha * 0.4}) 66%,
                rgba(0,212,255,${glowAlpha}) 100%)`,
              filter: `blur(${3 + beat * 5}px)`,
              animation: playing ? 'spin-cd 4s linear infinite' : 'none',
              opacity: playing ? 1 : 0,
              transition: 'opacity 0.3s',
            }}
          />

          {/* Disc */}
          <div
            className="absolute inset-0 rounded-full overflow-hidden"
            style={{
              background: 'radial-gradient(circle at 35% 35%, #2a2a3a, #0a0a14)',
              border: '1.5px solid rgba(255,255,255,0.1)',
              animation: playing ? 'spin-cd 3s linear infinite' : 'none',
            }}
          >
            {/* Grooves */}
            <div
              className="absolute inset-[1px] rounded-full"
              style={{
                background: `repeating-radial-gradient(circle at center,
                  transparent 0px, transparent 2px,
                  rgba(255,255,255,0.03) 2.5px, transparent 3px)`,
              }}
            />
            {/* Cover */}
            <img
              src="/cd-cover.jpg"
              alt=""
              className="absolute rounded-full object-cover"
              style={{
                width: '22px', height: '22px',
                top: '50%', left: '50%',
                transform: 'translate(-50%,-50%)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            />
            {/* Spindle */}
            <div
              className="absolute rounded-full"
              style={{
                width: '5px', height: '5px',
                top: '50%', left: '50%',
                transform: 'translate(-50%,-50%)',
                background: playing ? 'var(--cyan, #00d4ff)' : '#444',
                boxShadow: playing ? '0 0 5px rgba(0,212,255,0.8)' : 'none',
                transition: 'all 0.3s',
              }}
            />
          </div>

          {/* Play overlay */}
          <div
            className="absolute inset-0 rounded-full flex items-center justify-center transition-opacity"
            style={{
              background: 'rgba(0,0,0,0.3)',
              opacity: playing ? 0 : 1,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white" opacity="0.85">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>

          {/* Hover pause */}
          {playing && (
            <div
              className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: 'rgba(0,0,0,0.35)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white" opacity="0.85">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            </div>
          )}
        </button>

        {/* ── Info + Visualizer + Volume ── */}
        <div className="flex flex-col gap-1.5 min-w-0" style={{ width: '150px' }}>
          {/* Song name marquee */}
          <div className="overflow-hidden" style={{ height: '14px' }}>
            <div
              className="whitespace-nowrap"
              style={{ animation: 'marquee-scroll 10s linear infinite' }}
            >
              <span
                className="text-[10px] font-semibold"
                style={{
                  color: 'var(--cyan, #00d4ff)',
                  fontFamily: 'Space Grotesk, sans-serif',
                  letterSpacing: '0.02em',
                  lineHeight: '14px',
                  verticalAlign: 'middle',
                }}
              >
                {SONG_NAME}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{SONG_NAME}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
            </div>
          </div>

          {/* Visualizer */}
          <canvas
            ref={canvasRef}
            className="rounded"
            style={{
              width: '140px',
              height: '32px',
              background: 'rgba(255,255,255,0.02)',
              borderRadius: '4px',
            }}
          />

          {/* Volume */}
          <div className="flex items-center gap-1.5">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2.5">
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
              style={{ height: '2px' }}
            />
            <span
              className="text-[8px] font-mono tabular-nums"
              style={{ color: 'rgba(255,255,255,0.25)', width: '20px', textAlign: 'right' }}
            >
              {Math.round(volume * 100)}
            </span>
          </div>
        </div>
      </div>

      <audio ref={audioRef} src="/bg-music.mp3" preload="none" onEnded={handleEnded} />
    </div>
  )
}
