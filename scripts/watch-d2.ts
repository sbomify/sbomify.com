import { watch, readdirSync, readFileSync, existsSync, copyFileSync, mkdirSync } from "fs";
import { join, basename, extname } from "path";
import { spawn } from "child_process";

const SOURCE_DIR = "_d2";
const DEST_DIR = "assets/images/d2";
const INCLUDES_DIR = "layouts/partials/d2";
const THEME_FILE = join(SOURCE_DIR, "theme.d2");

const isWatchMode = process.argv.includes("--watch");

// Ensure directories exist
if (!existsSync(DEST_DIR)) {
  mkdirSync(DEST_DIR, { recursive: true });
}
if (!existsSync(INCLUDES_DIR)) {
  mkdirSync(INCLUDES_DIR, { recursive: true });
}

const getThemeContent = () => {
  if (existsSync(THEME_FILE)) {
    return readFileSync(THEME_FILE, "utf-8");
  }
  return "";
};

const compile = (filename: string) => {
  if (!filename.endsWith(".d2")) return;
  if (filename === "theme.d2") return; // Don't compile the theme file itself

  const name = basename(filename, extname(filename));
  const inputPath = join(SOURCE_DIR, filename);
  const outputPath = join(DEST_DIR, `${name}.svg`);

  console.log(`Compiling ${filename} to ${outputPath}...`);

  const sourceContent = readFileSync(inputPath, "utf-8");
  const themeContent = getThemeContent();
  const fullContent = themeContent + "\n" + sourceContent;

  // Spawn d2 with stdin
  const proc = spawn("d2", ["--theme=1", "-", outputPath]);

  proc.stdout.on("data", (data) => console.log(data.toString().trim()));
  proc.stderr.on("data", (data) => console.error(data.toString().trim()));

  proc.stdin.write(fullContent);
  proc.stdin.end();

  proc.on("close", (code) => {
    if (code === 0) {
      console.log(`Successfully compiled ${filename}`);
      // Copy to includes for inline usage
      const includePath = join(INCLUDES_DIR, `${name}.svg`);
      try {
        copyFileSync(outputPath, includePath);
        console.log(`Copied to ${includePath}`);
      } catch (err) {
        console.error(`Failed to copy to includes: ${err}`);
      }
    } else {
      console.error(`Failed to compile ${filename}`);
    }
  });
};

// Initial compile of all files
try {
  const files = readdirSync(SOURCE_DIR);
  files.forEach(compile);
} catch (e) {
  console.log("No initial files to compile or directory empty");
}

if (isWatchMode) {
  console.log(`Watching ${SOURCE_DIR} for changes...`);
  watch(SOURCE_DIR, (eventType, filename) => {
    if (filename) {
        if (filename === "theme.d2") {
             // If theme changes, recompile everything
             console.log("Theme changed, recompiling all...");
             const files = readdirSync(SOURCE_DIR);
             files.forEach(compile);
        } else if (filename.endsWith(".d2")) {
            compile(filename);
        }
    }
  });
} else {
    // Script naturally exits when processes complete
}
