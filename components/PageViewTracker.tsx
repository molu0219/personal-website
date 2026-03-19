'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

export default function PageViewTracker() {
  const pathname = usePathname()
  const lastTracked = useRef<string | null>(null)

  useEffect(() => {
    if (pathname === lastTracked.current) return
    // Skip localhost and admin users
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') return
    if (localStorage.getItem('is_admin') === '1') return
    lastTracked.current = pathname

    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: pathname,
        referrer: document.referrer || null,
      }),
    }).catch(() => {})
  }, [pathname])

  return null
}
