import { chromium } from "playwright";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, "../public");
const iconsDir = path.resolve(publicDir, "icons");

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Logo Oficial do CasalPlanner: Casal (Verde Esmeralda e Amarelo Dourado) abraçando o Lar (Casinha Central Branca)
const coupleSvg = `
<svg viewBox="0 0 48 48" fill="none" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="pwa-green" x1="11" y1="9" x2="23" y2="41" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#34A853" />
      <stop offset="100%" stop-color="#206E49" />
    </linearGradient>

    <linearGradient id="pwa-gold" x1="25" y1="9" x2="37" y2="41" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#FBBF24" />
      <stop offset="100%" stop-color="#D97706" />
    </linearGradient>

    <filter id="pwa-shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" flood-color="#000000" flood-opacity="0.16" />
    </filter>
  </defs>

  <!-- 1. BONEQUINHO ESQUERDO (Verde Esmeralda) -->
  <circle cx="17" cy="15" r="6.8" fill="url(#pwa-green)" />
  <path
    d="M 17 22.5 C 10.5 22.5 6 27.5 6 34.5 C 6 39.5 9.5 42 16 42 C 20.5 42 24.5 39.5 26.5 35 C 25.5 28.5 22 22.5 17 22.5 Z"
    fill="url(#pwa-green)"
  />

  <!-- 2. BONEQUINHO DIREITO (Amarelo Dourado) -->
  <circle cx="31" cy="15" r="6.8" fill="url(#pwa-gold)" />
  <path
    d="M 31 22.5 C 26 22.5 22.5 28.5 21.5 35 C 23.5 39.5 27.5 42 32 42 C 38.5 42 42 39.5 42 34.5 C 42 27.5 37.5 22.5 31 22.5 Z"
    fill="url(#pwa-gold)"
  />

  <!-- Intersecção central -->
  <path
    d="M 24 24 C 21.5 28 20 33 20 38 C 21 40 23 41.5 24 41.8 C 25 41.5 27 40 28 38 C 28 33 26.5 28 24 24 Z"
    fill="#206E49"
    opacity="0.35"
  />

  <!-- 3. O LAR NO CENTRO (Casinha Branca com Chaminé e Portinha) -->
  <g filter="url(#pwa-shadow)">
    <!-- Chaminé -->
    <rect x="27.5" y="24" width="2.6" height="5" rx="0.6" fill="#FFFFFF" stroke="#D1CAC0" stroke-width="0.9" />

    <!-- Estrutura da Casinha (Telhado + Paredes) -->
    <path
      d="M 24 23.2 L 32.2 29.8 C 32.6 30.1 32.5 30.7 32 30.7 H 30.5 V 39.5 C 30.5 40.3 29.8 41 29 41 H 19 C 18.2 41 17.5 40.3 17.5 39.5 V 30.7 H 16 C 15.5 30.7 15.4 30.1 15.8 29.8 L 24 23.2 Z"
      fill="#FFFFFF"
      stroke="#D1CAC0"
      stroke-width="0.9"
      stroke-linejoin="round"
    />

    <!-- Portinha Acolhedora -->
    <path
      d="M 22 41 V 34.8 C 22 33.8 22.8 33 23.8 33 H 24.2 C 25.2 33 26 33.8 26 34.8 V 41"
      fill="#FAF8F5"
      stroke="#D1CAC0"
      stroke-width="0.8"
    />
  </g>
</svg>
`;

const badgeSvg = `
<svg viewBox="0 0 64 64" fill="none" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <rect x="1.5" y="1.5" width="61" height="61" rx="16" fill="#FAF8F5" stroke="#E2DDD5" stroke-width="2" />
  <g transform="translate(8, 8)">
    ${coupleSvg}
  </g>
</svg>
`;

