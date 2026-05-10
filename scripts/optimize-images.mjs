#!/usr/bin/env node
/**
 * One-time image optimization script.
 *
 * Reads selected images from /public, generates resized WebP variants alongside
 * the originals (e.g. smartiLogo.png -> smartiLogo.webp), and prints a summary.
 *
 * Run:
 *   npm install --save-dev sharp
 *   npm run images:optimize
 *
 * Re-running is safe (it overwrites the .webp outputs).
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.resolve(__dirname, "..", "public");

/** @typedef {{ file: string; maxWidth?: number; quality?: number }} Job */

/**
 * The display widths we render at, plus a small DPR buffer (×2 max).
 * Most carousel/hero slots are < 600 CSS px, so 1600 is plenty for retina.
 */
const JOBS = /** @type {Job[]} */ ([
  { file: "hero.png", maxWidth: 1200, quality: 80 },
  { file: "smarti_step1.png", maxWidth: 800, quality: 80 },
  { file: "smarti_step2.png", maxWidth: 800, quality: 80 },
  { file: "smarti_step3.png", maxWidth: 800, quality: 80 },
  { file: "smartiLogo.png", maxWidth: 400, quality: 85 },
  { file: "smartiLogo2.png", maxWidth: 400, quality: 85 },
  { file: "smartiIcon.png", maxWidth: 512, quality: 85 },
  { file: "logoFont.png", maxWidth: 300, quality: 85 },
  { file: "smarti.png", maxWidth: 600, quality: 85 },
  { file: "smarti_avatar.png", maxWidth: 256, quality: 85 },
  { file: "girl_avatar.png", maxWidth: 256, quality: 85 },
  { file: "boy_avatar.png", maxWidth: 256, quality: 85 },
  { file: "dragon_avatar.png", maxWidth: 256, quality: 85 },
  { file: "bookStep1.png", maxWidth: 600, quality: 80 },
  { file: "bookStep2.png", maxWidth: 600, quality: 80 },
  { file: "bookStep3.png", maxWidth: 600, quality: 80 },
]);

const fmtKB = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

async function processOne(/** @type {Job} */ job) {
  const inputPath = path.join(PUBLIC_DIR, job.file);
  let inputStat;
  try {
    inputStat = await fs.stat(inputPath);
  } catch {
    return { job, skipped: true, reason: "missing" };
  }

  const parsed = path.parse(inputPath);
  const outputPath = path.join(parsed.dir, `${parsed.name}.webp`);

  const pipeline = sharp(inputPath, { failOn: "none" });
  const meta = await pipeline.metadata();

  const targetWidth = job.maxWidth ?? meta.width ?? 1200;
  const resized =
    meta.width && meta.width > targetWidth
      ? pipeline.resize({ width: targetWidth, withoutEnlargement: true })
      : pipeline;

  await resized
    .webp({
      quality: job.quality ?? 80,
      effort: 6,
      smartSubsample: true,
    })
    .toFile(outputPath);

  const outStat = await fs.stat(outputPath);
  return {
    job,
    inputBytes: inputStat.size,
    outputBytes: outStat.size,
    outputPath,
    width: meta.width,
    targetWidth,
  };
}

async function main() {
  console.log(`Optimizing images in ${PUBLIC_DIR}\n`);

  const results = [];
  for (const job of JOBS) {
    try {
      results.push(await processOne(job));
    } catch (err) {
      results.push({ job, error: err instanceof Error ? err.message : String(err) });
    }
  }

  let totalIn = 0;
  let totalOut = 0;

  for (const r of results) {
    if (r.skipped) {
      console.log(`  skip   ${r.job.file}  (${r.reason})`);
      continue;
    }
    if (r.error) {
      console.log(`  ERROR  ${r.job.file}  ${r.error}`);
      continue;
    }
    totalIn += r.inputBytes;
    totalOut += r.outputBytes;
    const pct = ((1 - r.outputBytes / r.inputBytes) * 100).toFixed(0);
    console.log(
      `  ok     ${r.job.file.padEnd(24)} ${fmtKB(r.inputBytes).padStart(10)} -> ${fmtKB(r.outputBytes).padStart(10)} (-${pct}%, w<=${r.targetWidth})`
    );
  }

  console.log("");
  console.log(`Total: ${fmtKB(totalIn)} -> ${fmtKB(totalOut)} (${(((1 - totalOut / totalIn) * 100) || 0).toFixed(0)}% saved)`);
  console.log("");
  console.log("Next: update <Image src=...> calls to use the .webp files.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
