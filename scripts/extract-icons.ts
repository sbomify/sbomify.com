/**
 * Icon extraction script
 * Converts Font Awesome SVG icons to the sbomify style format
 */

import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

const FA_PATH = "node_modules/@fortawesome/fontawesome-free/svgs";
const OUTPUT_PATH = "assets/images/site";

interface IconConfig {
  source: string; // Path relative to FA_PATH
  output: string; // Output filename
  type: "social" | "ui"; // social = 40x40 with border, ui = raw icon
  uiSize?: { width: number; height: number }; // Size for UI icons
}

const icons: IconConfig[] = [
  // Social icons with wrapper
  { source: "brands/x-twitter.svg", output: "x-white.svg", type: "social" },
  { source: "brands/github.svg", output: "github-white.svg", type: "social" },
  { source: "brands/linkedin.svg", output: "linkedin-white.svg", type: "social" },
  { source: "brands/slack.svg", output: "slack-white.svg", type: "social" },
  // UI icons
  { source: "solid/xmark.svg", output: "close.svg", type: "ui", uiSize: { width: 33, height: 33 } },
  { source: "solid/bars.svg", output: "hamburger-menu.svg", type: "ui", uiSize: { width: 28, height: 28 } },
];

/**
 * Extract the viewBox and path data from a Font Awesome SVG
 */
function parseFaSvg(content: string): { viewBox: string; pathData: string } {
  const viewBoxMatch = content.match(/viewBox="([^"]+)"/);
  const pathMatch = content.match(/<path[^>]*d="([^"]+)"/);

  if (!viewBoxMatch || !pathMatch) {
    throw new Error("Could not parse SVG");
  }

  return {
    viewBox: viewBoxMatch[1],
    pathData: pathMatch[1],
  };
}

/**
 * Create a social icon with the 40x40 wrapper and rounded border
 */
function createSocialIcon(pathData: string, originalViewBox: string): string {
  // Parse original viewBox to get dimensions
  const [, , origWidth, origHeight] = originalViewBox.split(" ").map(Number);

  // Calculate scale and position to center the icon in a 22x22 area within the 40x40 wrapper
  // Leaving ~9px padding on each side for the icon area (inside the border)
  const iconAreaSize = 22;
  const padding = 9;
  const scale = iconAreaSize / Math.max(origWidth, origHeight);

  // Center offset within the 40x40 space
  const scaledWidth = origWidth * scale;
  const scaledHeight = origHeight * scale;
  const offsetX = padding + (iconAreaSize - scaledWidth) / 2;
  const offsetY = padding + (iconAreaSize - scaledHeight) / 2;

  return `<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="0.5" y="0.5" width="38.9999" height="38.9999" rx="9.49999" stroke="white" stroke-opacity="0.3"/>
<g transform="translate(${offsetX.toFixed(2)}, ${offsetY.toFixed(2)}) scale(${scale.toFixed(6)})">
<path d="${pathData}" fill="white"/>
</g>
</svg>
`;
}

/**
 * Create a UI icon (close, hamburger) with specified dimensions
 */
function createUiIcon(pathData: string, originalViewBox: string, size: { width: number; height: number }): string {
  const [, , origWidth, origHeight] = originalViewBox.split(" ").map(Number);

  // Scale to fit within the target size while maintaining aspect ratio
  const scale = Math.min(size.width / origWidth, size.height / origHeight);
  const scaledWidth = origWidth * scale;
  const scaledHeight = origHeight * scale;

  // Center the icon
  const offsetX = (size.width - scaledWidth) / 2;
  const offsetY = (size.height - scaledHeight) / 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size.width}" height="${size.height}" viewBox="0 0 ${size.width} ${size.height}" fill="none">
<g transform="translate(${offsetX.toFixed(2)}, ${offsetY.toFixed(2)}) scale(${scale.toFixed(6)})">
<path d="${pathData}" fill="white"/>
</g>
</svg>
`;
}

// Process each icon
for (const icon of icons) {
  const sourcePath = join(FA_PATH, icon.source);
  const outputPath = join(OUTPUT_PATH, icon.output);

  console.log(`Processing ${icon.source} -> ${icon.output}`);

  const content = readFileSync(sourcePath, "utf-8");
  const { viewBox, pathData } = parseFaSvg(content);

  let svg: string;
  if (icon.type === "social") {
    svg = createSocialIcon(pathData, viewBox);
  } else {
    svg = createUiIcon(pathData, viewBox, icon.uiSize!);
  }

  writeFileSync(outputPath, svg);
  console.log(`  ✓ Created ${icon.output}`);
}

console.log("\nDone! All icons have been processed.");
