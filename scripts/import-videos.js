const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const ffmpeg = require("@ffmpeg-installer/ffmpeg");

const sourceDir = process.argv[2];
const root = path.resolve(__dirname, "..");
const publicDir = path.join(root, "public");
const assetsRoot = path.join(publicDir, "assets");
const worksDir = path.join(assetsRoot, "works");
const thumbsDir = path.join(assetsRoot, "thumbs");
const dataDir = path.join(root, "data");
const outJson = path.join(dataDir, "works.json");

if (!sourceDir) {
  console.error("Usage: node scripts/import-videos.js <source-dir>");
  process.exit(1);
}

const folderOrder = ["CG贴片", "合成器", "环境实录", "远光84"];

const folderMeta = {
  "CG贴片": {
    categoryKey: "cg",
    role: {
      zh: "声音重设计 / 画面同步混音",
      en: "Sound Redesign / Picture Sync Mix",
    },
    description: {
      zh: "基于 CG 画面节奏、镜头推进、冲击点和转场能量完成声音贴片设计。",
      en: "A CG redesign pass built around picture rhythm, camera motion, impact points, and transition energy.",
    },
    tags: {
      zh: ["CG贴片", "声音重设计", "同步", "混音"],
      en: ["cg", "redesign", "sync", "mix"],
    },
  },
  "合成器": {
    categoryKey: "synthesis",
    role: {
      zh: "合成器音效 / 素材制作",
      en: "Synth SFX / Source Design",
    },
    description: {
      zh: "使用合成器、效果器和分层处理构建水、火与技能类音色素材。",
      en: "Synthesizer, FX, and layered processing for water, fire, and skill-oriented source design.",
    },
    tags: {
      zh: ["合成器", "技能音效", "水", "火"],
      en: ["synthesis", "skill sfx", "water", "fire"],
    },
  },
  "环境实录": {
    categoryKey: "field",
    role: {
      zh: "环境实录 / 空间环境声",
      en: "Field Recording / Spatial Ambience",
    },
    description: {
      zh: "环境实录与 Ambisonic 空间声素材展示，突出真实空间、层次和沉浸感。",
      en: "Field recording and Ambisonic ambience material focused on real space, depth, and immersion.",
    },
    tags: {
      zh: ["环境实录", "Ambisonics", "空间", "环境声"],
      en: ["field recording", "ambisonics", "spatial", "ambience"],
    },
  },
  "远光84": {
    categoryKey: "farlight",
    role: {
      zh: "项目音效 / Idleshow / 玩法反馈",
      en: "Game SFX / Idleshow / Gameplay Feedback",
    },
    description: {
      zh: "远光84项目相关作品，覆盖角色 Idleshow、打药反馈、皮肤展示与商业化场景声音。",
      en: "Farlight 84 work covering character Idleshow, healing feedback, skin presentation, and monetization audio.",
    },
    tags: {
      zh: ["远光84", "Idleshow", "玩法反馈", "商业化"],
      en: ["farlight 84", "idleshow", "gameplay feedback", "monetization"],
    },
  },
};

const titleMap = new Map([
  ["超越善恶2音效贴片", ["超越善恶2音效贴片", "Beyond Good & Evil 2 SFX Redesign"]],
  ["合成水音效展示贴片", ["合成水音效展示贴片", "Synthesized Water SFX Showcase"]],
  ["合成水音效过程展示", ["合成水音效过程展示", "Synthesized Water SFX Process"]],
  ["火合成音效制作", ["火合成音效制作", "Fire Synthesis Design"]],
  ["部分合成水音效素材制作", ["部分合成水音效素材制作", "Water Synthesis Source Materials"]],
  ["Ambisonic环境实录展示", ["Ambisonic环境实录展示", "Ambisonic Field Recording Showcase"]],
  ["海边实录环境", ["海边实录环境", "Coastal Field Ambience"]],
  ["打药音效", ["打药音效", "Healing Feedback SFX"]],
  ["桃桃idleshow音效展示", ["桃桃 Idleshow 音效展示", "Taotao Idleshow SFX"]],
  ["诀尘idleshow音效展示", ["诀尘 Idleshow 音效展示", "Juechen Idleshow SFX"]],
  ["诺拉idleshow音效展示", ["诺拉 Idleshow 音效展示", "Nora Idleshow SFX"]],
  ["魁斗idleshow音效展示", ["魁斗 Idleshow 音效展示", "Kuito Idleshow SFX"]],
  ["魅影终极皮开场展示", ["魅影终极皮开场展示", "Phantom Ultimate Skin Opening"]],
]);

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

const listVideos = () => {
  const entries = [];
  for (const folder of folderOrder) {
    const folderPath = path.join(sourceDir, folder);
    if (!fs.existsSync(folderPath)) continue;
    const files = fs
      .readdirSync(folderPath, { withFileTypes: true })
      .filter((entry) => entry.isFile() && /\.(mp4|mov|webm|m4v)$/i.test(entry.name))
      .sort((a, b) => a.name.localeCompare(b.name, "zh-Hans-CN"));

    for (const file of files) {
      entries.push({
        folder,
        source: path.join(folderPath, file.name),
        filename: file.name,
      });
    }
  }
  return entries;
};

fs.mkdirSync(worksDir, { recursive: true });
fs.mkdirSync(thumbsDir, { recursive: true });
fs.mkdirSync(dataDir, { recursive: true });

const backgroundSource = path.join(sourceDir, "远光84", "背景.webp");
if (fs.existsSync(backgroundSource)) {
  fs.copyFileSync(backgroundSource, path.join(publicDir, "farlight84-background.webp"));
}

const works = listVideos().map((entry, index) => {
  const meta = folderMeta[entry.folder];
  const number = String(index + 1).padStart(2, "0");
  const destName = `work-${number}.mp4`;
  const thumbName = `work-${number}.jpg`;
  const dest = path.join(worksDir, destName);
  const thumb = path.join(thumbsDir, thumbName);
  const clean = cleanTitle(entry.filename);
  const mappedTitle = titleMap.get(clean) ?? [clean, clean];

  runFfmpeg([
    "-y",
    "-i",
    entry.source,
    "-vf",
    "scale=1280:-2:force_original_aspect_ratio=decrease,fps=30,format=yuv420p",
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-crf",
    "23",
    "-c:a",
    "aac",
    "-b:a",
    "160k",
    "-movflags",
    "+faststart",
    dest,
  ]);

  runFfmpeg([
    "-y",
    "-ss",
    "00:00:01",
    "-i",
    dest,
    "-frames:v",
    "1",
    "-vf",
    "scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,setsar=1",
    "-q:v",
    "3",
    thumb,
  ]);

  return {
    id: `source-${number}`,
    categoryKey: meta.categoryKey,
    title: {
      zh: mappedTitle[0],
      en: mappedTitle[1],
    },
    role: meta.role,
    year: "2026",
    description: meta.description,
    tags: meta.tags,
    mediaUrl: `assets/works/${destName}`,
    posterUrl: `assets/thumbs/${thumbName}`,
  };
});

fs.writeFileSync(outJson, `${JSON.stringify(works, null, 2)}\n`, "utf8");

console.log(`Imported ${works.length} videos from ${sourceDir}`);
console.log(`Works: ${worksDir}`);
console.log(`Thumbs: ${thumbsDir}`);
console.log(`Data: ${outJson}`);
