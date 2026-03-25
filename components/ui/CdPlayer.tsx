'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

export default function CdPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [beat, setBeat] = useState(0)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const ctxRef = useRef<AudioContext | null>(null)
  const rafRef = useRef<number>(0)

  const setupAudio = useCallback(() => {
    if (ctxRef.current || !audioRef.current) return
    const ctx = new AudioContext()
    const source = ctx.createMediaElementSource(audioRef.current)
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 64
    source.connect(analyser)
    analyser.connect(ctx.destination)
    ctxRef.current = ctx
    sourceRef.current = source
    analyserRef.current = analyser
  }, [])

  const tick = useCallback(() => {
    if (!analyserRef.current) return
    const data = new Uint8Array(analyserRef.current.frequencyBinCount)
    analyserRef.current.getByteFrequencyData(data)
    // Average of low frequencies (bass)
    const bass = (data[0] + data[1] + data[2] + data[3]) / 4 / 255
    setBeat(bass)
    rafRef.current = requestAnimationFrame(tick)
  }, [])

  useEffect(() => {
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  const toggle = useCallback(async () => {
    const audio = audioRef.current
    if (!audio) return

    if (!playing) {
      setupAudio()
      if (ctxRef.current?.state === 'suspended') await ctxRef.current.resume()
      await audio.play()
      setPlaying(true)
      rafRef.current = requestAnimationFrame(tick)
    } else {
      audio.pause()
      setPlaying(false)
      cancelAnimationFrame(rafRef.current)
      setBeat(0)
    }
  }, [playing, setupAudio, tick])

  // When song ends
  const handleEnded = useCallback(() => {
    const audio = audioRef.current
    if (audio) {
      audio.currentTime = 0
      audio.play()
    }
  }, [])

  const scale = 1 + beat * 0.08
  const glowAlpha = 0.15 + beat * 0.5

  return (
    <div
      className="fixed z-50 flex items-center gap-2"
      style={{ bottom: '1.5rem', right: '1.5rem' }}
    >
      {/* Marquee — song name */}
      <div
        className="overflow-hidden rounded-full px-3 py-1"
        style={{
          width: playing ? '140px' : '0px',
          opacity: playing ? 1 : 0,
          transition: 'width 0.4s ease, opacity 0.3s ease',
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <div className="whitespace-nowrap animate-marquee">
          <span
            className="text-[10px] font-medium"
            style={{ color: 'var(--cyan, #00d4ff)', fontFamily: 'Space Grotesk, sans-serif' }}
          >
            周杰倫 — 太陽之子-西西里&nbsp;&nbsp;&nbsp;&nbsp;周杰倫 — 太陽之子-西西里&nbsp;&nbsp;&nbsp;&nbsp;
          </span>
        </div>
      </div>

      {/* CD disc */}
      <button
        onClick={toggle}
        className="relative flex-shrink-0 rounded-full outline-none focus:outline-none"
        style={{
          width: '48px',
          height: '48px',
          transform: `scale(${scale})`,
          transition: 'transform 0.05s ease-out',
        }}
        title={playing ? 'Pause' : 'Play'}
      >
        {/* Glow ring */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow: `0 0 ${12 + beat * 20}px rgba(0,212,255,${glowAlpha})`,
            transition: 'box-shadow 0.05s ease-out',
          }}
        />

        {/* Disc body */}
        <div
          className="absolute inset-0 rounded-full overflow-hidden"
          style={{
            background: 'conic-gradient(from 0deg, #111 0%, #333 25%, #111 50%, #333 75%, #111 100%)',
            border: '2px solid rgba(255,255,255,0.15)',
            animation: playing ? 'spin-cd 3s linear infinite' : 'none',
          }}
        >
          {/* CD cover image */}
          <img
            src="/cd-cover.jpg"
            alt="CD"
            className="absolute inset-[4px] rounded-full object-cover"
            style={{
              width: 'calc(100% - 8px)',
              height: 'calc(100% - 8px)',
            }}
          />

          {/* Center hole */}
          <div
            className="absolute rounded-full"
            style={{
              width: '10px',
              height: '10px',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: '#000',
              border: '1.5px solid rgba(255,255,255,0.2)',
            }}
          />
        </div>

        {/* Play/Pause icon overlay */}
        {!playing && (
          <div
            className="absolute inset-0 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.4)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        )}
      </button>

      {/* Beat pulse rings */}
      {playing && beat > 0.3 && (
        <>
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: '48px',
              height: '48px',
              right: '0',
              bottom: '0',
              border: '1px solid rgba(0,212,255,0.3)',
              transform: `scale(${1.2 + beat * 0.5})`,
              opacity: 1 - beat * 0.5,
              transition: 'transform 0.1s ease-out, opacity 0.1s ease-out',
            }}
          />
        </>
      )}

      <audio ref={audioRef} src="/bg-music.mp3" preload="none" onEnded={handleEnded} />
    </div>
  )
}
