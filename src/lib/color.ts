export type Rgb = {r: number; g: number; b: number}

export function hexToRgb(hex: string): Rgb {
  let h = hex.replace(/^#/, '')
  if (h.length === 3) {
    h = h
      .split('')
      .map(c => c + c)
      .join('')
  }
  const num = Number.parseInt(h, 16)
  return {r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255}
}

export function rgbToHex({r, g, b}: Rgb): string {
  const to2 = (x: number) => x.toString(16).padStart(2, '0')
  return `#${to2(r)}${to2(g)}${to2(b)}`
}

export function lerpColor(c1: Rgb, c2: Rgb, t: number): Rgb {
  return {
    r: Math.round(c1.r + (c2.r - c1.r) * t),
    g: Math.round(c1.g + (c2.g - c1.g) * t),
    b: Math.round(c1.b + (c2.b - c1.b) * t),
  }
}
