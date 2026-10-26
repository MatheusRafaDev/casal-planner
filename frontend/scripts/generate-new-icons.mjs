import { chromium } from "@playwright/test";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, "../public");
const iconsDir = path.resolve(publicDir, "icons");

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// 1. Write the new SVG files
const iconSvgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160" fill="none">
  <rect width="160" height="160" rx="36" fill="#1f5c43"/>
  <rect x="40" y="30" width="84" height="100" rx="12" fill="#ef6f6c" transform="rotate(-8 80 80)"/>
  <g transform="rotate(6 78 84)">
    <rect x="36" y="34" width="84" height="100" rx="12" fill="#fff"/>
    <path d="M64.36 51.64 A9 9 0 1 0 64.36 64.36" fill="none" stroke="#1f5c43" stroke-width="6" stroke-linecap="round"/>
    <circle cx="76" cy="64" r="4" fill="#ef6f6c"/>
    <g transform="translate(92 50) scale(0.8)">
      <path d="M12 21s-7-4.6-9.3-9C1 8.6 2.9 5 6.4 5c2 0 3.6 1.1 4.6 2.7C12 6.1 13.6 5 15.6 5c3.5 0 5.4 3.6 3.7 7C19 16.4 12 21 12 21z" fill="#ef6f6c"/>
    </g>
    <line x1="46" y1="76" x2="110" y2="76" stroke="#e7ece9" stroke-width="2"/>
    <circle cx="52" cy="88" r="5.5" fill="#ef6f6c"/>
    <path d="M49.5 88 l2 2 l3.5 -3.5" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="64" y1="88" x2="108" y2="88" stroke="#1f5c43" stroke-width="5" stroke-linecap="round"/>
    <circle cx="52" cy="104" r="5.5" fill="#1f5c43"/>
    <path d="M49.5 104 l2 2 l3.5 -3.5" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="64" y1="104" x2="98" y2="104" stroke="#cfd8d2" stroke-width="5" stroke-linecap="round"/>
    <circle cx="52" cy="120" r="5" fill="none" stroke="#cfd8d2" stroke-width="2"/>
    <line x1="64" y1="120" x2="104" y2="120" stroke="#cfd8d2" stroke-width="5" stroke-linecap="round"/>
  </g>
</svg>`;

const logoSvgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 56" width="280" height="56" fill="none">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;800&amp;display=swap');
      .brand-casal { font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif; font-weight: 800; font-size: 35px; fill: #1f5c43; letter-spacing: -0.04em; }
      .brand-planner { font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif; font-weight: 300; font-size: 35px; fill: #1b2438; letter-spacing: -0.04em; }
      .brand-dot { font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif; font-weight: 800; font-size: 35px; fill: #ef6f6c; letter-spacing: -0.04em; }
    </style>
  </defs>
  <g transform="translate(0, 0) scale(0.35)">
    <rect width="160" height="160" rx="36" fill="#1f5c43"/>
    <rect x="40" y="30" width="84" height="100" rx="12" fill="#ef6f6c" transform="rotate(-8 80 80)"/>
    <g transform="rotate(6 78 84)">
      <rect x="36" y="34" width="84" height="100" rx="12" fill="#fff"/>
      <path d="M64.36 51.64 A9 9 0 1 0 64.36 64.36" fill="none" stroke="#1f5c43" stroke-width="6" stroke-linecap="round"/>
      <circle cx="76" cy="64" r="4" fill="#ef6f6c"/>
      <g transform="translate(92 50) scale(0.8)">
        <path d="M12 21s-7-4.6-9.3-9C1 8.6 2.9 5 6.4 5c2 0 3.6 1.1 4.6 2.7C12 6.1 13.6 5 15.6 5c3.5 0 5.4 3.6 3.7 7C19 16.4 12 21 12 21z" fill="#ef6f6c"/>
      </g>
      <line x1="46" y1="76" x2="110" y2="76" stroke="#e7ece9" stroke-width="2"/>
      <circle cx="52" cy="88" r="5.5" fill="#ef6f6c"/>
      <path d="M49.5 88 l2 2 l3.5 -3.5" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="64" y1="88" x2="108" y2="88" stroke="#1f5c43" stroke-width="5" stroke-linecap="round"/>
      <circle cx="52" cy="104" r="5.5" fill="#1f5c43"/>
      <path d="M49.5 104 l2 2 l3.5 -3.5" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="64" y1="104" x2="98" y2="104" stroke="#cfd8d2" stroke-width="5" stroke-linecap="round"/>
      <circle cx="52" cy="120" r="5" fill="none" stroke="#cfd8d2" stroke-width="2"/>
      <line x1="64" y1="120" x2="104" y2="120" stroke="#cfd8d2" stroke-width="5" stroke-linecap="round"/>
    </g>
  </g>
  <text x="70" y="41">
    <tspan class="brand-casal">casal</tspan><tspan class="brand-planner">planner</tspan><tspan class="brand-dot">.</tspan>
  </text>
</svg>`;

const logoTextDarkSvgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 56" width="280" height="56" fill="none">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;800&amp;display=swap');
      .brand-casal { font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif; font-weight: 800; font-size: 35px; fill: #ffffff; letter-spacing: -0.04em; }
      .brand-planner { font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif; font-weight: 300; font-size: 35px; fill: #ffffff; letter-spacing: -0.04em; }
      .brand-dot { font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif; font-weight: 800; font-size: 35px; fill: #ef6f6c; letter-spacing: -0.04em; }
    </style>
  </defs>
  <g transform="translate(0, 0) scale(0.35)">
    <rect width="160" height="160" rx="36" fill="#1f5c43"/>
    <rect x="40" y="30" width="84" height="100" rx="12" fill="#ef6f6c" transform="rotate(-8 80 80)"/>
    <g transform="rotate(6 78 84)">
      <rect x="36" y="34" width="84" height="100" rx="12" fill="#fff"/>
      <path d="M64.36 51.64 A9 9 0 1 0 64.36 64.36" fill="none" stroke="#1f5c43" stroke-width="6" stroke-linecap="round"/>
      <circle cx="76" cy="64" r="4" fill="#ef6f6c"/>
      <g transform="translate(92 50) scale(0.8)">
        <path d="M12 21s-7-4.6-9.3-9C1 8.6 2.9 5 6.4 5c2 0 3.6 1.1 4.6 2.7C12 6.1 13.6 5 15.6 5c3.5 0 5.4 3.6 3.7 7C19 16.4 12 21 12 21z" fill="#ef6f6c"/>
      </g>
      <line x1="46" y1="76" x2="110" y2="76" stroke="#e7ece9" stroke-width="2"/>
      <circle cx="52" cy="88" r="5.5" fill="#ef6f6c"/>
      <path d="M49.5 88 l2 2 l3.5 -3.5" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="64" y1="88" x2="108" y2="88" stroke="#1f5c43" stroke-width="5" stroke-linecap="round"/>
      <circle cx="52" cy="104" r="5.5" fill="#1f5c43"/>
      <path d="M49.5 104 l2 2 l3.5 -3.5" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      <line x1="64" y1="104" x2="98" y2="104" stroke="#cfd8d2" stroke-width="5" stroke-linecap="round"/>
      <circle cx="52" cy="120" r="5" fill="none" stroke="#cfd8d2" stroke-width="2"/>
      <line x1="64" y1="120" x2="104" y2="120" stroke="#cfd8d2" stroke-width="5" stroke-linecap="round"/>
    </g>
  </g>
  <text x="70" y="41">
    <tspan class="brand-casal">casal</tspan><tspan class="brand-planner">planner</tspan><tspan class="brand-dot">.</tspan>
  </text>
</svg>`;

fs.writeFileSync(path.join(publicDir, "logo-icon.svg"), iconSvgContent, "utf8");
fs.writeFileSync(path.join(publicDir, "favicon.svg"), iconSvgContent, "utf8");
fs.writeFileSync(path.join(publicDir, "logo.svg"), logoSvgContent, "utf8");
fs.writeFileSync(path.join(publicDir, "logo-texto.svg"), logoSvgContent, "utf8");
fs.writeFileSync(path.join(publicDir, "logo-texto-dark.svg"), logoTextDarkSvgContent, "utf8");

console.log("SVG files written successfully!");

// 2. Generate PNGs and ICO using Chromium
async function generatePngs() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Helper to render icon centered in size x size
  const renderIconHtml = (boxSize, roundRadius = "22.5%") => `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            width: 100vw;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: transparent;
            overflow: hidden;
          }
          .icon-box {
            width: ${boxSize}px;
            height: ${boxSize}px;
          }
          svg { width: 100%; height: 100%; display: block; }
        </style>
      </head>
      <body>
        <div class="icon-box">
          ${iconSvgContent}
        </div>
      </body>
    </html>
  `;

  // Helper to render maskable icon (full bleed green background #1f5c43, sheets scaled in center)
  const renderMaskableHtml = () => `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            width: 512px;
            height: 512px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #1f5c43;
            overflow: hidden;
          }
          .inner-icon {
            width: 380px;
            height: 380px;
          }
          svg { width: 100%; height: 100%; display: block; }
        </style>
      </head>
      <body>
        <div class="inner-icon">
          <svg viewBox="0 0 160 160" width="160" height="160" fill="none">
            <rect x="40" y="30" width="84" height="100" rx="12" fill="#ef6f6c" transform="rotate(-8 80 80)"/>
            <g transform="rotate(6 78 84)">
              <rect x="36" y="34" width="84" height="100" rx="12" fill="#fff"/>
              <path d="M64.36 51.64 A9 9 0 1 0 64.36 64.36" fill="none" stroke="#1f5c43" stroke-width="6" stroke-linecap="round"/>
              <circle cx="76" cy="64" r="4" fill="#ef6f6c"/>
              <g transform="translate(92 50) scale(0.8)">
                <path d="M12 21s-7-4.6-9.3-9C1 8.6 2.9 5 6.4 5c2 0 3.6 1.1 4.6 2.7C12 6.1 13.6 5 15.6 5c3.5 0 5.4 3.6 3.7 7C19 16.4 12 21 12 21z" fill="#ef6f6c"/>
              </g>
              <line x1="46" y1="76" x2="110" y2="76" stroke="#e7ece9" stroke-width="2"/>
              <circle cx="52" cy="88" r="5.5" fill="#ef6f6c"/>
              <path d="M49.5 88 l2 2 l3.5 -3.5" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="64" y1="88" x2="108" y2="88" stroke="#1f5c43" stroke-width="5" stroke-linecap="round"/>
              <circle cx="52" cy="104" r="5.5" fill="#1f5c43"/>
              <path d="M49.5 104 l2 2 l3.5 -3.5" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="64" y1="104" x2="98" y2="104" stroke="#cfd8d2" stroke-width="5" stroke-linecap="round"/>
              <circle cx="52" cy="120" r="5" fill="none" stroke="#cfd8d2" stroke-width="2"/>
              <line x1="64" y1="120" x2="104" y2="120" stroke="#cfd8d2" stroke-width="5" stroke-linecap="round"/>
            </g>
          </svg>
        </div>
      </body>
    </html>
  `;

  // 1. icon-512.png (512x512)
  await page.setViewportSize({ width: 512, height: 512 });
  await page.setContent(renderIconHtml(512));
  const icon512Buf = await page.screenshot({
    path: path.join(iconsDir, "icon-512.png"),
    omitBackground: true,
  });
  fs.writeFileSync(path.join(publicDir, "logo.png"), icon512Buf);
  fs.writeFileSync(path.join(publicDir, "logo_casalplanner.png"), icon512Buf);
  console.log("icon-512.png & logo.png generated");

  // 2. icon-192.png (192x192)
  await page.setViewportSize({ width: 192, height: 192 });
  await page.setContent(renderIconHtml(192));
  await page.screenshot({ path: path.join(iconsDir, "icon-192.png"), omitBackground: true });
  console.log("icon-192.png generated");

  // 3. icon-512-maskable.png (512x512 maskable)
  await page.setViewportSize({ width: 512, height: 512 });
  await page.setContent(renderMaskableHtml());
  await page.screenshot({ path: path.join(iconsDir, "icon-512-maskable.png") });
  console.log("icon-512-maskable.png generated");

  // 4. apple-touch-icon.png (180x180)
  await page.setViewportSize({ width: 180, height: 180 });
  await page.setContent(renderIconHtml(180));
  await page.screenshot({
    path: path.join(publicDir, "apple-touch-icon.png"),
    omitBackground: true,
  });
  console.log("apple-touch-icon.png generated");

  // 5. favicon.png (64x64)
  await page.setViewportSize({ width: 64, height: 64 });
  await page.setContent(renderIconHtml(64));
  await page.screenshot({ path: path.join(publicDir, "favicon.png"), omitBackground: true });
  console.log("favicon.png generated");

  // 6. favicon.ico (16, 32, 48)
  const icoSizes = [16, 32, 48];
  const pngBuffers = [];
  for (const s of icoSizes) {
    await page.setViewportSize({ width: s, height: s });
    await page.setContent(renderIconHtml(s));
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
  console.log("favicon.ico generated");

  await browser.close();
  console.log("All icons generated successfully!");
}

generatePngs().catch((err) => {
  console.error("Error generating icons:", err);
  process.exit(1);
});
