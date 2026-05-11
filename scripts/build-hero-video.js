const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const ffmpeg = require("@ffmpeg-installer/ffmpeg");
const sharp = require("sharp");

const root = path.resolve(__dirname, "..");
const thumbsDir = path.join(root, "assets", "thumbs");
const heroDir = path.join(root, "assets", "hero");
const framesDir = path.join(heroDir, "frames");
const svgDir = path.join(heroDir, "svg-frames");
const heroVideo = path.join(heroDir, "hero-interior-gallery.mp4");

const duration = 8;
const fps = 24;
const frameCount = duration * fps;

const run = (args) => {
  const result = spawnSync(ffmpeg.path, args, { stdio: "pipe", encoding: "utf8" });
  if (result.status !== 0) {
    console.error(result.stderr || result.stdout);
    throw new Error(`ffmpeg failed: ${args.join(" ")}`);
  }
};

const cleanDir = (dir) => {
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
};

fs.mkdirSync(heroDir, { recursive: true });
cleanDir(framesDir);
cleanDir(svgDir);

const thumbs = fs
  .readdirSync(thumbsDir, { withFileTypes: true })
  .filter((entry) => entry.isFile() && /\.(jpg|jpeg|png|webp)$/i.test(entry.name))
  .slice(0, 6)
  .map((entry) => {
    const file = path.join(thumbsDir, entry.name);
    const ext = path.extname(entry.name).toLowerCase();
    const mime = ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";
    return `data:${mime};base64,${fs.readFileSync(file).toString("base64")}`;
  });

if (!thumbs.length) {
  throw new Error("No thumbnails found. Run import-videos.js first.");
}

