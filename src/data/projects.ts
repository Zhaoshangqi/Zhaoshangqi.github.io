import rawProjects from "../../data/works.json";

export type Lang = "zh" | "en";

export type Localized<T = string> = {
  zh: T;
  en: T;
};

export type CategoryKey =
  | "all"
  | "cg"
  | "synthesis"
  | "field"
  | "farlight";

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
  mediaUrl: project.mediaUrl,
  posterUrl: project.posterUrl,
}));

export const personalProfile = {
  name: {
    zh: "赵上琦",
    en: "Zhao Shangqi",
  },
  displayName: "ZSQAudio",
  title: {
    zh: "游戏音频设计师 / 声音设计师",
    en: "Game Audio Designer / Sound Designer",
  },
  intent: {
    zh: "求职意向：音频设计师 · 社招",
    en: "Target Role: Audio Designer · Experienced Hire",
  },
  location: {
    zh: "上海",
    en: "Shanghai",
  },
  phone: "17611198225",
  email: "17611198225@163.com",
  years: {
    zh: "5 年游戏音频经验",
    en: "5 years in game audio",
  },
  started: "2021",
  avatarUrl: "zhao-shangqi-profile.png",
  resumeUrl: "zhao-shangqi-audio-designer-resume.pdf",
  summary: {
    zh: "专注游戏音效设计、Foley、交互反馈、环境声与 PV 混音。具备 UE+Wwise、CRI、Unity 项目集成经验，并能从素材采集、合成器设计、分层剪辑到引擎内调试完成完整声音落地。",
    en: "Focused on game SFX, Foley, interaction feedback, ambience, and PV mixing. Experienced with UE+Wwise, CRI, and Unity pipelines, from source capture and synthesis to layered editing, middleware integration, and in-engine tuning.",
  },
  highlights: [
    {
      zh: "角色动作、Foley、脚步与衣物摩擦",
      en: "Character motion, Foley, footsteps, and cloth detail",
    },
    {
      zh: "地图环境声、点声源规划与 Ambisonics 后期",
      en: "Map ambience, point-source planning, and Ambisonics post",
    },
    {
      zh: "局内交互、UI、治疗、救援、载具等玩法反馈",
      en: "Gameplay feedback for UI, healing, rescue, vehicles, and interaction",
    },
    {
      zh: "PV 音效设计、节奏控制、混音与最终输出",
      en: "PV sound design, pacing, mixing, and final delivery",
    },
  ],
};

export const resumeStats = [
  {
    value: "5",
    label: { zh: "年工作经验", en: "Years Experience" },
    note: { zh: "2021 开始从事游戏音频", en: "Game audio since 2021" },
  },
  {
    value: "UE+Wwise",
    label: { zh: "主力集成链路", en: "Main Implementation Stack" },
    note: { zh: "FPS / TPS / 商业化 / 交互反馈", en: "FPS / TPS / monetization / feedback" },
  },
  {
    value: "CRI",
    label: { zh: "工程接入经验", en: "CRI Pipeline" },
    note: { zh: "资源管理、测试、调优", en: "asset management, testing, tuning" },
  },
  {
    value: "Ambisonics",
    label: { zh: "空间环境声", en: "Spatial Ambience" },
    note: { zh: "录制、后期、IEM 输出", en: "capture, post, IEM output" },
  },
];

export const categoryMeta: Record<
  CategoryKey,
  {
    label: Localized;
    short: Localized;
    lead: Localized;
    accent: string;
    backgroundUrl?: string;
  }
