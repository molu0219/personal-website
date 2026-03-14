import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import NeonCursor from '@/components/art/NeonCursor'
import ThemeProvider from '@/components/ThemeProvider'
import PageViewTracker from '@/components/PageViewTracker'

export const metadata: Metadata = {
  title: 'Joey Chen — Developer & Builder',
  description: 'Personal website of Joey Chen — blockchain developer, builder, and creator.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <PageViewTracker />
          <NeonCursor />
          <Navbar />
          <main>{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
