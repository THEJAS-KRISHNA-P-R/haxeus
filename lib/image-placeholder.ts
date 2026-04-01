function toBase64(value: string) {
  if (typeof window === "undefined") {
    return Buffer.from(value).toString("base64")
  }

  return window.btoa(value)
}

export function getShimmerDataUrl(width = 1200, height = 1200) {
  const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="#111111"/>
      <rect id="shine" width="${width}" height="${height}" fill="url(#paint0_linear_0_1)"/>
      <defs>
        <linearGradient id="paint0_linear_0_1" x1="-${width}" y1="0" x2="0" y2="0" gradientUnits="userSpaceOnUse">
          <stop stop-color="#111111"/>
          <stop offset="0.5" stop-color="#1f1f1f"/>
          <stop offset="1" stop-color="#111111"/>
        </linearGradient>
      </defs>
      <animate xlink:href="#shine" attributeName="x" from="-${width}" to="${width}" dur="1.4s" repeatCount="indefinite" />
    </svg>
  `

  return `data:image/svg+xml;base64,${toBase64(svg)}`
}