> = {
  all: {
    label: { zh: "全部作品", en: "All Works" },
    short: { zh: "全部", en: "All" },
    lead: {
      zh: "按本地作品文件夹重新分类：CG贴片、合成器、环境实录、远光84。",
      en: "Regrouped by the local portfolio folders: CG redesign, synthesis, field recording, and Farlight 84.",
    },
    accent: "#00FFD1",
  },
  cg: {
    label: { zh: "CG贴片", en: "CG SFX Redesign" },
    short: { zh: "CG贴片", en: "CG" },
    lead: {
      zh: "围绕动画镜头、冲击点、转场和画面节奏完成声音重设计。",
      en: "Sound redesign for animated shots, impact points, transitions, and picture rhythm.",
    },
    accent: "#FF3B30",
  },
  synthesis: {
    label: { zh: "合成器", en: "Synthesis" },
    short: { zh: "合成器", en: "Synth" },
    lead: {
      zh: "合成水、火焰与技能素材的设计展示，强调音色生成和效果器塑形。",
      en: "Synthesized water, fire, and skill-source design focused on tone generation and FX shaping.",
    },
    accent: "#FFD60A",
  },
  field: {
    label: { zh: "环境实录", en: "Field Recording" },
    short: { zh: "环境实录", en: "Field" },
    lead: {
      zh: "海边环境和 Ambisonic 实录展示，突出空间层次、实录质感和沉浸感。",
      en: "Coastal ambience and Ambisonic recordings with spatial depth, real texture, and immersion.",
    },
    accent: "#2563EB",
  },
  farlight: {
    label: { zh: "远光84", en: "Farlight 84" },
    short: { zh: "远光84", en: "Farlight" },
    lead: {
      zh: "角色 Idleshow、打药反馈、皮肤开场等商业化和玩法反馈音效。",
      en: "Character Idleshow, healing feedback, skin openings, monetization, and gameplay feedback SFX.",
    },
    accent: "#00FFD1",
    backgroundUrl: "farlight84-background.webp",
  },
};

