import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import NeonCursor from '@/components/art/NeonCursor'
import ThemeProvider from '@/components/ThemeProvider'
import PageViewTracker from '@/components/PageViewTracker'
// CrtAdLoader disabled until AdSense approval — placeholder ad slot triggers policy violation
// import CrtAdLoader from '@/components/ad/CrtAdLoader'
import ImageLightbox from '@/components/ui/ImageLightbox'

export const metadata: Metadata = {
  metadataBase: new URL('https://0xjoeytw.xyz'),
  title: 'Joey Chen — Developer & Builder',
  description: 'Personal website of Joey Chen — blockchain developer, builder, and creator.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Joey Chen — Developer & Builder',
    description: 'Personal website of Joey Chen — blockchain developer, builder, and creator.',
    url: 'https://0xjoeytw.xyz',
    siteName: 'Joey Chen',
    type: 'website',
    locale: 'zh_TW',
  },
  twitter: {
    card: 'summary',
    title: 'Joey Chen — Developer & Builder',
    description: 'Personal website of Joey Chen — blockchain developer, builder, and creator.',
    creator: '@0xjoeytw',
  },
  other: {
    'google-adsense-account': 'ca-pub-9548192708890896',
  },
}

const jsonLdWebSite = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': 'https://0xjoeytw.xyz/#website',
  name: 'Joey Chen',
  alternateName: '0xjoeytw',
  url: 'https://0xjoeytw.xyz',
  description: 'Personal website of Joey Chen — blockchain developer, builder, and creator.',
  inLanguage: ['zh-TW', 'en'],
  author: { '@id': 'https://0xjoeytw.xyz/#person' },
}

const jsonLdPerson = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': 'https://0xjoeytw.xyz/#person',
  name: 'Joey Chen',
  url: 'https://0xjoeytw.xyz',
  description: 'Blockchain developer, builder, and creator. Building at the intersection of blockchain, AI, and generative art.',
  jobTitle: 'Blockchain Developer',
  sameAs: [
    'https://github.com/molu0219',
    'https://twitter.com/0xjoeytw',
  ],
  knowsAbout: ['Blockchain', 'Solidity', 'Web3', 'AI Development', 'TypeScript', 'React', 'Next.js', 'Claude Code'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebSite) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdPerson) }} />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9548192708890896"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <ThemeProvider>
          <PageViewTracker />
          <NeonCursor />
          <Navbar />
          <main>{children}</main>
          <Footer />
          {/* <CrtAdLoader /> */}
          <ImageLightbox />
        </ThemeProvider>
      </body>
    </html>
  )
}
