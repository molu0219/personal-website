---
title: "Adding a CRT Terminal Ad System + AI Skills Hub to My Personal Website"
date: "2026-03-19"
project: "personal-website"
tags: [adsense, crt-terminal, skills-hub, cyberpunk, nextjs, supabase, cloudflare]
status: "captured"
---

## What Was Done

- Re-initialized project docs (PRD.md, TODO.md, DECISION.md) by reverse-engineering the entire codebase into a complete feature inventory (F001-F014 all marked complete)
- Surveyed ad providers (Google AdSense, Carbon Ads, EthicalAds, BuySellAds) — analyzed which allow custom container wrapping
- Built a CRT terminal-style floating ad system (F015): retro scanline overlay, green glow, draggable, dismissible
- Added mobile responsive mode — inline CRT block at page bottom (no floating, no drag)
- Integrated Google AdSense (Publisher ID: ca-pub-9548192708890896), fixed hydration mismatch issues
- Built AI Skills Hub page (F016): split-pane layout with table list + CRT-styled install script panel
- Skills support auto-fetching GitHub metadata (stars, forks, description) from repo URL
- Script panel supports Terminal / Script dual-mode switching
- Stars column is sortable, Description shows full text on hover
- Admin backend: new Skills management page (CRUD + Refresh Stars button)
- Fixed TableOfContents duplicate heading ID causing React key warning
- Deployed v1.0.5 through v1.0.7 — three production releases

## Key Decisions

- **AdSense over other providers**: Carbon Ads and AdSense both forbid custom container wrapping, but AdSense has the lowest barrier to entry. The CRT container is purely decorative — it doesn't modify the ad element itself, staying within TOS
- **CRT terminal as ad container**: Instead of a standard ad banner that clashes with the cyberpunk aesthetic, the ad lives inside a themed container. Pure CSS scanline + glow effects, no new dependencies
- **Drag via raw pointer events**: No react-draggable needed — used setPointerCapture for zero-dependency dragging
- **Manual install commands for Skills**: Considered auto-parsing GitHub READMEs but every repo has different formatting. Manual entry by admin is more reliable and only needs to be done once
- **Native script tag over next/script**: next/script's beforeInteractive strategy causes hydration mismatch. Native `<script async>` in `<head>` avoids SSR/client HTML divergence
- **Shared CRT visual language**: Ad terminal and Skills Hub script panel share the same visual DNA (scanlines, green glow, traffic light dots)

## Outcomes

- Two major feature modules added: Ad System + AI Skills Hub
- Ad system fully responsive — floating draggable on desktop, inline block on mobile
- Skills Hub has complete CRUD admin, public display page, and dual-mode script output
- Google AdSense verification code deployed, pending Google approval
- Project documentation system (PRD/TODO/DECISION) fully established with 14 existing + 2 new features tracked

## Insights & Takeaways

- **Ad provider TOS is stricter than expected**: Both AdSense and Carbon explicitly prohibit modifying ad appearance/behavior. But "decorative containers" that don't touch the ad element itself are fine. The line is: don't obscure or modify the ad
- **next/script beforeInteractive has a hydration trap**: This strategy generates different HTML on server vs client. For third-party scripts, native `<script async>` is actually safer
- **Value of reverse-engineering your own project**: Building a complete feature inventory isn't just documentation — it's re-understanding your system boundaries. You need to know "what's done" before you can plan "what's next"
- **CRT effects are surprisingly simple**: Scanlines = repeating-linear-gradient, glow = radial-gradient + box-shadow. No canvas, no complex animations needed

## Code Highlights

**Pure CSS Scanline Effect**:
```css
background: repeating-linear-gradient(
  0deg,
  transparent,
  transparent 2px,
  rgba(0, 255, 136, 0.015) 2px,
  rgba(0, 255, 136, 0.015) 4px
);
```

**Zero-dependency Drag with Pointer Events**:
```tsx
el.setPointerCapture(e.pointerId)  // locks pointer to element
dragOffset.current = { x: e.clientX - pos.x, y: e.clientY - pos.y }
```

**Route-based Ad Loading** — placed in root layout with pathname filtering instead of per-page imports:
```tsx
const AD_PATHS = ['/blog', '/projects', '/skills']
const shouldShow = AD_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))
```

## Raw Notes

- Google AdSense review pending; GDPR consent set up with Google CMP 3-option variant (consent/reject/manage)
- Daily auto-refresh of stars/forks not yet implemented (needs Cron Trigger), currently manual
- Supabase RLS required an additional `authenticated` policy for admin page to directly mutate skills table
- `ads.txt` placed in `/public/`, Cloudflare serves it automatically

## Story Angles

1. **"How to Make Ads Part of Your Design System"**: On the surface — building a CRT terminal ad container. Underneath — the product thinking behind making ads feel like part of the experience, not an interruption
2. **"Building an AI Skills Hub with Next.js"**: On the surface — technical implementation (GitHub API + Supabase + CRT UI). Underneath — the value of developer tool curation and the emerging AI agent ecosystem
3. **"Reverse-Engineering Your Own Project"**: On the surface — how to build a PRD for existing code. Underneath — a methodology for managing multi-session development workflows (PRD/TODO/DECISION triad)
