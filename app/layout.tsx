import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import NeonCursor from '@/components/art/NeonCursor'
import ThemeProvider from '@/components/ThemeProvider'
import PageViewTracker from '@/components/PageViewTracker'
import CrtAdLoader from '@/components/ad/CrtAdLoader'

export const metadata: Metadata = {
  title: 'Joey Chen — Developer & Builder',
  description: 'Personal website of Joey Chen — blockchain developer, builder, and creator.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9548192708890896"
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
        <ThemeProvider>
          <PageViewTracker />
          <NeonCursor />
          <Navbar />
          <main>{children}</main>
          <Footer />
          <CrtAdLoader />
        </ThemeProvider>
      </body>
    </html>
  )
}
