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

const houseSvg = `
<svg viewBox="0 0 48 48" fill="none" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <path
    d="M7 19 L24 5 L41 19 V41 C41 42.6569 39.6569 44 38 44 H10 C8.34315 44 7 42.6569 7 41 Z"
    fill="#FFFDF8"
    stroke="#24302A"
    stroke-width="2.5"
    stroke-linejoin="round"
  />
  <path
    d="M24 7 L39 19 H9 Z"
    fill="#E8B63C"
  />
  <path
    d="M4 20 L24 4 L44 20"
    stroke="#24302A"
    stroke-width="3"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
  <path
    d="M24 12 C23 10.5 20.8 10.5 20.8 12.2 C20.8 14 24 16 24 16 C24 16 27.2 14 27.2 12.2 C27.2 10.5 25 10.5 24 12 Z"
    fill="#E0531C"
    stroke="#24302A"
    stroke-width="1.2"
    stroke-linejoin="round"
  />
  <g id="boneco-verde">
    <circle
      cx="17"
      cy="24"
      r="4.2"
      fill="#2F7D5B"
      stroke="#24302A"
      stroke-width="2"
    />
    <path
      d="M11 44 C11 35 13.5 30.5 17 30.5 C20.5 30.5 23 35 23 44 Z"
      fill="#2F7D5B"
      stroke="#24302A"
      stroke-width="2"
      stroke-linejoin="round"
    />
  </g>
  <g id="boneco-amarelo">
    <circle
      cx="31"
      cy="24"
      r="4.2"
      fill="#E8B63C"
      stroke="#24302A"
      stroke-width="2"
    />
    <path
      d="M25 44 C25 35 27.5 30.5 31 30.5 C34.5 30.5 37 35 37 44 Z"
      fill="#E8B63C"
      stroke="#24302A"
      stroke-width="2"
      stroke-linejoin="round"
    />
  </g>
</svg>
`;

const badgeSvg = `
<svg viewBox="0 0 64 64" fill="none" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <rect x="5.5" y="5.5" width="53" height="53" rx="14" fill="#24302A" />
  <rect x="3" y="3" width="53" height="53" rx="14" fill="#FFFDF8" stroke="#24302A" stroke-width="2.5" />
  <g transform="translate(8, 8)">
    ${houseSvg}
  </g>
</svg>
`;

async function generate() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // 1. icon-192.png (192x192, transparent or background)
  await page.setViewportSize({ width: 192, height: 192 });
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            margin: 0;
            padding: 0;
            background: #F6F1E9;
            width: 192px;
            height: 192px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .box {
            width: 150px;
            height: 150px;
          }
        </style>
      </head>
      <body>
        <div class="box">${houseSvg}</div>
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
            background: #F6F1E9;
            width: 512px;
            height: 512px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .box {
            width: 400px;
            height: 400px;
          }
        </style>
      </head>
      <body>
        <div class="box">${houseSvg}</div>
      </body>
    </html>
  `);
  await page.screenshot({ path: path.join(iconsDir, "icon-512.png") });

  // 3. icon-512-maskable.png (fundo #2F7D5B, símbolo dentro da área segura ~65% do tamanho)
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            margin: 0;
            padding: 0;
            background: #2F7D5B;
            width: 512px;
            height: 512px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .box {
            width: 320px;
            height: 320px;
          }
        </style>
      </head>
      <body>
        <div class="box">${houseSvg}</div>
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
            background: #F6F1E9;
            width: 180px;
            height: 180px;
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
        <div class="box">${badgeSvg}</div>
      </body>
    </html>
  `);
  await page.screenshot({ path: path.join(publicDir, "apple-touch-icon.png") });

  // 5. favicon.png (64x64 PNG)
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
            background: #F6F1E9;
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
        <div class="box">${houseSvg}</div>
      </body>
    </html>
  `);
  await page.screenshot({ path: path.join(publicDir, "logo.png") });

  // 7. favicon.ico (16, 32, 48)
  const icoSizes = [16, 32, 48];
  const pngBuffers = [];
  for (const s of icoSizes) {
    await page.setViewportSize({ width: s, height: s });
    const padding = Math.max(1, Math.floor(s * 0.08));
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
  console.log("Icons, logo.png and favicon.ico generated successfully!");
}

generate().catch(console.error);
