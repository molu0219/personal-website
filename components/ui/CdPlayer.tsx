'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

const BAR_COUNT = 12
const SONG_NAME = '周杰倫 — 太陽之子-西西里'

export default function CdPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [playing, setPlaying] = useState(false)
  const [volume, setVolume] = useState(0.5)
  const [muted, setMuted] = useState(false)
  const [showVolume, setShowVolume] = useState(false)
  const [beat, setBeat] = useState(0)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const actxRef = useRef<AudioContext | null>(null)
  const rafRef = useRef<number>(0)
  const barsRef = useRef<number[]>(new Array(BAR_COUNT).fill(0))
  const prevVolume = useRef(0.5)
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = 0.5
  }, [])

  const setupAudio = useCallback(() => {
    if (actxRef.current || !audioRef.current) return
    const ctx = new AudioContext()
    const source = ctx.createMediaElementSource(audioRef.current)
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 64
    analyser.smoothingTimeConstant = 0.7
    source.connect(analyser)
    analyser.connect(ctx.destination)
    actxRef.current = ctx
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
      barsRef.current[i] += (raw - barsRef.current[i]) * 0.35
    }

    const dpr = window.devicePixelRatio || 1
    const w = canvas.width / dpr
    const h = canvas.height / dpr
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const barW = w / BAR_COUNT

    for (let i = 0; i < BAR_COUNT; i++) {
      const val = barsRef.current[i]
      const barH = Math.max(1, val * h * 0.9)
      const ratio = i / BAR_COUNT
      const r = Math.round(ratio * 191)
      const g = Math.round(212 - ratio * 212)
      ctx.fillStyle = `rgba(${r},${g},255,${0.5 + val * 0.5})`
      ctx.shadowColor = `rgba(${r},${g},255,0.3)`
      ctx.shadowBlur = 2 * val
      ctx.fillRect((i * barW + 0.5) * dpr, (h - barH) * dpr, (barW - 1) * dpr, barH * dpr)
    }
    rafRef.current = requestAnimationFrame(drawBars)
  }, [])

  useEffect(() => () => cancelAnimationFrame(rafRef.current), [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    canvas.width = 48 * dpr
    canvas.height = 20 * dpr
  }, [])

  const toggle = useCallback(async () => {
    const audio = audioRef.current
    if (!audio) return
    if (!playing) {
      setupAudio()
      if (actxRef.current?.state === 'suspended') await actxRef.current.resume()
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

  const toggleMute = useCallback(() => {
    if (!audioRef.current) return
    if (muted) {
      audioRef.current.volume = prevVolume.current
      setVolume(prevVolume.current)
      setMuted(false)
    } else {
      prevVolume.current = volume
      audioRef.current.volume = 0
      setVolume(0)
      setMuted(true)
    }
  }, [muted, volume])

  const handleVolume = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value)
    setVolume(v)
    setMuted(v === 0)
    if (audioRef.current) audioRef.current.volume = v
  }, [])

  const handleEnded = useCallback(() => {
    if (audioRef.current) { audioRef.current.currentTime = 0; audioRef.current.play() }
  }, [])

  // Show volume on hover, hide after delay
  const showVol = useCallback(() => {
    if (hideTimeout.current) clearTimeout(hideTimeout.current)
    setShowVolume(true)
  }, [])

  const hideVol = useCallback(() => {
    hideTimeout.current = setTimeout(() => setShowVolume(false), 1200)
  }, [])

  return (
    <div className="flex flex-col gap-0.5" onMouseEnter={showVol} onMouseLeave={hideVol}>
      {/* Row 1: Play + Visualizer bars */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={toggle}
          className="outline-none focus:outline-none flex items-center justify-center rounded-md transition-colors"
          style={{
            width: '20px', height: '20px',
            background: 'rgba(255,255,255,0.06)',
            border: 'none', cursor: 'pointer',
            color: playing ? 'var(--cyan, #00d4ff)' : 'var(--text-muted)',
          }}
          title={playing ? 'Pause' : 'Play'}
        >
          {playing ? (
            <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        <canvas
          ref={canvasRef}
          className="rounded-sm"
          style={{
            width: '48px', height: '20px',
            opacity: playing ? 1 : 0.3,
            transition: 'opacity 0.3s',
          }}
        />
      </div>

      {/* Row 2: Volume icon + slider */}
      <div className="flex items-center gap-1">
        <button
          onClick={toggleMute}
          className="outline-none focus:outline-none flex items-center justify-center flex-shrink-0"
          style={{ background: 'none', border: 'none', cursor: 'pointer', width: '14px', height: '14px' }}
          title={muted ? 'Unmute' : 'Mute'}
        >
          <svg
            width="10" height="10" viewBox="0 0 24 24" fill="none"
            stroke={muted ? 'rgba(255,82,82,0.7)' : 'var(--text-muted)'}
            strokeWidth="2.5"
          >
            <path d="M11 5L6 9H2v6h4l5 4V5z" />
            {!muted && volume > 0.3 && <path d="M15.54 8.46a5 5 0 010 7.07" />}
            {!muted && volume > 0.6 && <path d="M19.07 4.93a10 10 0 010 14.14" />}
            {muted && <><line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" /></>}
          </svg>
        </button>
        <input
          type="range" min="0" max="1" step="0.01"
          value={volume} onChange={handleVolume}
          className="volume-slider" style={{ width: '56px', height: '2px' }}
        />
      </div>

      <audio ref={audioRef} src="/bg-music.mp3" preload="none" onEnded={handleEnded} />
    </div>
  )
}
