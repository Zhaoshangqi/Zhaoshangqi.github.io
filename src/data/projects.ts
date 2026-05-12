import rawProjects from "../../data/works.json";

export type Lang = "zh" | "en";

export type Localized<T = string> = {
  zh: T;
  en: T;
};

export type CategoryKey =
  | "all"
  | "foley"
  | "redesign"
  | "gameplay"
  | "ambience"
  | "elemental"
  | "character"
  | "cinematic";

export type Project = {
  id: string;
  categoryKey: Exclude<CategoryKey, "all">;
  title: Localized;
  role: Localized;
  year: string;
  description: Localized;
  tags: Localized<string[]>;
  mediaUrl: string;
  posterUrl: string;
};

export const projects = (rawProjects as Project[]).map((project) => ({
  ...project,
  mediaUrl: `/${project.mediaUrl}`,
  posterUrl: `/${project.posterUrl}`,
}));

export const categoryMeta: Record<
  CategoryKey,
  {
    label: Localized;
    short: Localized;
    lead: Localized;
    accent: string;
  }
> = {
  all: {
    label: { zh: "全部作品", en: "All Works" },
    short: { zh: "全部", en: "All" },
    lead: {
      zh: "从视频作品、音频过程到交互声音实验完整浏览。",
      en: "Browse the full collection across video work, process, and interactive sound experiments.",
    },
    accent: "#00FFD1",
  },
  foley: {
    label: { zh: "拟音 / 水声", en: "Foley / Water" },
    short: { zh: "拟音", en: "Foley" },
    lead: {
      zh: "素材采集、分层、剪辑和声音质感塑形。",
      en: "Source capture, layering, editing, and sonic texture shaping.",
    },
    accent: "#00FFD1",
  },
  redesign: {
    label: { zh: "声音重设计", en: "Sound Redesign" },
    short: { zh: "重设计", en: "Redesign" },
    lead: {
      zh: "画面同步、转场、冲击点和戏剧声场控制。",
      en: "Picture sync, transitions, impact points, and cinematic sound-field control.",
    },
    accent: "#FF3B30",
  },
  gameplay: {
    label: { zh: "游戏反馈", en: "Gameplay Feedback" },
    short: { zh: "玩法", en: "Gameplay" },
    lead: {
      zh: "操作反馈、技能反馈、UI确认和可重复触发清晰度。",
      en: "Input response, skill feedback, UI confirmation, and repeatable clarity.",
    },
    accent: "#36FF7A",
  },
  ambience: {
    label: { zh: "环境声", en: "Ambience" },
    short: { zh: "环境", en: "Ambience" },
    lead: {
      zh: "空间、循环、实录素材与沉浸式氛围设计。",
      en: "Spatial tone, loop craft, field material, and immersive ambience design.",
    },
    accent: "#2563EB",
  },
  elemental: {
    label: { zh: "元素音效", en: "Elemental SFX" },
    short: { zh: "元素", en: "Elemental" },
    lead: {
      zh: "火、水、冲击与能量变化的声音运动控制。",
      en: "Motion control for fire, water, impact, and evolving energy sound.",
    },
    accent: "#FFD60A",
  },
  character: {
    label: { zh: "角色展示", en: "Character Showcase" },
    short: { zh: "角色", en: "Character" },
    lead: {
      zh: "角色个性、动作细节、循环节奏和展示混音。",
      en: "Character identity, motion details, loop rhythm, and showcase mixing.",
    },
    accent: "#00FFD1",
  },
  cinematic: {
    label: { zh: "影像叙事", en: "Cinematic" },
    short: { zh: "影像", en: "Cinematic" },
    lead: {
      zh: "PV、开场、预告片与镜头推进中的声音叙事。",
      en: "Sound storytelling for PVs, openings, trailers, and scene momentum.",
    },
    accent: "#FF3B30",
  },
};

export const categoryOrder: CategoryKey[] = [
  "all",
  "redesign",
  "gameplay",
  "foley",
  "ambience",
  "character",
  "elemental",
  "cinematic",
];

