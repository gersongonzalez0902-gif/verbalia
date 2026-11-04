/**
 * Genera los iconos PWA (192, 512, maskable 512 y apple-touch 180)
 * a partir del emblema SVG, con fondo seguro para maskable.
 * Uso: bun scripts/generate-icons.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import sharp from "sharp";

const svg = readFileSync("src/app/icon.svg");

mkdirSync("public/icons", { recursive: true });

// Icono normal: el SVG tal cual, escalado.
for (const size of [192, 512]) {
  const png = await sharp(svg, { density: 600 }).resize(size, size).png().toBuffer();
  writeFileSync(`public/icons/icon-${size}.png`, png);
  console.log(`✓ icon-${size}.png`);
}

// Maskable: el emblema reducido al 78% sobre el fondo verde (zona segura).
const svgStr = svg.toString("utf8");
const inner = svgStr.replace(/<rect[^/]*\/>/g, ""); // quita rectángulos del fondo
const maskableSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" fill="#1c5f43"/>
  <svg x="11" y="11" width="78" height="78" viewBox="0 0 64 64">${inner.replace(/<\/?svg[^>]*>/g, "")}</svg>
</svg>`;
const maskable = await sharp(Buffer.from(maskableSvg)).resize(512, 512).png().toBuffer();
writeFileSync("public/icons/icon-maskable-512.png", maskable);
console.log("✓ icon-maskable-512.png");

// Apple touch: 180px con fondo opaco.
const apple = await sharp(svg, { density: 600 }).resize(180, 180).png().toBuffer();
writeFileSync("public/icons/apple-touch-icon.png", apple);
console.log("✓ apple-touch-icon.png");
