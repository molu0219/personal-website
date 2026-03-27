import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — Joey Chen',
  description: 'Privacy policy for 0xjoeytw.xyz — how we collect, use, and protect your data.',
  alternates: { canonical: '/privacy' },
  robots: { index: true, follow: true },
}

export default function PrivacyPage() {
  return (
    <div className="relative z-10 min-h-screen pb-24">
      <div className="max-w-3xl mx-auto px-6 pt-36">
        <h1
          className="text-3xl font-bold mb-8"
          style={{ fontFamily: 'Space Grotesk, sans-serif', color: 'var(--text-primary)' }}
        >
          Privacy Policy
        </h1>

        <div
          className="space-y-6 text-base leading-relaxed"
          style={{ color: 'var(--text-secondary)', fontFamily: 'Inter, sans-serif' }}
        >
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Last updated: March 27, 2026
          </p>

          <p>
            This website (0xjoeytw.xyz) is operated by Joey Chen as a personal site. This policy
            explains how data is collected and used when you visit.
          </p>

          <h2 className="text-xl font-semibold pt-2" style={{ color: 'var(--text-primary)', fontFamily: 'Space Grotesk, sans-serif' }}>
            Data Collection
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Analytics:</strong> Anonymous page view data is collected (page path, timestamp,
              and a hashed IP address). Raw IP addresses are never stored.
            </li>
            <li>
              <strong>Cookies:</strong> Google AdSense (pending activation) may use cookies to serve
              personalized ads. Cloudflare may set security-related cookies.
            </li>
            <li>
              <strong>No accounts:</strong> Public pages do not require registration or login.
            </li>
          </ul>

          <h2 className="text-xl font-semibold pt-2" style={{ color: 'var(--text-primary)', fontFamily: 'Space Grotesk, sans-serif' }}>
            Data Storage
          </h2>
          <p>
            Analytics data is stored in Supabase (hosted on AWS) and transmitted over HTTPS.
            No personally identifiable information is stored.
          </p>

          <h2 className="text-xl font-semibold pt-2" style={{ color: 'var(--text-primary)', fontFamily: 'Space Grotesk, sans-serif' }}>
            Third-Party Services
          </h2>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Cloudflare:</strong> CDN, DNS, and edge computing services.</li>
            <li><strong>Supabase:</strong> Database and backend services.</li>
            <li><strong>Google AdSense:</strong> Advertising service (pending activation).</li>
          </ul>

          <h2 className="text-xl font-semibold pt-2" style={{ color: 'var(--text-primary)', fontFamily: 'Space Grotesk, sans-serif' }}>
            Your Rights
          </h2>
          <p>
            To inquire about, modify, or delete any data associated with you, please contact me
            via <a href="https://twitter.com/0xjoeytw" className="underline" style={{ color: 'var(--cyan)' }}>Twitter (@0xjoeytw)</a> or <a href="https://github.com/molu0219" className="underline" style={{ color: 'var(--cyan)' }}>GitHub (molu0219)</a>.
          </p>

          <h2 className="text-xl font-semibold pt-2" style={{ color: 'var(--text-primary)', fontFamily: 'Space Grotesk, sans-serif' }}>
            Changes
          </h2>
          <p>
            This policy may be updated from time to time. Changes will be posted on this page with
            an updated date.
          </p>
        </div>
      </div>
    </div>
  )
}
