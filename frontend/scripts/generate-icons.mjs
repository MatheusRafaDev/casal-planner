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

const logoDataUrl = `data:image/png;base64,${fs
  .readFileSync(path.join(publicDir, "logo_casalplanner.png"))
  .toString("base64")}`;
const logoMarkup = `<img src="${logoDataUrl}" alt="" style="display:block;width:100%;height:100%;object-fit:contain"/>`;
const badgeMarkup = `<div style="box-sizing:border-box;width:100%;height:100%;padding:5px;border:2px solid #E2DDD5;border-radius:25%;background:#FAF8F5">${logoMarkup}</div>`;

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
        <div class="box">${logoMarkup}</div>
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
        <div class="box">${logoMarkup}</div>
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
        <div class="box">${logoMarkup}</div>
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
        <div class="box">${badgeMarkup}</div>
      </body>
    </html>
  `);
  await page.screenshot({ path: path.join(publicDir, "apple-touch-icon.png") });

  // 5. favicon.png (64x64 PNG transparente sem fundo)
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
        <div class="box">${logoMarkup}</div>
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
            background: transparent;
            width: 512px;
            height: 512px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .box {
            width: 440px;
            height: 440px;
          }
        </style>
      </head>
      <body>
        <div class="box">${logoMarkup}</div>
      </body>
    </html>
  `);
  await page.screenshot({ path: path.join(publicDir, "logo.png"), omitBackground: true });

  // 7. favicon.ico (16, 32, 48 transparente)
  const icoSizes = [16, 32, 48];
  const pngBuffers = [];
  for (const s of icoSizes) {
    await page.setViewportSize({ width: s, height: s });
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
              width: ${s}px;
              height: ${s}px;
            }
          </style>
        </head>
        <body>
          <div class="box">${logoMarkup}</div>
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
  console.log("Icons, logo.png and favicon.ico generated from the CasalPlanner logo successfully!");
}

generate().catch(console.error);
