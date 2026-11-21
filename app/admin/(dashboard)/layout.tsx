import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/admin/login')
  } catch {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside
        className="w-56 flex-shrink-0 flex flex-col gap-1 p-4 pt-24"
        style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}
      >
        <p className="text-xs font-semibold px-3 mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.1em' }}>ADMIN</p>
        {[
          { href: '/admin', label: 'Dashboard' },
          { href: '/admin/analytics', label: 'Analytics' },
          { href: '/admin/projects', label: 'Projects' },
          { href: '/admin/posts', label: 'Blog Posts' },
          { href: '/admin/about', label: 'About' },
        ].map(link => (
          <Link
            key={link.href}
            href={link.href}
            className="px-3 py-2 rounded-lg text-sm transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            {link.label}
          </Link>
        ))}

        <div className="flex-1" />

        <Link
          href="/"
          className="px-3 py-2 rounded-lg text-sm"
          style={{ color: 'var(--text-muted)' }}
        >
          ← Back to Site
        </Link>
      </aside>

      <main className="flex-1 p-8 pt-24 overflow-auto">
        {children}
      </main>
    </div>
  )
}
