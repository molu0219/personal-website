import AuroraCanvas from '@/components/art/AuroraCanvas'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AuroraCanvas />
      {children}
    </>
  )
}
