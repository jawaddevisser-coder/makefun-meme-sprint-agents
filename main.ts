// main.ts — Meme Sprint: AI Agents Ship Games
// Pure stdlib: hand-rolled PNG encoder + 5x7 bitmap font. No deps, no network.
// Writes one meme image to $MAKEFUN_OUTPUT_DIR/entry.png (default /output).
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { deflateSync } from "node:zlib";

// ---------- 5x7 bitmap font: each glyph is 7 rows of 5 bits ----------
const FONT: Record<string, number[]> = {
  "A": [0x0e, 0x11, 0x11, 0x1f, 0x11, 0x11, 0x11],
  "B": [0x1e, 0x11, 0x11, 0x1e, 0x11, 0x11, 0x1e],
  "C": [0x0e, 0x11, 0x10, 0x10, 0x10, 0x11, 0x0e],
  "D": [0x1e, 0x11, 0x11, 0x11, 0x11, 0x11, 0x1e],
  "E": [0x1f, 0x10, 0x10, 0x1e, 0x10, 0x10, 0x1f],
  "F": [0x1f, 0x10, 0x10, 0x1e, 0x10, 0x10, 0x10],
  "G": [0x0e, 0x11, 0x10, 0x17, 0x11, 0x11, 0x0f],
  "H": [0x11, 0x11, 0x11, 0x1f, 0x11, 0x11, 0x11],
  "I": [0x0e, 0x04, 0x04, 0x04, 0x04, 0x04, 0x0e],
  "J": [0x07, 0x02, 0x02, 0x02, 0x02, 0x12, 0x0c],
  "K": [0x11, 0x12, 0x14, 0x18, 0x14, 0x12, 0x11],
  "L": [0x10, 0x10, 0x10, 0x10, 0x10, 0x10, 0x1f],
  "M": [0x11, 0x1b, 0x15, 0x15, 0x11, 0x11, 0x11],
  "N": [0x11, 0x19, 0x15, 0x13, 0x11, 0x11, 0x11],
  "O": [0x0e, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0e],
  "P": [0x1e, 0x11, 0x11, 0x1e, 0x10, 0x10, 0x10],
  "Q": [0x0e, 0x11, 0x11, 0x11, 0x15, 0x12, 0x0d],
  "R": [0x1e, 0x11, 0x11, 0x1e, 0x14, 0x12, 0x11],
  "S": [0x0f, 0x10, 0x10, 0x0e, 0x01, 0x01, 0x1e],
  "T": [0x1f, 0x04, 0x04, 0x04, 0x04, 0x04, 0x04],
  "U": [0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0e],
  "V": [0x11, 0x11, 0x11, 0x11, 0x11, 0x0a, 0x04],
  "W": [0x11, 0x11, 0x11, 0x15, 0x15, 0x1b, 0x11],
  "X": [0x11, 0x11, 0x0a, 0x04, 0x0a, 0x11, 0x11],
  "Y": [0x11, 0x11, 0x0a, 0x04, 0x04, 0x04, 0x04],
  "Z": [0x1f, 0x01, 0x02, 0x04, 0x08, 0x10, 0x1f],
  "0": [0x0e, 0x11, 0x13, 0x15, 0x19, 0x11, 0x0e],
  "1": [0x04, 0x0c, 0x04, 0x04, 0x04, 0x04, 0x0e],
  "2": [0x0e, 0x11, 0x01, 0x02, 0x04, 0x08, 0x1f],
  "3": [0x1f, 0x02, 0x04, 0x02, 0x01, 0x11, 0x0e],
  "4": [0x02, 0x06, 0x0a, 0x12, 0x1f, 0x02, 0x02],
  "5": [0x1f, 0x10, 0x1e, 0x01, 0x01, 0x11, 0x0e],
  "6": [0x06, 0x08, 0x10, 0x1e, 0x11, 0x11, 0x0e],
  "7": [0x1f, 0x01, 0x02, 0x04, 0x08, 0x08, 0x08],
  "8": [0x0e, 0x11, 0x11, 0x0e, 0x11, 0x11, 0x0e],
  "9": [0x0e, 0x11, 0x11, 0x0f, 0x01, 0x02, 0x0c],
  " ": [0, 0, 0, 0, 0, 0, 0],
  ".": [0, 0, 0, 0, 0, 0x0c, 0x0c],
  ",": [0, 0, 0, 0, 0x0c, 0x04, 0x08],
  "!": [0x04, 0x04, 0x04, 0x04, 0x04, 0x00, 0x04],
  "?": [0x0e, 0x11, 0x01, 0x02, 0x04, 0x00, 0x04],
  "'": [0x04, 0x04, 0x08, 0, 0, 0, 0],
  ":": [0, 0x0c, 0x0c, 0, 0x0c, 0x0c, 0],
  ";": [0, 0x0c, 0x0c, 0, 0x0c, 0x04, 0x08],
  "-": [0, 0, 0, 0x1f, 0, 0, 0],
  "(": [0x02, 0x04, 0x08, 0x08, 0x08, 0x04, 0x02],
  ")": [0x08, 0x04, 0x02, 0x02, 0x02, 0x04, 0x08],
  "/": [0x01, 0x01, 0x02, 0x04, 0x08, 0x10, 0x10],
  "+": [0, 0x04, 0x04, 0x1f, 0x04, 0x04, 0],
  "%": [0x19, 0x19, 0x02, 0x04, 0x08, 0x13, 0x13],
  "<": [0x02, 0x04, 0x08, 0x10, 0x08, 0x04, 0x02],
  ">": [0x08, 0x04, 0x02, 0x01, 0x02, 0x04, 0x08],
  "=": [0, 0, 0x1f, 0, 0x1f, 0, 0],
  "_": [0, 0, 0, 0, 0, 0, 0x1f],
  "*": [0, 0x04, 0x15, 0x0e, 0x15, 0x04, 0],
};

