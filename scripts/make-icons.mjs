// Génère les icônes PWA (PNG bruts, sans dépendance image) :
// fond acier sombre + lingot trapézoïdal braise + étincelle or.
import { deflateSync } from 'node:zlib'
import { writeFileSync } from 'node:fs'

function crc32(buf) {
  let c
  const table = []
  for (let n = 0; n < 256; n++) {
    c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c
  }
  let crc = 0xffffffff
  for (const b of buf) crc = table[(crc ^ b) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}

function makePng(size) {
  const px = Buffer.alloc(size * (size * 3 + 1))
  const set = (x, y, r, g, b) => {
    const row = y * (size * 3 + 1)
    px[row] = 0 // filtre "none"
    const off = row + 1 + x * 3
    px[off] = r
    px[off + 1] = g
    px[off + 2] = b
  }

  const cx = size / 2
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      // fond acier avec léger dégradé radial chaud en haut
      const d = Math.hypot(x - cx, y - size * 0.2) / size
      const warm = Math.max(0, 0.28 - d) * 90
      set(x, y, Math.round(11 + warm), Math.round(14 + warm * 0.5), 20)
    }
  }

  // lingot trapézoïdal (clip-path 8%/92% → 0%/100%)
  const top = Math.round(size * 0.42)
  const bottom = Math.round(size * 0.68)
  for (let y = top; y < bottom; y++) {
    const t = (y - top) / (bottom - top)
    const inset = Math.round(size * 0.08 * (1 - t)) + Math.round(size * 0.16)
    for (let x = inset; x < size - inset; x++) {
      // dégradé braise : haut clair, bas sombre
      const r = Math.round(255 - t * 60)
      const g = Math.round(120 - t * 55)
      const b = Math.round(40 - t * 15)
      set(x, y, r, g, b)
    }
  }

  // étincelle or au-dessus
  const sx = Math.round(size * 0.5)
  const sy = Math.round(size * 0.28)
  const rad = Math.max(3, Math.round(size * 0.045))
  for (let y = sy - rad * 3; y <= sy + rad * 3; y++) {
    for (let x = sx - rad * 3; x <= sx + rad * 3; x++) {
      if (x < 0 || y < 0 || x >= size || y >= size) continue
      const dx = Math.abs(x - sx)
      const dy = Math.abs(y - sy)
      // losange (étoile 4 branches simplifiée)
      if (dx / (rad * 3) + dy / (rad * 3) <= 1 && (dx <= rad || dy <= rad)) {
        set(x, y, 255, 209, 102)
      }
    }
  }

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // profondeur
  ihdr[9] = 2 // couleur RGB
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(px)),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

for (const size of [192, 512]) {
  writeFileSync(new URL(`../public/icon-${size}.png`, import.meta.url), makePng(size))
  console.log(`public/icon-${size}.png`)
}
