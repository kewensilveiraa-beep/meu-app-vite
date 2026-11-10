import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { deflateSync } from 'node:zlib'

const publicDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public')
const crcTable = Array.from({ length: 256 }, (_, value) => {
  let crc = value
  for (let bit = 0; bit < 8; bit += 1) crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1
  return crc >>> 0
})

function crc32(buffer) {
  let crc = 0xffffffff
  for (const byte of buffer) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function pngChunk(type, data) {
  const name = Buffer.from(type)
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  const checksum = Buffer.alloc(4)
  checksum.writeUInt32BE(crc32(Buffer.concat([name, data])))
  return Buffer.concat([length, name, data, checksum])
}

function insidePolygon(x, y, points) {
  let inside = false
  for (let i = 0, j = points.length - 1; i < points.length; j = i, i += 1) {
    const [xi, yi] = points[i]
    const [xj, yj] = points[j]
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

function makeIcon(size) {
  const playTriangle = [
    [size * 0.41, size * 0.32],
    [size * 0.68, size * 0.5],
    [size * 0.41, size * 0.68],
  ]
  const scanlines = Buffer.alloc((size * 4 + 1) * size)
  const top = [7, 27, 45]
  const bottom = [21, 82, 122]
  const center = size / 2

  for (let y = 0; y < size; y += 1) {
    const rowStart = y * (size * 4 + 1)
    scanlines[rowStart] = 0
    for (let x = 0; x < size; x += 1) {
      const offset = rowStart + 1 + x * 4
      const diagonal = Math.min(1, (x + y) / (size * 1.65))
      let red = Math.round(top[0] * (1 - diagonal) + bottom[0] * diagonal)
      let green = Math.round(top[1] * (1 - diagonal) + bottom[1] * diagonal)
      let blue = Math.round(top[2] * (1 - diagonal) + bottom[2] * diagonal)
      const distance = Math.hypot(x - center, y - center)

      if (distance < size * 0.39) {
        if (distance > size * 0.32) {
          const energyMix = Math.min(1, Math.max(0, y / size))
          red = Math.round(255 * (1 - energyMix) + 255 * energyMix)
          green = Math.round(203 * (1 - energyMix) + 93 * energyMix)
          blue = Math.round(61 * (1 - energyMix) + 23 * energyMix)
        } else {
          const orbMix = Math.min(1, Math.max(0, distance / (size * 0.32)))
          red = Math.round(210 * (1 - orbMix) + 16 * orbMix)
          green = Math.round(239 * (1 - orbMix) + 45 * orbMix)
          blue = Math.round(255 * (1 - orbMix) + 75 * orbMix)
        }
      }
      if (insidePolygon(x, y, playTriangle)) {
        red = 255
        green = 244
        blue = 204
      }
      if (Math.hypot(x - size * 0.75, y - size * 0.27) < size * 0.035 || Math.hypot(x - size * 0.25, y - size * 0.72) < size * 0.022) {
        red = 253
        green = 230
        blue = 138
      }
      scanlines[offset] = red
      scanlines[offset + 1] = green
      scanlines[offset + 2] = blue
      scanlines[offset + 3] = 255
    }
  }

  const header = Buffer.alloc(13)
  header.writeUInt32BE(size, 0)
  header.writeUInt32BE(size, 4)
  header[8] = 8
  header[9] = 6
  const png = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    pngChunk('IHDR', header),
    pngChunk('IDAT', deflateSync(scanlines)),
    pngChunk('IEND', Buffer.alloc(0)),
  ])
  return png
}

for (const [filename, size] of [
  ['pwa-192.png', 192],
  ['pwa-512.png', 512],
  ['pwa-512-maskable.png', 512],
  ['apple-touch-icon.png', 180],
]) {
  fs.writeFileSync(path.join(publicDir, filename), makeIcon(size))
}
console.log('Ícones PWA gerados em public/.')
