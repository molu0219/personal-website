'use client'

export default function MeshGradient({ className = '' }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `
            radial-gradient(ellipse at 20% 50%, rgba(0,212,255,0.15) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 20%, rgba(191,0,255,0.15) 0%, transparent 60%),
            radial-gradient(ellipse at 60% 80%, rgba(255,0,168,0.1) 0%, transparent 60%)
          `,
          animation: 'meshMove 8s ease-in-out infinite',
        }}
      />
    </div>
  )
}
