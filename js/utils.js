function hexToRgb(hex) {
  hex = hex.replace(/^#/, '')
  if (hex.length === 3)
    hex = hex
      .split('')
      .map(c => c + c)
      .join('')
  const num = parseInt(hex, 16)
  return {r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255}
}

function rgbToHex({r, g, b}) {
  const to2 = x => x.toString(16).padStart(2, '0')
  return `#${to2(r)}${to2(g)}${to2(b)}`
}

function lerpColor(c1, c2, t) {
  return {
    r: Math.round(c1.r + (c2.r - c1.r) * t),
    g: Math.round(c1.g + (c2.g - c1.g) * t),
    b: Math.round(c1.b + (c2.b - c1.b) * t),
  }
}