export const categoryOrder: CategoryKey[] = [
  "all",
  "cg",
  "synthesis",
  "field",
  "farlight",
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
    nav: ["首页", "作品", "履历", "项目", "技能", "联系"],
    heroKicker: "GAME AUDIO PORTFOLIO / ZSQAudio",
    identity: ["GAME AUDIO", "FOLEY", "Wwise / CRI", "PV MIX"],
    heroLead:
      "赵上琦，上海游戏音频设计师。专注角色动作、Foley、玩法反馈、环境声、空间音频和宣发 PV 混音，把声音从素材、设计、集成一路做到游戏内可用。",
    ctaWork: "查看视频作品",
    ctaLab: "查看项目履历",
    downloadResume: "下载简历 PDF",
    hud: {
      role: "音频设计师",
      focus: "Game SFX / Foley / Ambisonics / PV Mix",
      tools: "REAPER / Cubase / Wwise / CRI / UE / Unity",
      status: "求职方向：音频设计师",
    },
    featuredTitle: "Featured Audio Works",
    featuredHeading: "分类视频作品舞台",
    featuredLead:
      "作品按 E 盘文件夹重新分类：CG贴片、合成器、环境实录、远光84。切换分类时，全屏背景、横向作品轨道与斜向渐变粒子过场同步运动。",
    missionType: "作品方向",
    experienceTitle: "Professional Experience",
    experienceHeading: "游戏音频履历",
    experienceLead:
      "从 Wwise 框架、CRI 工程接入，到 FPS/TPS 角色动作、商业化展示、环境声与 PV 混音，履历内容已拆成招聘方更容易快速扫描的项目叙事。",
    creditsTitle: "Project Credits",
    creditsHeading: "核心项目经验",
    creditsLead:
      "简历中的项目职责被整理成可阅读的作品说明：做什么、用什么管线、最终服务什么体验。",
    breakdownTitle: "Sound Design Capability",
    breakdownHeading: "声音能力拆解",
    breakdownLead:
      "将简历里的工作能力拆成招聘方能立刻判断的模块：动作与 Foley、环境声、玩法反馈、商业化、宣发 PV、合成器技能音效。",
    activeLayer: "当前能力模块",
    pipelineTitle: "Audio Pipeline",
    pipelineHeading: "从素材到引擎的交付流程",
    toolsTitle: "Tools & Systems",
    toolsHeading: "工具与系统能力",
    toolStatus: "熟练",
    labTitle: "Skill Matrix",
    labHeading: "招聘视角技能矩阵",
    armDevice: "查看方向",
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
      timeline: ["参考", "素材", "分层", "同步", "处理", "中间件", "混音"],
      designGoalBody: "让动作、反馈节奏和情绪信息在画面中被快速读懂。",
      layeringBody: "以主体层、运动层、材质层和尾音层组织声音层次。",
      mixingBody: "控制低频重量，突出瞬态、中高频颗粒和空间尾音。",
    },
    aboutTitle: "Contact / Resume",
    aboutRole: "音频设计师 / 游戏音效设计师",
    aboutFocus: ["上海", "2021 年开始工作", "北京现代音乐研修学院 · 声音设计", "社招 · 音频设计师"],
    contact: "电话 / 邮箱 / 简历",
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
    nav: ["Home", "Works", "Experience", "Projects", "Skills", "Contact"],
    heroKicker: "GAME AUDIO PORTFOLIO / ZSQAudio",
    identity: ["GAME AUDIO", "FOLEY", "Wwise / CRI", "PV MIX"],
    heroLead:
      "Zhao Shangqi is a Shanghai-based game audio designer focused on character motion, Foley, gameplay feedback, ambience, spatial audio, and promotional PV mixing, carrying sound from source and design into playable implementation.",
    ctaWork: "View Video Works",
    ctaLab: "View Experience",
    downloadResume: "Download Resume PDF",
    hud: {
      role: "Audio Designer",
      focus: "Game SFX / Foley / Ambisonics / PV Mix",
      tools: "REAPER / Cubase / Wwise / CRI / UE / Unity",
      status: "Target Role: Audio Designer",
    },
    featuredTitle: "Featured Audio Works",
    featuredHeading: "Categorized Video Showcase",
    featuredLead:
      "Works are regrouped by the E-drive folders: CG redesign, synthesis, field recording, and Farlight 84. Switching categories drives the full-screen background, horizontal rail, and diagonal gradient particle transition together.",
    missionType: "Audio Direction",
    experienceTitle: "Professional Experience",
    experienceHeading: "Game Audio Career",
    experienceLead:
      "From Wwise architecture and CRI integration to FPS/TPS character motion, monetization showcases, ambience, and PV mixing, the resume is reorganized into recruiter-friendly project storytelling.",
    creditsTitle: "Project Credits",
    creditsHeading: "Core Project Experience",
    creditsLead:
      "Resume responsibilities are translated into readable portfolio notes: what was designed, which pipeline was used, and what player experience it served.",
    breakdownTitle: "Sound Design Capability",
    breakdownHeading: "Capability Breakdown",
    breakdownLead:
      "Resume skills are grouped into practical modules: motion and Foley, ambience, gameplay feedback, monetization, PV audio, and synthesized skill SFX.",
    activeLayer: "ACTIVE MODULE",
    pipelineTitle: "Audio Pipeline",
    pipelineHeading: "From Source To Engine",
    toolsTitle: "Tools & Systems",
    toolsHeading: "Tool And System Capability",
    toolStatus: "proficient",
    labTitle: "Skill Matrix",
    labHeading: "Recruiter-Ready Skill Matrix",
    armDevice: "View Focus",
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
    aboutTitle: "Contact / Resume",
    aboutRole: "Audio Designer / Game Sound Designer",
    aboutFocus: ["Shanghai", "Working since 2021", "Beijing Modern Music Institute · Sound Design", "Experienced hire · Audio Designer"],
    contact: "Phone / Email / Resume",
    backToWorks: "Back to works",
  },
} as const;

