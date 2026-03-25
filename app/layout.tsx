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
import CdPlayer from '@/components/ui/CdPlayer'

export const metadata: Metadata = {
  metadataBase: new URL('https://0xjoeytw.xyz'),
  title: 'Joey Chen — Developer & Builder',
  description: 'Personal website of Joey Chen — blockchain developer, builder, and creator.',
  alternates: {
    canonical: '/',
  },
  other: {
    'google-adsense-account': 'ca-pub-9548192708890896',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
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
          <CdPlayer />
        </ThemeProvider>
      </body>
    </html>
  )
}
