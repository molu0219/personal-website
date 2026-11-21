// Fetches a Google Fonts subset containing only `text`, as TrueType (next/og / satori
// cannot read woff2). Without a browser User-Agent, Google serves TTF.
export interface OgFont {
  name: string
  data: ArrayBuffer
  weight: 400 | 500 | 600
  style: 'normal'
}

const CSS_URL = 'https://fonts.googleapis.com/css2'

export async function loadGoogleFont(family: string, weight: OgFont['weight'], text: string): Promise<OgFont> {
  const params = new URLSearchParams({ family: `${family}:wght@${weight}`, text })
  const cssRes = await fetch(`${CSS_URL}?${params}`)
  if (!cssRes.ok) throw new Error(`[og] font css ${family} ${cssRes.status}`)
  const css = await cssRes.text()
  const url = css.match(/src: url\(([^)]+)\) format\('(?:truetype|opentype)'\)/)?.[1]
  if (!url) throw new Error(`[og] no TTF src for ${family}`)
  const fontRes = await fetch(url)
  if (!fontRes.ok) throw new Error(`[og] font file ${family} ${fontRes.status}`)
  return { name: family, data: await fontRes.arrayBuffer(), weight, style: 'normal' }
}