export const uiCopy = {
  zh: {
    language: "中文",
    loading: [
      "CALIBRATING SOUND FIELD",
      "INITIALIZING SONIC ENGINE",
      "LOADING AUDIO SIGNALS",
      "ENTER PORTFOLIO",
    ],
    nav: ["反应堆", "作品", "拆解", "流程", "实验室", "联系"],
    heroKicker: "GAME AUDIO PORTFOLIO / SONIC LAB",
    identity: ["GAME AUDIO", "SOUND DESIGN", "CINEMATIC MIXING"],
    heroLead:
      "面向游戏音频设计师、音效设计师与PV混音岗位的3D交互作品集。",
    ctaWork: "查看视频作品",
    ctaLab: "进入声音实验室",
    hud: {
      role: "Audio Designer",
      focus: "Game SFX / Cinematic Mix / Interactive Audio",
      tools: "REAPER / Wwise / FMOD / Unity / Unreal",
      status: "Available",
    },
    featuredTitle: "Featured Audio Works",
    featuredHeading: "3D 视频监视器墙",
    featuredLead: "悬浮视频监视器墙。Hover 预览，点击进入项目详情控制台。",
    missionType: "任务类型",
    overlay: {
      role: "职责",
      tools: "工具",
      year: "年份",
      audioDirection: "声音方向",
      designGoal: "设计目标",
      reference: "参考",
      layering: "分层策略",
      mixing: "混音重点",
      implementation: "实现备注",
      result: "最终结果",
      close: "关闭项目",
      timeline: ["参考", "素材", "分层", "同步", "处理", "中间件", "最终混音"],
      designGoalBody: "让画面动作、反馈节奏和情绪信息被快速读懂。",
      layeringBody: "以主体层、运动层、质感层和尾音层组织声音层次。",
      mixingBody: "控制低频重量，突出瞬态、中高频颗粒和空间尾音。",
    },
    breakdownTitle: "Sound Design Breakdown",
    breakdownHeading: "声音分层控制台",
    breakdownLead: "用声音分层控制台展示 Impact、Whoosh、Texture、Tail 与 UI Feedback 的制作逻辑。",
    activeLayer: "当前声音层",
    pipelineTitle: "Audio Pipeline",
    pipelineHeading: "音频制作流程",
    toolsTitle: "Tools & Systems",
    toolsHeading: "工具控制模块",
    toolStatus: "信号就绪",
    labTitle: "Interactive Lab",
    labHeading: "交互声音实验室",
    armDevice: "启动设备",
    aboutTitle: "Audio Designer Console",
    aboutRole: "音频设计师 / 游戏音效设计师",
    aboutFocus: ["游戏音效", "PV / 影视混音", "交互音频", "音频实现"],
    contact: "联系 / 简历 / Demo Reel",
    backToWorks: "返回作品",
  },
  en: {
    language: "EN",
    loading: [
      "CALIBRATING SOUND FIELD",
      "INITIALIZING SONIC ENGINE",
      "LOADING AUDIO SIGNALS",
      "ENTER PORTFOLIO",
    ],
    nav: ["Reactor", "Works", "Breakdown", "Pipeline", "Lab", "Contact"],
    heroKicker: "GAME AUDIO PORTFOLIO / SONIC LAB",
    identity: ["GAME AUDIO", "SOUND DESIGN", "CINEMATIC MIXING"],
    heroLead:
      "A 3D interactive portfolio for game audio design, sound design, and PV cinematic mixing roles.",
    ctaWork: "View Video Works",
    ctaLab: "Enter Sound Lab",
    hud: {
      role: "Audio Designer",
      focus: "Game SFX / Cinematic Mix / Interactive Audio",
      tools: "REAPER / Wwise / FMOD / Unity / Unreal",
      status: "Available",
    },
    featuredTitle: "Featured Audio Works",
    featuredHeading: "3D Video Monitor Wall",
    featuredLead: "A floating video monitor wall. Hover to preview, click to enter the project console.",
    missionType: "MISSION TYPE",
    overlay: {
      role: "ROLE",
      tools: "TOOLS",
      year: "YEAR",
      audioDirection: "Audio Direction",
      designGoal: "Design Goal",
      reference: "Reference",
      layering: "Layering Strategy",
      mixing: "Mixing Focus",
      implementation: "Implementation Notes",
      result: "Final Result",
      close: "Close Project",
      timeline: ["Reference", "Source", "Layer", "Sync", "Processing", "Middleware", "Final Mix"],
      designGoalBody: "Make motion, feedback rhythm, and emotional information readable fast.",
      layeringBody: "Organize sound through body, motion, texture, and tail layers.",
      mixingBody: "Control low-end weight while highlighting transient detail, upper texture, and space.",
    },
    breakdownTitle: "Sound Design Breakdown",
    breakdownHeading: "Layer Console",
    breakdownLead: "A layer console for Impact, Whoosh, Texture, Tail, and UI Feedback production logic.",
    activeLayer: "ACTIVE LAYER",
    pipelineTitle: "Audio Pipeline",
    pipelineHeading: "Signal Flow",
    toolsTitle: "Tools & Systems",
    toolsHeading: "Control Modules",
    toolStatus: "signal ready",
    labTitle: "Interactive Lab",
    labHeading: "Interactive Sound Lab",
    armDevice: "ARM DEVICE",
    aboutTitle: "Audio Designer Console",
    aboutRole: "Audio Designer / Game Sound Designer",
    aboutFocus: ["Game SFX", "Cinematic Mixing", "Interactive Audio", "Audio Implementation"],
    contact: "Contact / Resume / Demo Reel",
    backToWorks: "Back to works",
  },
} as const;