const esc = (value) => value.replace(/&/g, "&amp;").replace(/"/g, "&quot;");

const panel = (href, x, y, w, h, skew, opacity, side = "left") => `
  <g transform="translate(${x} ${y}) skewY(${skew})">
    <rect x="-24" y="-24" width="${w + 48}" height="${h + 48}" rx="3" fill="rgba(97,214,208,0.11)" stroke="${side === "left" ? "#D8A85A" : "#61D6D0"}" stroke-width="4" filter="url(#outerGlow)" />
    <image href="${esc(href)}" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice" opacity="${opacity}" filter="url(#screenshotTexture)" />
    <rect x="0" y="0" width="${w}" height="${h}" fill="url(#panelShade)" opacity="0.46" />
    <rect x="0" y="0" width="${w}" height="${h}" fill="${side === "left" ? "#D8A85A" : "#61D6D0"}" opacity="0.12" />
  </g>`;

const railLines = (turn) =>
  Array.from({ length: 18 }, (_, line) => {
    const p = line / 17;
    const y = 624 + p * 432;
    const curve = 80 + p * 180;
    return `<path d="M${-180 + turn * 0.7} ${y} C430 ${618 + curve}, 1490 ${618 + curve}, ${2100 + turn * 0.7} ${y}" fill="none" stroke="${line % 3 === 0 ? "#D8A85A" : "#61D6D0"}" stroke-opacity="${0.05 + p * 0.05}" stroke-width="${line % 4 === 0 ? 2 : 1}"/>`;
  }).join("");

const main = async () => {
for (let index = 0; index < frameCount; index += 1) {
  const t = index / frameCount;
  const orbit = Math.sin(t * Math.PI * 2) * 1;
  const turn = orbit * 124;
  const drift = Math.cos(t * Math.PI * 2) * 64;
  const light = 0.5 + Math.sin(t * Math.PI * 2 + 0.35) * 0.2;
  const leftWall = 170 + turn * 0.62;
  const rightWall = 1280 + turn * 0.78;
  const centerX = 960 + turn * 0.35;
  const horizon = 344 + drift * 0.05;
  const floorShift = 32 + drift * 0.34;
  const ceilingShift = -18 - drift * 0.22;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">
  <defs>
    <linearGradient id="back" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#171923"/>
      <stop offset="0.48" stop-color="#07080D"/>
      <stop offset="1" stop-color="#17110B"/>
    </linearGradient>
    <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#181A22"/>
      <stop offset="0.52" stop-color="#08090F"/>
      <stop offset="1" stop-color="#030006"/>
    </linearGradient>
    <linearGradient id="panelShade" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#000000" stop-opacity="0.1"/>
      <stop offset="0.48" stop-color="#07080D" stop-opacity="0.24"/>
      <stop offset="1" stop-color="#000000" stop-opacity="0.8"/>
    </linearGradient>
    <filter id="screenshotTexture">
      <feGaussianBlur stdDeviation="1.5"/>
      <feColorMatrix type="saturate" values="1.32"/>
    </filter>
    <filter id="outerGlow">
      <feGaussianBlur stdDeviation="7" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    <filter id="floorBlur">
      <feGaussianBlur stdDeviation="18"/>
    </filter>
    <radialGradient id="warmLight" cx="${0.52 + light * 0.06}" cy="0.43" r="0.66">
      <stop offset="0" stop-color="#D8A85A" stop-opacity="${0.24 + light * 0.12}"/>
      <stop offset="0.36" stop-color="#61D6D0" stop-opacity="0.13"/>
      <stop offset="0.58" stop-color="#FFFFFF" stop-opacity="0.04"/>
      <stop offset="1" stop-color="#000000" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="plinth" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#61D6D0" stop-opacity="0.28"/>
      <stop offset="0.55" stop-color="#10121B" stop-opacity="0.98"/>
      <stop offset="1" stop-color="#D8A85A" stop-opacity="0.34"/>
    </linearGradient>
  </defs>
  <rect width="1920" height="1080" fill="url(#back)"/>
  <circle cx="${960 + turn * 0.2}" cy="246" r="580" fill="#D8A85A" opacity="0.16" filter="url(#floorBlur)"/>
  <circle cx="${960 - turn * 0.32}" cy="392" r="470" fill="#61D6D0" opacity="0.1" filter="url(#floorBlur)"/>
  <path d="M0 ${214 + ceilingShift} L${centerX} ${horizon + ceilingShift * 0.15} L1920 ${214 - ceilingShift} L1920 0 L0 0 Z" fill="#11131A"/>
  <path d="M0 ${755 + floorShift} L${centerX} ${610 + floorShift * 0.06} L1920 ${755 - floorShift} L1920 1080 L0 1080 Z" fill="url(#floor)"/>
  <path d="M0 228 L${centerX} ${horizon} L1920 228 L1920 770 L${centerX} 610 L0 770 Z" fill="#0B0D14" opacity="0.94"/>
  <path d="M0 228 L${centerX} ${horizon} L${centerX} 610 L0 770 Z" fill="#12141E" opacity="0.78"/>
  <path d="M1920 228 L${centerX} ${horizon} L${centerX} 610 L1920 770 Z" fill="#10131B" opacity="0.78"/>
  <g opacity="0.82">
    <path d="M${centerX} ${horizon} L${centerX} 610" stroke="#61D6D0" stroke-opacity="0.22" stroke-width="2"/>
    <path d="M0 770 L${centerX} 610 L1920 770" fill="none" stroke="#D8A85A" stroke-opacity="0.24" stroke-width="2"/>
    ${railLines(turn)}
    ${Array.from({ length: 9 }, (_, line) => {
      const p = line / 8;
      const x = 210 + p * 1500 + turn * (p - 0.5) * 0.9;
      return `<path d="M${centerX} 610 L${x} 1110" fill="none" stroke="#61D6D0" stroke-opacity="${0.08 + Math.abs(p - 0.5) * 0.08}" stroke-width="2"/>`;
    }).join("")}
  </g>
  ${panel(thumbs[0], leftWall, 294 + drift * 0.08, 460, 258, -9 - turn * 0.035, 0.66, "left")}
  ${panel(thumbs[1 % thumbs.length], leftWall + 58, 586 - drift * 0.08, 356, 200, -6 - turn * 0.025, 0.48, "left")}
  ${panel(thumbs[2 % thumbs.length], rightWall, 286 - drift * 0.1, 460, 258, 9 - turn * 0.035, 0.64, "right")}
  ${panel(thumbs[3 % thumbs.length], rightWall - 88, 586 + drift * 0.08, 356, 200, 6 - turn * 0.025, 0.46, "right")}
  <ellipse cx="${centerX}" cy="${742 + floorShift * 0.2}" rx="${390 + Math.abs(turn) * 0.5}" ry="64" fill="#61D6D0" opacity="0.14" filter="url(#floorBlur)"/>
  <path d="M${centerX - 270} 650 L${centerX + 270} 650 L${centerX + 360} 772 L${centerX - 360} 772 Z" fill="url(#plinth)" stroke="#61D6D0" stroke-opacity="0.7" stroke-width="4" filter="url(#outerGlow)"/>
  <path d="M${centerX - 360} 772 L${centerX + 360} 772 L${centerX + 280} 832 L${centerX - 280} 832 Z" fill="#07080D" stroke="#D8A85A" stroke-opacity="0.62" stroke-width="3"/>
  <g opacity="0.42" filter="url(#floorBlur)">
    <path d="M${centerX - 260} 814 L${centerX + 260} 814 L${centerX + 390} 996 L${centerX - 390} 996 Z" fill="#D8A85A"/>
    <path d="M${centerX - 220} 830 L${centerX + 220} 830 L${centerX + 330} 960 L${centerX - 330} 960 Z" fill="#61D6D0" opacity="0.55"/>
  </g>
  <rect width="1920" height="1080" fill="url(#warmLight)"/>
  <g opacity="0.34">
    <path d="M120 872 C420 752, 742 748, 990 810 S1520 902, 1800 770" fill="none" stroke="#61D6D0" stroke-width="2"/>
    <path d="M70 906 C380 790, 790 804, 1030 864 S1504 942, 1850 826" fill="none" stroke="#D8A85A" stroke-width="2"/>
  </g>
  <rect width="1920" height="1080" fill="rgba(7,8,13,0.04)"/>
  <rect width="1920" height="1080" fill="none"/>
</svg>`;

  const frameName = `frame-${String(index + 1).padStart(4, "0")}`;
  fs.writeFileSync(path.join(svgDir, `${frameName}.svg`), svg, "utf8");
  await sharp(Buffer.from(svg)).png().toFile(path.join(framesDir, `${frameName}.png`));
}

run([
  "-y",
  "-framerate",
  String(fps),
  "-i",
  path.join(framesDir, "frame-%04d.png"),
  "-vf",
  "format=yuv420p",
  "-c:v",
  "libx264",
  "-preset",
  "slow",
  "-crf",
  "19",
  "-movflags",
  "+faststart",
  heroVideo,
]);

console.log(heroVideo);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
