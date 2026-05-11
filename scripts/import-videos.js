const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const ffmpeg = require("@ffmpeg-installer/ffmpeg");

const sourceDir = process.argv[2];
const root = path.resolve(__dirname, "..");
const worksDir = path.join(root, "assets", "works");
const thumbsDir = path.join(root, "assets", "thumbs");
const dataDir = path.join(root, "data");
const outJson = path.join(dataDir, "works.json");

if (!sourceDir) {
  console.error("Usage: node scripts/import-videos.js <source-dir>");
  process.exit(1);
}

const categories = [
  ["环境", "Ambience"],
  ["水", "Foley / Water"],
  ["火", "Elemental"],
  ["打药", "Gameplay Feedback"],
  ["idleshow", "Character Showcase"],
  ["贴片", "Sound Redesign"],
  ["开场", "Cinematic"],
];

const roleFor = (name) => {
  if (name.includes("过程") || name.includes("素材")) return "Sound Design Process / Material Editing";
  if (name.includes("环境") || name.includes("海边")) return "Field Recording / Ambience Design";
  if (name.includes("贴片") || name.includes("展示")) return "Sound Redesign / Mix";
  return "Sound Design / Editing / Mix";
};

const categoryFor = (name) => {
  const pair = categories.find(([keyword]) => name.toLowerCase().includes(keyword.toLowerCase()));
  return pair ? pair[1] : "Game Audio";
};

const tagsFor = (name) => {
  const tags = [];
  if (name.includes("环境") || name.includes("海边")) tags.push("ambience", "field recording");
  if (name.includes("水")) tags.push("water", "foley");
  if (name.includes("火")) tags.push("fire", "elemental");
  if (name.includes("打药")) tags.push("gameplay", "feedback");
  if (name.toLowerCase().includes("idleshow")) tags.push("character", "showcase");
  if (name.includes("贴片")) tags.push("redesign", "sync");
  if (name.includes("过程") || name.includes("素材")) tags.push("process", "layers");
  return tags.length ? tags : ["sound design"];
};

const cleanTitle = (filename) =>
  path
    .basename(filename, path.extname(filename))
    .replace(/_batch$/i, "")
    .replace(/_/g, " ")
    .trim();

const runFfmpeg = (args) => {
  const result = spawnSync(ffmpeg.path, args, { stdio: "pipe", encoding: "utf8" });
  if (result.status !== 0) {
    console.error(result.stderr || result.stdout);
    throw new Error(`ffmpeg failed: ${args.join(" ")}`);
  }
};

fs.mkdirSync(worksDir, { recursive: true });
fs.mkdirSync(thumbsDir, { recursive: true });
fs.mkdirSync(dataDir, { recursive: true });

const sourceFiles = fs
  .readdirSync(sourceDir, { withFileTypes: true })
  .filter((entry) => entry.isFile() && /\.(mp4|mov|webm|m4v)$/i.test(entry.name))
  .sort((a, b) => a.name.localeCompare(b.name, "zh-Hans-CN"));

const works = sourceFiles.map((entry, index) => {
  const source = path.join(sourceDir, entry.name);
  const number = String(index + 1).padStart(2, "0");
  const destName = `work-${number}.mp4`;
  const thumbName = `work-${number}.jpg`;
  const dest = path.join(worksDir, destName);
  const thumb = path.join(thumbsDir, thumbName);
  const title = cleanTitle(entry.name);

  fs.copyFileSync(source, dest);
  runFfmpeg([
    "-y",
    "-ss",
    "00:00:01",
    "-i",
    dest,
    "-frames:v",
    "1",
    "-vf",
    "scale=1280:-1:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2,setsar=1",
    "-q:v",
    "3",
    thumb,
  ]);

  return {
    id: `source-${number}`,
    title,
    category: categoryFor(title),
    role: roleFor(title),
    year: "2026",
    description: "导入自本地作品文件夹，可在上传与排版区域继续编辑说明、标签和展示顺序。",
    tags: tagsFor(title),
    mediaUrl: `/assets/works/${destName}`,
    posterUrl: `/assets/thumbs/${thumbName}`,
    fileName: entry.name,
    fileType: "video/mp4",
    createdAt: index + 1,
  };
});

fs.writeFileSync(outJson, `${JSON.stringify(works, null, 2)}\n`, "utf8");

console.log(`Imported ${works.length} videos`);
console.log(`Works: ${worksDir}`);
console.log(`Thumbs: ${thumbsDir}`);
console.log(`Data: ${outJson}`);
