// Re-mounts on every navigation → plays a short CSS-only enter transition.
// Navbar/Footer live in layout.tsx so they stay put while content swaps.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="route-enter">{children}</div>
}
