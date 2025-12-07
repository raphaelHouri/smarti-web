/**
 * Script to generate PWA icons from a source image
 * 
 * Usage:
 *   npm install sharp --save-dev
 *   tsx scripts/generatePwaIcons.ts
 * 
 * Make sure you have a source image at public/smartiLogo.png or update the source path below
 */

import sharp from "sharp";
import { existsSync } from "fs";
import { join } from "path";

const sizes = [192, 256, 384, 512];
const sourceImage = join(process.cwd(), "public", "smartiLogo.png");
const outputDir = join(process.cwd(), "public");

async function generateIcons() {
    // Check if source image exists
    if (!existsSync(sourceImage)) {
        console.error(`Source image not found at: ${sourceImage}`);
        console.error("Please ensure smartiLogo.png exists in the public directory");
        process.exit(1);
    }

    console.log("Generating PWA icons...");

    for (const size of sizes) {
        const outputPath = join(outputDir, `icon-${size}x${size}.png`);

        try {
            await sharp(sourceImage)
                .resize(size, size, {
                    fit: "contain",
                    background: { r: 255, g: 255, b: 255, alpha: 1 },
                })
                .png()
                .toFile(outputPath);

            console.log(`✓ Generated ${outputPath}`);
        } catch (error) {
            console.error(`✗ Failed to generate ${outputPath}:`, error);
        }
    }

    console.log("\nDone! All PWA icons have been generated.");
}

generateIcons().catch(console.error);

