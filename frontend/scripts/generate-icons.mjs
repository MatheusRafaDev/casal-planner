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

async function generate() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // 1. Obter imagem recortada e perfeitamente centralizada
  const croppedDataUrl = await page.evaluate(async (dataUrl) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement("canvas");
        c.width = img.naturalWidth;
        c.height = img.naturalHeight;
        const ctx = c.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const data = ctx.getImageData(0, 0, c.width, c.height).data;
        let minX = c.width, maxX = 0, minY = c.height, maxY = 0;
        for (let y = 0; y < c.height; y++) {
          for (let x = 0; x < c.width; x++) {
            if (data[(y * c.width + x) * 4 + 3] > 10) {
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }
        const symW = maxX - minX;
        const symH = maxY - minY;
        const side = Math.max(symW, symH);
        const padding = side * 0.04;
        const outSide = side + padding * 2;
        const out = document.createElement("canvas");
        out.width = 512;
        out.height = 512;
        const outCtx = out.getContext("2d");
        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;
        const srcX = centerX - outSide / 2;
        const srcY = centerY - outSide / 2;
        outCtx.drawImage(c, srcX, srcY, outSide, outSide, 0, 0, 512, 512);
        resolve(out.toDataURL("image/png"));
      };
      img.src = dataUrl;
    });
  }, logoDataUrl);

  const base64Data = croppedDataUrl.replace(/^data:image\/png;base64,/, "");
  fs.writeFileSync(path.join(publicDir, "logo.png"), Buffer.from(base64Data, "base64"));

  const logoMarkup = `<img src="${croppedDataUrl}" alt="" style="display:block;width:100%;height:100%;object-fit:contain"/>`;

  // 2. icon-192.png (192x192) - 100% transparente
  await page.setViewportSize({ width: 192, height: 192 });
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            margin: 0;
            padding: 0;
            background: transparent;
            width: 192px;
            height: 192px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .box {
            width: 180px;
            height: 180px;
          }
        </style>
      </head>
      <body>
        <div class="box">${logoMarkup}</div>
      </body>
    </html>
  `);
  await page.screenshot({ path: path.join(iconsDir, "icon-192.png"), omitBackground: true });

  // 3. icon-512.png (512x512) - 100% transparente
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
            width: 480px;
            height: 480px;
          }
        </style>
      </head>
      <body>
        <div class="box">${logoMarkup}</div>
      </body>
    </html>
  `);
  await page.screenshot({ path: path.join(iconsDir, "icon-512.png"), omitBackground: true });

  // 4. icon-512-maskable.png (com margem segura) - 100% transparente
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
            width: 380px;
            height: 380px;
          }
        </style>
      </head>
      <body>
        <div class="box">${logoMarkup}</div>
      </body>
    </html>
  `);
  await page.screenshot({ path: path.join(iconsDir, "icon-512-maskable.png"), omitBackground: true });

  // 5. apple-touch-icon.png (180x180) - 100% transparente
  await page.setViewportSize({ width: 180, height: 180 });
  await page.setContent(`
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            margin: 0;
            padding: 0;
            background: transparent;
            width: 180px;
            height: 180px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .box {
            width: 170px;
            height: 170px;
          }
        </style>
      </head>
      <body>
        <div class="box">${logoMarkup}</div>
      </body>
    </html>
  `);
  await page.screenshot({ path: path.join(publicDir, "apple-touch-icon.png"), omitBackground: true });

  // 6. favicon.png (64x64 PNG transparente sem fundo)
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
  console.log("All icons (with 100% transparent backgrounds) generated successfully!");
}

generate().catch(console.error);
