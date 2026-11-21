'use client'

import { useSyncExternalStore } from 'react'
import { useTheme } from 'next-themes'
import { Sun, Moon } from 'lucide-react'

const noopSubscribe = () => () => {}

/** false during SSR/hydration, true after — the theme is only known on the client. */
function useIsClient() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false)
}

const ICON =
  'absolute inset-0 grid place-items-center transition-[opacity,transform] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)]'

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const isClient = useIsClient()

  if (!isClient) return <div className="w-9 h-9" />

  const isDark = resolvedTheme === 'dark'

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="relative w-9 h-9 rounded-md transition-[background-color,color,transform] duration-150 hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)] active:scale-[0.92]"
      style={{ color: 'var(--text-secondary)' }}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      {/* Both icons stay mounted and cross-fade with a quarter turn. */}
      <span className={`${ICON} ${isDark ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'}`}>
        <Sun size={16} />
      </span>
      <span className={`${ICON} ${isDark ? 'opacity-0 rotate-90' : 'opacity-100 rotate-0'}`}>
        <Moon size={16} />
      </span>
    </button>
  )
}