export const professionalExperience = [
  {
    period: "2024.11 - 至今",
    periodEn: "Nov 2024 - Present",
    company: { zh: "莉莉丝科技股份有限公司", en: "Lilith Games" },
    role: { zh: "音频设计师", en: "Audio Designer" },
    projects: ["远光84"],
    bullets: {
      zh: [
        "参与《远光84》核心音效设计，覆盖角色动作、环境声与交互音效。",
        "协助完成角色 Foley、脚步、衣物摩擦及动作类音效。",
        "执行地图环境声设计，完成环境底噪、点声源规划、音效封装与调试。",
        "负责商业化模块音效，完成 Idleshow 展示、枪械皮肤击杀音效等场景。",
        "独立完成项目宣发 PV 音效设计与混音，并参与 Ambisonics 环境声录制与应用。",
      ],
      en: [
        "Contributed core SFX for Farlight 84, covering character motion, ambience, and interaction feedback.",
        "Supported character Foley, footsteps, cloth movement, and action-related sound detail.",
        "Designed map ambience beds, point-source planning, sound packaging, and tuning.",
        "Built monetization audio for Idleshow presentation and weapon-skin kill feedback.",
        "Handled PV sound design and mix, and explored Ambisonics capture and implementation.",
      ],
    },
  },
  {
    period: "2022.10 - 2024.11",
    periodEn: "Oct 2022 - Nov 2024",
    company: { zh: "厦门市真有趣科技有限公司", en: "Xiamen Zhenyouqu Technology" },
    role: { zh: "音频设计师", en: "Audio Designer" },
    projects: ["不休的乌拉拉", "在研 TPS 项目"],
    bullets: {
      zh: [
        "负责《不休的乌拉拉》CRI 工程音频集成，提升音频资源管理与优化效率。",
        "制作游戏内 UI、动作、时装、过场动画、技能等音效并完成精确绑定。",
        "参与在研 TPS 项目，制作枪械、技能、角色动作等项目所需音效。",
        "承担 Wwise 音效集成相关工作。",
      ],
      en: [
        "Handled CRI audio integration for Ulala: Idle Adventure, improving asset management and optimization.",
        "Created and bound UI, action, costume, cutscene, and skill SFX.",
        "Designed gun, skill, and character-motion sounds for an in-development TPS project.",
        "Worked on Wwise implementation and integration tasks.",
      ],
    },
  },
  {
    period: "2022.04 - 2022.06",
    periodEn: "Apr 2022 - Jun 2022",
    company: { zh: "北京掌趣科技有限公司", en: "Ourpalm" },
    role: { zh: "音频设计师", en: "Audio Designer" },
    projects: ["非匿名指令", "一拳超人", "代号：雷神"],
    bullets: {
      zh: [
        "负责《非匿名指令》CRI 工程内音频测试与调优，保障音频效果一致性。",
        "参与《一拳超人》音效迭代制作，提升游戏内听感质量。",
        "参与《代号：雷神》音频接入初期风格预言，制作 UI 与角色战斗音效。",
      ],
      en: [
        "Tested and tuned CRI audio for Archeland-style project work to maintain sound consistency.",
        "Iterated in-game sound effects for One Punch Man to improve player experience.",
        "Contributed early audio style forecasting for Codename: Thor and created UI plus combat SFX.",
      ],
    },
  },
  {
    period: "2021.04 - 2022.03",
    periodEn: "Apr 2021 - Mar 2022",
    company: { zh: "北京攸乐科技有限公司", en: "Beijing Youle Technology" },
    role: { zh: "音频设计师", en: "Audio Designer" },
    projects: ["日本 IP 项目"],
    bullets: {
      zh: [
        "主导负责游戏内声音引擎 Wwise 框架架构设计。",
        "负责游戏内所有音效制作与集成。",
        "协调优化跨部门对接流程，并与外包团队进行音频质量验收。",
        "编写并反馈质量验收文档，推动音频效果持续优化。",
      ],
      en: [
        "Led Wwise framework architecture for an in-game audio system.",
        "Created and implemented all in-game sound effects.",
        "Improved cross-discipline handoff and reviewed outsourced audio quality.",
        "Wrote QA feedback documentation to support continuous audio polish.",
      ],
    },
  },
];

