'use client'

import { useRef } from 'react'

export default function ScrollCarousel({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const startX = useRef(0)
  const scrollLeft = useRef(0)

  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true
    startX.current = e.pageX - (ref.current?.offsetLeft ?? 0)
    scrollLeft.current = ref.current?.scrollLeft ?? 0
    if (ref.current) ref.current.style.cursor = 'grabbing'
  }

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !ref.current) return
    e.preventDefault()
    const x = e.pageX - ref.current.offsetLeft
    const walk = (x - startX.current) * 1.2
    ref.current.scrollLeft = scrollLeft.current - walk
  }

  const stopDrag = () => {
    isDragging.current = false
    if (ref.current) ref.current.style.cursor = 'grab'
  }

  return (
    <div
      ref={ref}
      className="flex gap-5 overflow-x-auto pb-4 select-none"
      style={{
        scrollSnapType: 'x mandatory',
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        cursor: 'grab',
      }}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={stopDrag}
      onMouseLeave={stopDrag}
    >
      <style>{`.carousel-hide-scrollbar::-webkit-scrollbar { display: none; }`}</style>
      {children}
    </div>
  )
}