async function generate() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // 1. icon-192.png (192x192)
  await page.setViewportSize({ width: 192, height: 192 });
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            margin: 0;
            padding: 0;
            background: #FAF8F5;
            width: 192px;
            height: 192px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .box {
            width: 156px;
            height: 156px;
          }
        </style>
      </head>
      <body>
        <div class="box">${coupleSvg}</div>
      </body>
    </html>
  `);
  await page.screenshot({ path: path.join(iconsDir, "icon-192.png") });

  // 2. icon-512.png (512x512)
  await page.setViewportSize({ width: 512, height: 512 });
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            margin: 0;
            padding: 0;
            background: #FAF8F5;
            width: 512px;
            height: 512px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .box {
            width: 416px;
            height: 416px;
          }
        </style>
      </head>
      <body>
        <div class="box">${coupleSvg}</div>
      </body>
    </html>
  `);
  await page.screenshot({ path: path.join(iconsDir, "icon-512.png") });

  // 3. icon-512-maskable.png (fundo #206E49 verde, símbolo centralizado seguro)
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            margin: 0;
            padding: 0;
            background: #FAF8F5;
            width: 512px;
            height: 512px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .box {
            width: 340px;
            height: 340px;
          }
        </style>
      </head>
      <body>
        <div class="box">${coupleSvg}</div>
      </body>
    </html>
  `);
  await page.screenshot({ path: path.join(iconsDir, "icon-512-maskable.png") });

  // 4. apple-touch-icon.png (180x180)
  await page.setViewportSize({ width: 180, height: 180 });
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            margin: 0;
            padding: 0;
            background: #FAF8F5;
            width: 180px;
            height: 180px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .box {
            width: 160px;
            height: 160px;
          }
        </style>
      </head>
      <body>
        <div class="box">${badgeSvg}</div>
      </body>
    </html>
  `);
  await page.screenshot({ path: path.join(publicDir, "apple-touch-icon.png") });

  // 5. favicon.png (64x64 PNG com fundo badge nítido)
  await page.setViewportSize({ width: 64, height: 64 });
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            margin: 0;
            padding: 0;
            background: transparent;
            width: 64px;
            height: 64px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .box {
            width: 60px;
            height: 60px;
          }
        </style>
      </head>
      <body>
        <div class="box">${badgeSvg}</div>
      </body>
    </html>
  `);
  await page.screenshot({ path: path.join(publicDir, "favicon.png"), omitBackground: true });

  // 6. logo.png (512x512)
  await page.setViewportSize({ width: 512, height: 512 });
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            margin: 0;
            padding: 0;
            background: #FAF8F5;
            width: 512px;
            height: 512px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .box {
            width: 420px;
            height: 420px;
          }
        </style>
      </head>
      <body>
        <div class="box">${coupleSvg}</div>
      </body>
    </html>
  `);
  await page.screenshot({ path: path.join(publicDir, "logo.png") });

  // 7. favicon.ico (16, 32, 48)
  const icoSizes = [16, 32, 48];
  const pngBuffers = [];
  for (const s of icoSizes) {
    await page.setViewportSize({ width: s, height: s });
    const padding = Math.max(1, Math.floor(s * 0.05));
    const boxSize = s - padding * 2;
    await page.setContent(`
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body {
              margin: 0;
              padding: 0;
              background: transparent;
              width: ${s}px;
              height: ${s}px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .box {
              width: ${boxSize}px;
              height: ${boxSize}px;
            }
          </style>
        </head>
        <body>
          <div class="box">${badgeSvg}</div>
        </body>
      </html>
    `);
    const buf = await page.screenshot({ omitBackground: true });
    pngBuffers.push({ width: s, height: s, buffer: buf });
  }

  // Pack PNGs into standard ICO format
  const count = pngBuffers.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  let offset = headerSize + dirEntrySize * count;

  const header = Buffer.alloc(headerSize);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type 1 = icon
  header.writeUInt16LE(count, 4); // count

  const entries = [];
  for (const item of pngBuffers) {
    const entry = Buffer.alloc(dirEntrySize);
    entry.writeUInt8(item.width >= 256 ? 0 : item.width, 0);
    entry.writeUInt8(item.height >= 256 ? 0 : item.height, 1);
    entry.writeUInt8(0, 2); // color count
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bpp
    entry.writeUInt32LE(item.buffer.length, 8); // size
    entry.writeUInt32LE(offset, 12); // offset
    entries.push(entry);
    offset += item.buffer.length;
  }

  const icoBuffer = Buffer.concat([header, ...entries, ...pngBuffers.map((i) => i.buffer)]);
  fs.writeFileSync(path.join(publicDir, "favicon.ico"), icoBuffer);

  await browser.close();
  console.log("All icons, logo.png and favicon.ico generated with official couple icon successfully!");
}

generate().catch(console.error);