export const resumeProjects = [
  {
    title: { zh: "在研 FPS 项目", en: "In-Development FPS Project" },
    meta: { zh: "项目类型：FPS · 游戏引擎：UE+Wwise", en: "FPS · UE+Wwise" },
    body: {
      zh: "负责 Demo 版本角色动作音效，包括蹲起、趴下、爬行、梯子攀爬、滑索、玻璃破碎、打药治疗、受击、打甲、打肉和碎甲等反馈，并优化动作与战斗音效节奏。",
      en: "Designed Demo character motion SFX including crouch, prone, crawl, ladder, zipline, glass break, healing, hit, armor, flesh, and armor-break feedback while refining motion and combat rhythm.",
    },
  },
  {
    title: { zh: "远光84", en: "Farlight 84" },
    meta: { zh: "项目类型：FPS 大逃杀 · 游戏引擎：UE+Wwise", en: "Battle Royale FPS · UE+Wwise" },
    body: {
      zh: "覆盖角色动作与 Foley、地图环境声、点声源衰减与性能优化、Ambisonics 录制后期、合成器水法术、局内交互、商业化 Idleshow、枪械皮肤击杀音效与项目 PV 混音。",
      en: "Covered character motion and Foley, map ambience, point-source attenuation and optimization, Ambisonics post, synthesized water magic, gameplay interaction, commercial Idleshow, weapon-skin kill audio, and PV mixing.",
    },
  },
  {
    title: { zh: "不休的乌拉拉 / 在研 TPS", en: "Ulala / In-Development TPS" },
    meta: { zh: "CRI 集成 · Wwise 集成 · UI / 动作 / 技能", en: "CRI integration · Wwise · UI / action / skill SFX" },
    body: {
      zh: "负责 CRI 工程音频资源管理与优化，制作 UI、动作、时装、过场动画、技能等游戏内音效，并参与 TPS 项目枪械、技能、角色动作声音设计。",
      en: "Handled CRI asset management and optimization, created UI, action, costume, cutscene, and skill SFX, and designed weapon, skill, and character motion audio for TPS work.",
    },
  },
];

export const soundLayers = [
  {
    key: "foley",
    label: { zh: "动作与 Foley", en: "Motion And Foley" },
    description: {
      zh: "角色脚步、衣物摩擦、蹲起、趴下、爬行、攀爬、滑索等动作细节，强调同步、材质与重复触发舒适度。",
      en: "Footsteps, cloth, crouch, prone, crawl, climb, and zipline detail focused on sync, material identity, and repeat comfort.",
    },
    color: "#00FFD1",
  },
  {
    key: "feedback",
    label: { zh: "玩法反馈", en: "Gameplay Feedback" },
    description: {
      zh: "UI、打药、救援、受击、打甲、打肉、碎甲、载具等反馈，目标是短促、清晰、可读。",
      en: "UI, healing, rescue, hit, armor, flesh, break, and vehicle feedback designed to be short, readable, and clear.",
    },
    color: "#36FF7A",
  },
  {
    key: "ambience",
    label: { zh: "环境声与空间音频", en: "Ambience And Spatial Audio" },
    description: {
      zh: "环境底噪、点声源规划、衰减范围、性能优化，以及 Ambisonics 录制、Reaper 与 IEM 后期输出。",
      en: "Ambience beds, point-source planning, attenuation, optimization, Ambisonics capture, and Reaper/IEM post output.",
    },
    color: "#2563EB",
  },
  {
    key: "synthesis",
    label: { zh: "合成器技能音效", en: "Synthesized Skill SFX" },
    description: {
      zh: "用合成器和效果器构建纯合成水法术、技能能量、非现实质感，并整理可复用音效素材。",
      en: "Uses synthesizers and FX to build synthetic water magic, skill energy, stylized textures, and reusable SFX assets.",
    },
    color: "#FFD60A",
  },
  {
    key: "commercial",
    label: { zh: "商业化展示", en: "Monetization Showcase" },
    description: {
      zh: "局外角色皮肤 Idleshow、枪械皮肤击杀音效等商业化场景，服务角色展示、皮肤价值感和转化体验。",
      en: "Character-skin Idleshow and weapon-skin kill audio for presentation value and monetization experience.",
    },
    color: "#FF00A8",
  },
  {
    key: "pv",
    label: { zh: "宣发 PV 混音", en: "Promotional PV Mix" },
    description: {
      zh: "负责项目 PV 音效设计、节奏控制、整体混音与最终音频输出，让影像推广更有冲击力。",
      en: "PV sound design, pacing, full mix, and final output for stronger promotional impact.",
    },
    color: "#FF3B30",
  },
];

