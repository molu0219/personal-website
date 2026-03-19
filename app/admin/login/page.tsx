'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import GlassCard from '@/components/ui/GlassCard'
import GlassInput from '@/components/ui/GlassInput'
import NeonButton from '@/components/ui/NeonButton'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })

    if (err) {
      setError(err.message)
      setLoading(false)
    } else {
      localStorage.setItem('is_admin', '1')
      router.push('/admin')
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ background: 'var(--bg)' }}>
      <GlassCard className="w-full max-w-sm p-8">
        <h1 className="text-2xl font-bold mb-2 text-center" style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}>
          Admin Login
        </h1>
        <p className="text-sm text-center mb-8" style={{ color: 'var(--text-secondary)' }}>
          Sign in to manage your content
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <GlassInput
            label="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full"
          />
          <GlassInput
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full"
          />
          {error && <p className="text-sm" style={{ color: 'var(--pink)' }}>{error}</p>}
          <NeonButton type="submit" variant="cyan" disabled={loading} className="w-full justify-center">
            {loading ? 'Signing in…' : 'Sign In'}
          </NeonButton>
        </form>
      </GlassCard>
    </div>
  )
}