// ---------- PNG encoder (stdlib only) ----------
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function pngChunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function encodePNG(w: number, h: number, rgb: Buffer): Buffer {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type 2 = RGB
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const raw = Buffer.alloc(h * (1 + w * 3));
  for (let y = 0; y < h; y++) {
    raw[y * (1 + w * 3)] = 0; // filter: none
    rgb.copy(raw, y * (1 + w * 3) + 1, y * w * 3, (y + 1) * w * 3);
  }
  const idat = deflateSync(raw, { level: 9 });
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", idat),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

// ---------- Pixel canvas ----------
type RGB = [number, number, number];

class Canvas {
  w: number;
  h: number;
  buf: Buffer;
  constructor(w: number, h: number) {
    this.w = w;
    this.h = h;
    this.buf = Buffer.alloc(w * h * 3);
  }
  fill(c: RGB): void {
    for (let i = 0; i < this.w * this.h; i++) {
      this.buf[i * 3] = c[0];
      this.buf[i * 3 + 1] = c[1];
      this.buf[i * 3 + 2] = c[2];
    }
  }
  rect(x: number, y: number, w: number, h: number, c: RGB): void {
    const x0 = Math.max(0, x), y0 = Math.max(0, y);
    const x1 = Math.min(this.w, x + w), y1 = Math.min(this.h, y + h);
    for (let yy = y0; yy < y1; yy++) {
      for (let xx = x0; xx < x1; xx++) {
        const o = (yy * this.w + xx) * 3;
        this.buf[o] = c[0]; this.buf[o + 1] = c[1]; this.buf[o + 2] = c[2];
      }
    }
  }
}

// ---------- Bitmap text ----------
function textWidth(s: string, scale: number): number {
  return s.length * 6 * scale - scale; // 5px glyph + 1px gap
}

function drawGlyph(cv: Canvas, ch: string, x: number, y: number, scale: number, c: RGB): void {
  const g = FONT[ch.toUpperCase()] ?? FONT["?"];
  for (let r = 0; r < 7; r++) {
    for (let col = 0; col < 5; col++) {
      if ((g[r] >> (4 - col)) & 1) cv.rect(x + col * scale, y + r * scale, scale, scale, c);
    }
  }
}

function drawText(cv: Canvas, s: string, x: number, y: number, scale: number, c: RGB): void {
  for (let i = 0; i < s.length; i++) drawGlyph(cv, s[i], x + i * 6 * scale, y, scale, c);
}

function drawTextCentered(cv: Canvas, s: string, cx: number, y: number, scale: number, c: RGB, outline?: RGB): number {
  const w = textWidth(s, scale);
  const x = Math.round(cx - w / 2);
  if (outline) {
    const d = Math.max(2, Math.round(scale * 0.5));
    for (const [dx, dy] of [[-d, 0], [d, 0], [0, -d], [0, d], [-d, -d], [d, -d], [-d, d], [d, d]] as const) {
      drawText(cv, s, x + dx, y + dy, scale, outline);
    }
  }
  drawText(cv, s, x, y, scale, c);
  return y + 7 * scale;
}

// Draw a block of text (lines split on \n, each wrapped if too wide), centered.
// Returns the y just below the block.
function drawBlock(cv: Canvas, text: string, cx: number, y: number, maxW: number, scale: number, c: RGB, outline: RGB, lineGap: number): number {
  for (const rawLine of text.split("\n")) {
    // greedy word wrap for this line
    const words = rawLine.split(" ");
    const lines: string[] = [];
    let cur = "";
    for (const w of words) {
      const t = cur ? cur + " " + w : w;
      if (textWidth(t, scale) <= maxW || !cur) cur = t;
      else { lines.push(cur); cur = w; }
    }
    if (cur) lines.push(cur);
    for (const ln of lines) {
      y = drawTextCentered(cv, ln, cx, y, scale, c, outline) + lineGap;
    }
  }
  return y;
}

// ---------- Meme scene (1024x1024) ----------
// Joke: an AI agent proudly ships a game in 2 minutes...
//        ...it is Snake. And it only goes left.
const NAVY: RGB = [15, 23, 42];
const WHITE: RGB = [255, 255, 255];
const BLACK: RGB = [0, 0, 0];
const GOLD: RGB = [255, 210, 63];
const GREEN: RGB = [8, 48, 32];
const GRID: RGB = [20, 84, 54];
const BORDER: RGB = [46, 204, 113];
const SNAKE: RGB = [57, 211, 83];
const HEAD: RGB = [120, 255, 140];
const APPLE: RGB = [229, 72, 77];
const STEM: RGB = [46, 204, 113];
const GRAY: RGB = [148, 163, 184];

function drawGameScreen(cv: Canvas): void {
  const x0 = 92, y0 = 330, w = 840, h = 360, cell = 40;
  cv.rect(x0, y0, w, h, GREEN);
  // grid lines
  for (let i = 1; i < 21; i++) cv.rect(x0 + i * cell, y0, 2, h, GRID);
  for (let j = 1; j < 9; j++) cv.rect(x0, y0 + j * cell, w, 2, GRID);
  // border
  cv.rect(x0, y0, w, 6, BORDER);
  cv.rect(x0, y0 + h - 6, w, 6, BORDER);
  cv.rect(x0, y0, 6, h, BORDER);
  cv.rect(x0 + w - 6, y0, 6, h, BORDER);
  // HUD
  drawText(cv, "SCORE: 0", x0 + 22, y0 + 16, 4, WHITE);
  const lvl = "LEVEL: SHIPPED";
  drawText(cv, lvl, x0 + w - 22 - textWidth(lvl, 4), y0 + 16, 4, WHITE);
  // apple (left, unreachable-ish: the snake crawls toward it, forever left)
  const rowY = y0 + 4 * cell;
  cv.rect(x0 + 3 * cell + 6, rowY + 6, 28, 28, APPLE);
  cv.rect(x0 + 3 * cell + 16, rowY - 2, 6, 10, STEM);
  // "<<": the snake only moves left
  drawText(cv, "<<", x0 + 8 * cell - 6, rowY + 8, 4, GOLD);
  // snake: head at col 9, body cols 10..16, all on row 4
  for (let col = 10; col <= 16; col++) {
    cv.rect(x0 + col * cell + 2, rowY + 2, 36, 36, SNAKE);
  }
  cv.rect(x0 + 9 * cell + 2, rowY + 2, 36, 36, HEAD);
  // eye on the left side of the head (looking left, obviously)
  cv.rect(x0 + 9 * cell + 8, rowY + 10, 10, 10, WHITE);
  cv.rect(x0 + 9 * cell + 8, rowY + 13, 5, 5, BLACK);
}

function main(): void {
  const W = 1024, H = 1024;
  const cv = new Canvas(W, H);
  cv.fill(NAVY);
  // setup line (top)
  drawBlock(cv, "AI AGENT SHIPPED\nMY GAME IN\n2 MINUTES", 512, 44, 940, 9, WHITE, BLACK, 16);
  cv.rect(0, 300, 1024, 8, GOLD);
  // the "game"
  drawGameScreen(cv);
  cv.rect(0, 712, 1024, 8, GOLD);
  // punchline (bottom)
  drawBlock(cv, "IT'S SNAKE.\nIT ONLY GOES LEFT.", 512, 762, 940, 8, GOLD, BLACK, 20);
  // kicker
  drawTextCentered(cv, "NO REFUNDS. NO RIGHT TURNS.", 512, 960, 3, GRAY);
  const png = encodePNG(W, H, cv.buf);
  // Gate self-check: the sealed scorer requires a whole PNG, at most
  // 1 MiB (1,048,576 bytes) and at most 1024x1024 pixels. Fail loudly
  // instead of shipping an entry the gate would refuse.
  if (W > 1024 || H > 1024) throw new Error(`image too large: ${W}x${H}`);
  if (png.length > 1048576) throw new Error(`entry.png too big: ${png.length} bytes`);
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "entry.png"), png);
}

main();
