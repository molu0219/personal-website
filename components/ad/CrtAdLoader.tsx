'use client'

import { usePathname } from 'next/navigation'
import CrtAdTerminal from './CrtAdTerminal'

const AD_PATHS = ['/blog', '/projects']

export default function CrtAdLoader() {
  const pathname = usePathname()

  // Show on /blog, /blog/*, /projects, /projects/*
  const shouldShow = AD_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))

  if (!shouldShow) return null
  return <CrtAdTerminal />
}
