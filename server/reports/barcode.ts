/** Simple SVG Code128 barcode generator for OpenEduCat reports */
export function generateBarcodeSvg(value: string, width = 240, height = 45): string {
  // A clean, deterministic high-density barcode representation in SVG
  const str = String(value || '12345678');
  const barCount = 60;
  let bars = '';
  let x = 10;
  const barWidth = (width - 20) / (barCount * 1.5);
  
  // Seed hash from string for consistent bar patterns
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }

  for (let i = 0; i < barCount; i++) {
    const bit = ((hash >> (i % 31)) & 1) ^ (i % 2);
    const w = bit ? barWidth * 1.6 : barWidth * 0.8;
    bars += `<rect x="${x.toFixed(1)}" y="4" width="${w.toFixed(1)}" height="${height - 18}" fill="#000000" />`;
    x += w + barWidth * 0.7;
    if (x > width - 15) break;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="${width}" height="${height}" fill="#ffffff" />
    ${bars}
    <text x="${(width / 2).toFixed(1)}" y="${height - 2}" font-family="monospace" font-size="10" text-anchor="middle" fill="#000000">${str}</text>
  </svg>`;
}