export const soundLayers = [
  {
    key: "impact",
    label: { zh: "冲击层", en: "Impact Layer" },
    description: {
      zh: "建立动作重量、命中反馈和画面冲击点。",
      en: "Builds weight, hit feedback, and visual punctuation.",
    },
    color: "#FF3B30",
  },
  {
    key: "whoosh",
    label: { zh: "掠过层", en: "Whoosh Layer" },
    description: {
      zh: "连接动作轨迹、速度变化和转场能量。",
      en: "Connects motion arcs, speed changes, and transition energy.",
    },
    color: "#00FFD1",
  },
  {
    key: "magic",
    label: { zh: "魔法层", en: "Magic Layer" },
    description: {
      zh: "塑造技能、元素和非现实声音身份。",
      en: "Shapes skill, elemental, and non-real sound identity.",
    },
    color: "#2563EB",
  },
  {
    key: "texture",
    label: { zh: "质感层", en: "Texture Layer" },
    description: {
      zh: "提供材质颗粒、表面细节和可辨识纹理。",
      en: "Adds material grains, surface detail, and readable texture.",
    },
    color: "#FFD60A",
  },
  {
    key: "tail",
    label: { zh: "尾音层", en: "Tail Layer" },
    description: {
      zh: "控制空间尾音、衰减和画面情绪延展。",
      en: "Controls reverb tail, decay, and emotional extension.",
    },
    color: "#36FF7A",
  },
  {
    key: "ui",
    label: { zh: "UI反馈层", en: "UI Feedback Layer" },
    description: {
      zh: "让确认、取消、切换和奖励反馈短促清晰。",
      en: "Keeps confirm, cancel, switch, and reward feedback concise.",
    },
    color: "#00FFD1",
  },
];

export const pipeline = [
  { zh: "参考", en: "REFERENCE" },
  { zh: "声音调色板", en: "SOUND PALETTE" },
  { zh: "设计", en: "DESIGN" },
  { zh: "剪辑", en: "EDIT" },
  { zh: "混音", en: "MIX" },
  { zh: "实现", en: "IMPLEMENT" },
  { zh: "测试", en: "TEST" },
  { zh: "交付", en: "FINAL" },
];

export const tools = [
  { name: "REAPER", note: { zh: "剪辑 / 分层 / 混音", en: "editing / layering / mixing" } },
  { name: "Wwise", note: { zh: "交互音频实现", en: "interactive audio implementation" } },
  { name: "FMOD", note: { zh: "参数与事件系统", en: "parameters and event systems" } },
  { name: "Unity", note: { zh: "游戏内声音验证", en: "in-engine audio validation" } },
  { name: "Unreal", note: { zh: "场景与镜头声音", en: "scene and cinematic audio" } },
  { name: "Middleware", note: { zh: "中间件管线", en: "middleware pipeline" } },
  { name: "AI Audio Tools", note: { zh: "素材生成与整理", en: "source generation and curation" } },
  { name: "Custom Scripts", note: { zh: "自动化与批处理", en: "automation and batch tools" } },
];

export const labItems = [
  {
    title: { zh: "REAPER 脚本工具", en: "REAPER Script Tools" },
    description: { zh: "批量整理、命名、渲染与工程效率工具。", en: "Batch organization, naming, rendering, and workflow tools." },
  },
  {
    title: { zh: "AI 声音设计流程", en: "AI Sound Design Workflow" },
    description: { zh: "用于素材发散、质感探索和快速参考。", en: "Used for source exploration, texture discovery, and fast references." },
  },
  {
    title: { zh: "程序化音频", en: "Procedural Audio" },
    description: { zh: "通过参数和规则生成可交互声音反馈。", en: "Parameter-driven sound feedback generated by rules." },
  },
  {
    title: { zh: "音频可视化", en: "Audio Visualization" },
    description: { zh: "把频谱、波形和能量变化转成视觉界面。", en: "Turns spectrum, waveform, and energy changes into interface visuals." },
  },
  {
    title: { zh: "交互音乐系统", en: "Interactive Music System" },
    description: { zh: "横向重编排、状态切换和游戏节奏控制。", en: "Horizontal resequencing, state switching, and gameplay pacing." },
  },
  {
    title: { zh: "3D 音频网页实验", en: "3D Audio Web Demo" },
    description: { zh: "用 WebGL 展示空间声音和交互装置概念。", en: "Uses WebGL to present spatial sound and interactive device concepts." },
  },
];

export const categoryTools: Record<Exclude<CategoryKey, "all">, string[]> = {
  foley: ["REAPER", "RX", "Layering"],
  redesign: ["REAPER", "Cinematic Mix", "Sync"],
  gameplay: ["Wwise", "FMOD", "Unity"],
  ambience: ["Field Recording", "RX", "Loop Design"],
  elemental: ["REAPER", "Synthesis", "Processing"],
  character: ["REAPER", "Motion Sync", "Mix"],
  cinematic: ["REAPER", "Trailer Mix", "Mastering"],
};

export const getLocalized = <T>(value: Localized<T>, lang: Lang) => value[lang] ?? value.en;