export const pipeline = [
  { zh: "参考分析", en: "Reference" },
  { zh: "素材采集", en: "Source Capture" },
  { zh: "合成器设计", en: "Synthesis" },
  { zh: "分层剪辑", en: "Layered Editing" },
  { zh: "混音塑形", en: "Mix Shaping" },
  { zh: "中间件集成", en: "Middleware" },
  { zh: "引擎调试", en: "Engine Tuning" },
  { zh: "跑测交付", en: "Playtest Delivery" },
];

export const tools = [
  { name: "REAPER", note: { zh: "剪辑 / 分层 / 混音 / IEM 空间音频", en: "editing / layering / mix / IEM spatial audio" } },
  { name: "Cubase", note: { zh: "音效创作与音乐化处理", en: "sound creation and musical processing" } },
  { name: "Wwise", note: { zh: "UE 项目音频集成与框架", en: "UE implementation and audio framework" } },
  { name: "CRIWARE", note: { zh: "工程接入、资源管理、测试调优", en: "integration, asset management, testing, tuning" } },
  { name: "Unreal Engine", note: { zh: "FPS / TPS 场景音频实现", en: "FPS / TPS in-engine audio implementation" } },
  { name: "Unity", note: { zh: "游戏内音频集成与调试", en: "in-game audio integration and debugging" } },
  { name: "Ambisonics", note: { zh: "空间环境声录制与后期", en: "spatial ambience capture and post" } },
  { name: "Synth / FX", note: { zh: "合成器技能音效与效果器塑形", en: "synthesized skill SFX and FX shaping" } },
];

export const skillGroups = [
  {
    title: { zh: "游戏音效制作", en: "Game SFX Production" },
    description: {
      zh: "动作、技能、UI、战斗反馈、载具、治疗、救援等局内声音设计。",
      en: "Action, skill, UI, combat feedback, vehicle, healing, rescue, and interaction SFX.",
    },
  },
  {
    title: { zh: "Foley 与材质", en: "Foley And Material Detail" },
    description: {
      zh: "脚步、衣物摩擦、角色动作、水声素材与物体交互质感。",
      en: "Footsteps, cloth, character motion, water sources, and object-interaction texture.",
    },
  },
  {
    title: { zh: "音频实现", en: "Audio Implementation" },
    description: {
      zh: "熟悉 Unity 与 UE，具备 Wwise、CRI 工程接入、封装、调试与跑测能力。",
      en: "Unity and UE familiarity with Wwise/CRI integration, packaging, tuning, and playtesting.",
    },
  },
  {
    title: { zh: "空间环境声", en: "Spatial Ambience" },
    description: {
      zh: "地图环境底噪、点声源、衰减规划、Ambisonics 录制与 Reaper/IEM 后期。",
      en: "Map beds, point sources, attenuation planning, Ambisonics capture, and Reaper/IEM post.",
    },
  },
  {
    title: { zh: "宣发与混音", en: "PV And Mixing" },
    description: {
      zh: "项目 PV 音效设计、节奏控制、整体混音与最终音频输出。",
      en: "PV sound design, pacing, full mix, and final audio output.",
    },
  },
  {
    title: { zh: "声音审美与协作", en: "Audio Taste And Collaboration" },
    description: {
      zh: "外包验收、质量文档、跨部门沟通，并长期分析游戏音效体验。",
      en: "Outsource review, QA documentation, cross-team communication, and game-audio analysis.",
    },
  },
];

export const categoryTools: Record<Exclude<CategoryKey, "all">, string[]> = {
  cg: ["REAPER", "Sync", "Cinematic Mix"],
  synthesis: ["Synth", "FX Plugins", "Processing"],
  field: ["Ambisonics", "Reaper", "IEM"],
  farlight: ["UE+Wwise", "Idleshow", "Gameplay Feedback"],
};

export const getLocalized = <T>(value: Localized<T>, lang: Lang) => value[lang] ?? value.en;
