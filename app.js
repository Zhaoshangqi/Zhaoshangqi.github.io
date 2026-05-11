(() => {
  const STORAGE_KEY = "zq-audio-portfolio-works-v2";
  const LAYOUT_KEY = "zq-audio-portfolio-layout-v2";
  const LANG_KEY = "zq-audio-portfolio-lang-v1";
  const DB_NAME = "zq-audio-portfolio-files-v2";
  const DB_VERSION = 1;
  const STORE_NAME = "mediaFiles";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const canvas = document.querySelector("#hero-visual");
  const ctx = canvas ? canvas.getContext("2d", { alpha: true }) : null;
  const workSection = document.querySelector("#work");
  const workGrid = document.querySelector("#work-grid");
  const emptyState = document.querySelector("#empty-state");
  const form = document.querySelector("#work-form");
  const statusEl = document.querySelector("[data-form-status]");
  const submitLabel = document.querySelector("[data-submit-label]");
  const cancelEdit = document.querySelector("[data-cancel-edit]");
  const resetDemo = document.querySelector("[data-reset-demo]");
  const layoutButtons = Array.from(document.querySelectorAll("[data-layout]"));

  let works = [];
  let importedWorks = [];
  let layout = localStorage.getItem(LAYOUT_KEY) || "grid";
  let categoryFilter = localStorage.getItem("zq-audio-portfolio-category-v1") || "all";
  let currentLang = localStorage.getItem(LANG_KEY) || "zh";
  let activeWorkId = "";
  let globalSceneEl;
  let showcaseEl;
  let categoryRailEl;
  let moduleTransitionEl;
  let languageSwitcherEl;
  let audioContext;
  let activeTimeout;
  let currentMedia;
  let objectUrls = [];
  let visualEnergy = 0.15;
  let targetEnergy = 0.15;
  let animationFrame = 0;
  let resizeFrame = 0;
  let lastFrameTime = 0;
  let canvasRunning = false;

  const starterWorks = [
    {
      id: "starter-impact",
      title: "Combat Impact Study",
      category: "Game Audio",
      role: "Sound Design / Layering",
      year: "2026",
      description: "用短瞬态、低频主体和金属刮擦建立近战命中反馈，重点是重量、清晰度和不遮挡台词。",
      tags: ["impact", "weapon", "transient"],
      demoSound: "impact",
      createdAt: 1,
    },
    {
      id: "starter-ui",
      title: "Sci-Fi Interface Pack",
      category: "Gameplay Redesign",
      role: "UI Sound / Interaction",
      year: "2026",
      description: "为确认、切换和解锁状态设计轻量提示音，避免过长尾音造成连续操作疲劳。",
      tags: ["ui", "feedback", "system"],
      demoSound: "ui",
      createdAt: 2,
    },
    {
      id: "starter-ambience",
      title: "Night Facility Ambience",
      category: "Ambience",
      role: "Loop Design / Mix",
      year: "2026",
      description: "低动态空间底噪与周期性细节层，突出场景空气感，同时保持可循环和低疲劳。",
      tags: ["ambience", "loop", "texture"],
      demoSound: "ambience",
      createdAt: 3,
    },
  ];

  const fields = {
    id: document.querySelector("#work-id"),
    title: document.querySelector("#work-title-input"),
    category: document.querySelector("#work-category"),
    role: document.querySelector("#work-role"),
    year: document.querySelector("#work-year"),
    file: document.querySelector("#work-file"),
    description: document.querySelector("#work-description"),
    tags: document.querySelector("#work-tags"),
  };

  const i18n = {
    zh: {
      nav: ["简介", "作品", "编辑", "联系"],
      skip: "跳到作品",
      heroTitle: "面向游戏与影像岗位的声音作品集。",
      heroLead:
        "上传带画面的 Demo Reel、Gameplay Capture 或声音重设计片段。招聘方可以直接看画面、听声音，同时快速读到你的职责、设计思路和项目标签。",
      viewWork: "查看作品",
      uploadVideo: "上传视频",
      workEyebrow: "Selected Work",
      workTitle: "作品展示",
      workLead: "作品顺序和展示排版会保存在当前浏览器。视频作品会直接在卡片中预览播放。",
      layouts: { grid: "画廊", compact: "分类", reel: "大图" },
      reset: "恢复示例",
      all: "全部",
      works: "作品",
      preview: "预览",
      noMedia: "未上传视频",
      addWork: "添加作品",
      saveChanges: "保存修改",
      cancelEdit: "取消编辑",
      moveUp: "上移",
      moveDown: "下移",
      edit: "编辑",
      delete: "删除",
      studioEyebrow: "Portfolio Studio",
      studioTitle: "上传与排版",
      studioLead: "视频和作品信息保存在当前浏览器；发布上线前可替换成真实后端或静态资源路径。",
      form: {
        title: "作品标题 *",
        category: "类别",
        role: "职责 / 项目角色",
        year: "年份",
        file: "作品视频 / 音频",
        description: "作品说明",
        tags: "标签",
      },
      emptyTitle: "还没有作品",
      emptyLead: "添加第一条视频作品后，这里会自动生成可播放的作品卡。",
      emptyCta: "添加作品",
      languageLabel: "语言",
      chinese: "中文",
      english: "English",
      switchToChinese: "切换到中文",
      switchToEnglish: "Switch to English",
      profileEyebrow: "Candidate Snapshot",
      profileTitle: "声音设计不是素材堆叠，而是反馈、情绪和信息密度的控制。",
      profileNotes: [
        {
          title: "求职方向",
          body: "游戏音频设计、影视预告片声音包装、交互产品声音体验。",
        },
        {
          title: "能力关键词",
          body: "Layering、Transient、Loudness、Loop、Implementation、Iteration。",
        },
        {
          title: "作品呈现",
          body: "每个项目保留目标、职责、声音思路和视频片段，方便招聘方快速判断。",
        },
      ],
      contactEyebrow: "Contact",
      contactTitle: "可面试 / 可发测试题 / 可提供分轨说明。",
      contactLead: "把邮箱、简历链接和 Demo Reel 地址替换成你的真实信息即可。",
      updateWork: "更新作品",
      footer: "2026 ZQ Audio Design. Web portfolio for focused listening and recruiter review.",
      title: "ZQ Audio Design | 求职作品集",
      description: "面向游戏、影视和交互产品岗位的音频设计师求职作品集。",
      allWorks: "全部作品",
      untitled: "未命名作品",
      soundDesign: "声音设计",
      noDescription: "暂无说明。",
      importedDescription: "从本地作品文件夹导入。可以在编辑区继续调整项目说明、标签和展示顺序。",
      portfolio: "作品集",
      switchWork: "切换到",
      deleteConfirm: (title) => `删除「${title}」？`,
      statuses: {
        titleRequired: "请填写作品标题。",
        saveFailed: "视频保存失败。可能是文件过大或浏览器本地存储空间不足。",
        updated: "作品已更新。",
        added: "作品已添加。",
        deleted: "作品已删除。",
        restored: "示例作品已恢复。",
        cancelled: "已取消编辑。",
      },
      categoryIntroAll: (count) => `按类型浏览 ${count} 个视频作品。切换分类时，背景会换成该类作品的代表画面。`,
    },
    en: {
      nav: ["Profile", "Work", "Edit", "Contact"],
      skip: "Skip to work",
      heroTitle: "A sound design portfolio for game and cinematic roles.",
      heroLead:
        "Upload video-based demo reels, gameplay captures, and sound redesign clips. Recruiters can watch the picture, hear the work, and quickly understand your role, design thinking, and project tags.",
      viewWork: "View Work",
      uploadVideo: "Upload Video",
      workEyebrow: "Selected Work",
      workTitle: "Portfolio Work",
      workLead: "Order and layout are saved in this browser. Video projects can be previewed directly in the portfolio.",
      layouts: { grid: "Gallery", compact: "Categories", reel: "Large" },
      reset: "Reset Demo",
      all: "All",
      works: "Works",
      preview: "Preview",
      noMedia: "No media uploaded",
      addWork: "Add Work",
      saveChanges: "Save Changes",
      cancelEdit: "Cancel Edit",
      moveUp: "Move Up",
      moveDown: "Move Down",
      edit: "Edit",
      delete: "Delete",
      studioEyebrow: "Portfolio Studio",
      studioTitle: "Upload And Layout",
      studioLead: "Videos and metadata are saved in this browser. Before publishing, these can be moved to a real backend or static asset pipeline.",
      form: {
        title: "Project Title *",
        category: "Category",
        role: "Role / Responsibility",
        year: "Year",
        file: "Project Video / Audio",
        description: "Project Notes",
        tags: "Tags",
      },
      emptyTitle: "No work yet",
      emptyLead: "Add your first video project and this area will generate playable portfolio cards.",
      emptyCta: "Add Work",
      languageLabel: "Language",
      chinese: "中文",
      english: "English",
      switchToChinese: "切换到中文",
      switchToEnglish: "Switch to English",
      profileEyebrow: "Candidate Snapshot",
      profileTitle: "Sound design is not asset stacking. It is control over feedback, emotion, and information density.",
      profileNotes: [
        {
          title: "Target Roles",
          body: "Game audio design, cinematic trailer sound packaging, and interactive product audio experiences.",
        },
        {
          title: "Core Skills",
          body: "Layering, transient design, loudness control, loop craft, implementation, and iteration.",
        },
        {
          title: "Presentation",
          body: "Each project keeps its goal, responsibility, sound-design thinking, and video clip visible for fast recruiter review.",
        },
      ],
      contactEyebrow: "Contact",
      contactTitle: "Available for interviews, audio tests, and stem breakdowns.",
      contactLead: "Replace the email, resume link, and demo reel URL with your real contact information.",
      updateWork: "Update Work",
      footer: "2026 ZQ Audio Design. Web portfolio for focused listening and recruiter review.",
      title: "ZQ Audio Design | Job Portfolio",
      description: "A job-focused audio designer portfolio for game, film, and interactive product roles.",
      allWorks: "All Works",
      untitled: "Untitled Work",
      soundDesign: "Sound Design",
      noDescription: "No project notes yet.",
      importedDescription: "Imported from the local portfolio folder. Use the editor to refine the project notes, tags, and display order.",
      portfolio: "Portfolio",
      switchWork: "Switch to",
      deleteConfirm: (title) => `Delete "${title}"?`,
      statuses: {
        titleRequired: "Please enter a project title.",
        saveFailed: "Video save failed. The file may be too large or browser storage may be full.",
        updated: "Work updated.",
        added: "Work added.",
        deleted: "Work deleted.",
        restored: "Demo work restored.",
        cancelled: "Edit cancelled.",
      },
      categoryIntroAll: (count) => `Browse ${count} video works by category. When a category changes, the full-page background switches to that category's representative visual.`,
    },
  };

  const workTranslations = {
    "source-01": { title: "Water SFX Layering Process", role: "Sound Design Process / Material Editing" },
    "source-02": { title: "Beyond Good & Evil 2 Sound Redesign", role: "Sound Redesign / Mix" },
    "source-03": { title: "Healing Item Sound Feedback", role: "Sound Design / Editing / Mix" },
    "source-04": { title: "Seaside Field Recording Ambience", role: "Field Recording / Ambience Design" },
    "source-05": { title: "Water SFX Synthesis Process", role: "Sound Design Process / Material Editing" },
    "source-06": { title: "Water SFX Redesign Reel", role: "Sound Redesign / Mix" },
    "source-07": { title: "Fire SFX Synthesis Process", role: "Sound Design / Editing / Mix" },
    "source-08": { title: "Idle Show Character SFX 01", role: "Sound Redesign / Mix" },
    "source-09": { title: "Idle Show Character SFX 02", role: "Sound Redesign / Mix" },
    "source-10": { title: "Cinematic Opening Sound Redesign", role: "Sound Redesign / Mix" },
    "source-11": { title: "Nora Idle Show SFX", role: "Sound Redesign / Mix" },
    "source-12": { title: "Tao Idle Show SFX", role: "Sound Redesign / Mix" },
    "source-13": { title: "Ambisonic Ambience Field Recording", role: "Field Recording / Ambience Design" },
  };

  if (!i18n[currentLang]) {
    currentLang = "zh";
  }

  const t = (key) => i18n[currentLang][key];

  const uid = () => {
    if (window.crypto?.randomUUID) {
      return window.crypto.randomUUID();
    }

    return `work-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  };

  const setStatus = (message, tone = "normal") => {
    if (!statusEl) {
      return;
    }

    statusEl.textContent = message;
    statusEl.dataset.tone = tone;
  };

  const cloneWorks = (items) =>
    items.map((item) => ({
      ...item,
      tags: Array.isArray(item.tags) ? [...item.tags] : [],
    }));

  const defaultWorks = () => cloneWorks(importedWorks.length ? importedWorks : starterWorks);

  const assetPath = (path) => {
    if (!path || /^(?:[a-z]+:|data:|blob:)/i.test(path)) {
      return path || "";
    }

    return new URL(path.replace(/^\/+/, ""), document.baseURI).href;
  };

  const loadImportedWorks = async () => {
    try {
      const response = await fetch(assetPath("data/works.json"), { cache: "no-store" });
      if (!response.ok) {
        return;
      }
      const data = await response.json();
      if (Array.isArray(data) && data.length) {
        importedWorks = data;
      }
    } catch {
      importedWorks = [];
    }
  };

  const saveWorks = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(works));
  };

  const loadWorks = () => {
    const raw = localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      works = defaultWorks();
      saveWorks();
      return;
    }

    try {
      const parsed = JSON.parse(raw);
      works = Array.isArray(parsed) ? parsed : defaultWorks();
    } catch {
      works = defaultWorks();
    }
  };

  const openDb = () =>
    new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id" });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

  const withStore = async (mode, callback) => {
    const db = await openDb();

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, mode);
      const store = tx.objectStore(STORE_NAME);
      const result = callback(store);

      tx.oncomplete = () => {
        db.close();
        resolve(result);
      };
      tx.onerror = () => {
        db.close();
        reject(tx.error);
      };
    });
  };

  const saveFile = (id, file) =>
    withStore("readwrite", (store) => {
      store.put({
        id,
        blob: file,
        name: file.name,
        type: file.type,
        updatedAt: Date.now(),
      });
    });

  const getFile = (id) =>
    new Promise(async (resolve) => {
      try {
        const db = await openDb();
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const request = store.get(id);
        request.onsuccess = () => {
          db.close();
          resolve(request.result || null);
        };
        request.onerror = () => {
          db.close();
          resolve(null);
        };
      } catch {
        resolve(null);
      }
    });

  const deleteFile = (id) =>
    withStore("readwrite", (store) => {
      store.delete(id);
    });

  const clearObjectUrls = () => {
    objectUrls.forEach((url) => URL.revokeObjectURL(url));
    objectUrls = [];
  };

  const makeEl = (tag, className, text) => {
    const el = document.createElement(tag);
    if (className) {
      el.className = className;
    }
    if (text) {
      el.textContent = text;
    }
    return el;
  };

  const setText = (selector, value) => {
    const element = document.querySelector(selector);
    if (element) {
      element.textContent = value;
    }
  };

  const setAllText = (selector, values) => {
    document.querySelectorAll(selector).forEach((element, index) => {
      if (values[index]) {
        element.textContent = values[index];
      }
    });
  };

  const ensureLanguageSwitcher = () => {
    if (languageSwitcherEl) {
      return;
    }

    const header = document.querySelector(".site-header");
    if (!header) {
      return;
    }

    languageSwitcherEl = makeEl("div", "language-switcher");
    languageSwitcherEl.setAttribute("role", "group");

    [
      ["zh", "中"],
      ["en", "EN"],
    ].forEach(([lang, label]) => {
      const button = makeEl("button", "lang-button", label);
      button.type = "button";
      button.dataset.lang = lang;
      languageSwitcherEl.append(button);
    });

    header.append(languageSwitcherEl);
  };

  const updateLanguageSwitcher = () => {
    if (!languageSwitcherEl) {
      return;
    }

    languageSwitcherEl.setAttribute("aria-label", t("languageLabel"));
    languageSwitcherEl.querySelectorAll(".lang-button").forEach((button) => {
      const lang = button.dataset.lang;
      button.setAttribute("aria-pressed", String(lang === currentLang));
      button.setAttribute("aria-label", lang === "zh" ? t("switchToChinese") : t("switchToEnglish"));
      button.title = lang === "zh" ? t("chinese") : t("english");
    });
  };

  const applyLanguage = () => {
    ensureLanguageSwitcher();

    document.documentElement.lang = currentLang === "en" ? "en" : "zh-CN";
    document.title = t("title");

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", t("description"));
    }

    setText(".skip-link", t("skip"));
    setAllText(".nav-links a", t("nav"));
    setText("#hero-title", t("heroTitle"));
    setText(".hero-lede", t("heroLead"));
    setAllText(".hero-actions .button", [t("viewWork"), t("uploadVideo")]);

    setText("#work .section-heading > .eyebrow", t("workEyebrow"));
    setText("#work-title", t("workTitle"));
    setText("#work .section-heading > p:not(.eyebrow)", t("workLead"));
    if (resetDemo) {
      resetDemo.textContent = t("reset");
    }

    setText("#empty-state h3", t("emptyTitle"));
    setText("#empty-state p", t("emptyLead"));
    setText("#empty-state .button", t("emptyCta"));

    setText("#studio .section-heading > .eyebrow", t("studioEyebrow"));
    setText("#studio-title", t("studioTitle"));
    setText("#studio .section-heading > p:not(.eyebrow)", t("studioLead"));
    const formText = t("form");
    setAllText("#work-form label > span", [
      formText.title,
      formText.category,
      formText.role,
      formText.year,
      formText.file,
      formText.description,
      formText.tags,
    ]);
    if (submitLabel) {
      submitLabel.textContent = fields.id?.value ? t("saveChanges") : t("addWork");
    }
    if (cancelEdit) {
      cancelEdit.textContent = t("cancelEdit");
    }

    setText("#profile .section-heading > .eyebrow", t("profileEyebrow"));
    setText("#profile-title", t("profileTitle"));
    setAllText(".profile-note h3", t("profileNotes").map((note) => note.title));
    setAllText(".profile-note p", t("profileNotes").map((note) => note.body));

    setText("#contact .contact-copy > .eyebrow", t("contactEyebrow"));
    setText("#contact-title", t("contactTitle"));
    setText("#contact .contact-copy > p:not(.eyebrow)", t("contactLead"));
    setText(".contact-actions .button-ghost", t("updateWork"));
    setText(".site-footer p", `© ${t("footer")}`);

    ensureWorkInterface();
    updateLanguageSwitcher();
  };

  const displayTitle = (work) =>
    currentLang === "en" ? workTranslations[work.id]?.title || work.title || t("untitled") : work.title || t("untitled");

  const displayRole = (work) =>
    currentLang === "en" ? workTranslations[work.id]?.role || work.role || t("soundDesign") : work.role || t("soundDesign");

  const displayDescription = (work) => {
    if (currentLang === "en" && work.id?.startsWith("source-")) {
      return t("importedDescription");
    }
    return work.description || t("noDescription");
  };

  const tagsFromText = (value) =>
    value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
      .slice(0, 6);

  const buildTags = (tags) => {
    const list = makeEl("ul", "tag-list");
    (tags || []).forEach((tag) => {
      list.append(makeEl("li", "", tag));
    });
    return list;
  };

  const categoryName = (work) => work.category || "Other";

  const categoryLabel = (name) => {
    const labels = currentLang === "en" ? {
      "Character Showcase": "Idle Show",
      "Foley / Water": "Synthesized SFX / Water",
      Elemental: "Elemental Synthesis",
      Ambience: "Field Ambience",
      Cinematic: "Cinematic SFX",
      "Sound Redesign": "Sound Redesign",
      "Gameplay Feedback": "Gameplay Feedback",
    } : {
      "Character Showcase": "Idle Show",
      "Foley / Water": "合成音效 / Water",
      Elemental: "元素合成",
      Ambience: "环境实录",
      Cinematic: "影视声效",
      "Sound Redesign": "声音重设计",
      "Gameplay Feedback": "游戏反馈",
    };
    return labels[name] || name || (currentLang === "en" ? "Other" : "其他");
  };

  const categoryIntro = (name, count) => {
    if (name === "all") {
      return t("categoryIntroAll")(count);
    }
    if (currentLang === "en") {
      if (name === "Character Showcase") {
        return "Idle Show works focus on character presentation, timing, movement accents, and synchronized feedback.";
      }
      if (name === "Foley / Water") {
        return "Synthesized SFX works use DAW and material-editing visuals as the moving background, emphasizing layers, source choices, and process.";
      }
      if (name === "Ambience") {
        return "Ambience works highlight space, evolving beds, field recordings, and loop control.";
      }
      return "This category uses a representative frame as the full-page motion background and keeps the related videos below.";
    }
    if (name === "Character Showcase") {
      return "Idle Show 类作品集中展示角色待机、动作展示和同步反馈，适合快速判断角色声效质感。";
    }
    if (name === "Foley / Water") {
      return "合成音效类使用工程界面和素材处理画面作为动态背景，强调声音层次、素材选择与制作过程。";
    }
    if (name === "Ambience") {
      return "环境类作品突出空间、动态底噪和可循环氛围，适合展示场景声音控制能力。";
    }
    return "这一类作品使用代表画面作为全屏动态背景，并在下方保留具体视频条目。";
  };

  const visibleWorks = () =>
    categoryFilter === "all" ? works : works.filter((work) => categoryName(work) === categoryFilter);

  const categories = () => {
    const grouped = new Map();
    works.forEach((work) => {
      const name = categoryName(work);
      grouped.set(name, (grouped.get(name) || 0) + 1);
    });
    return Array.from(grouped, ([name, count]) => ({ name, count }));
  };

  const categoryOrder = () => ["all", ...categories().map(({ name }) => name)];

  const ensureGlobalScene = () => {
    if (!globalSceneEl) {
      globalSceneEl = makeEl("div", "global-scene-bg");
      globalSceneEl.setAttribute("aria-hidden", "true");
      document.body.prepend(globalSceneEl);
    }

    if (!moduleTransitionEl) {
      moduleTransitionEl = makeEl("div", "module-transition");
      moduleTransitionEl.setAttribute("aria-hidden", "true");
      document.body.append(moduleTransitionEl);
    }
  };

  const setGlobalScene = (mediaData, direction = "next") => {
    ensureGlobalScene();

    if (!mediaData?.posterUrl && !mediaData?.url) {
      return;
    }

    const layer = makeEl("div", "global-scene-layer is-incoming");
    layer.dataset.direction = direction;

    if (mediaData.posterUrl) {
      const image = document.createElement("img");
      image.src = mediaData.posterUrl;
      image.alt = "";
      layer.append(image);
    } else if (mediaData.isVideo) {
      const video = document.createElement("video");
      video.src = mediaData.url;
      video.autoplay = true;
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      layer.append(video);
    }

    const previousLayers = Array.from(globalSceneEl.querySelectorAll(".global-scene-layer"));
    previousLayers.forEach((item) => {
      item.classList.remove("is-incoming");
      item.classList.add("is-outgoing");
      item.dataset.direction = direction;
    });
    globalSceneEl.append(layer);
    window.setTimeout(() => {
      previousLayers.forEach((item) => item.remove());
      layer.classList.remove("is-incoming");
    }, 980);
  };

  const playModuleTransition = (direction) => {
    ensureGlobalScene();
    document.body.dataset.moduleDirection = direction;
    document.body.classList.remove("is-module-switching");
    void document.body.offsetWidth;
    document.body.classList.add("is-module-switching");
    window.setTimeout(() => {
      document.body.classList.remove("is-module-switching");
      delete document.body.dataset.moduleDirection;
    }, 920);
  };

  const ensureWorkInterface = () => {
    if (!workSection || !workGrid) {
      return;
    }

    if (!categoryRailEl) {
      categoryRailEl = makeEl("div", "category-rail reveal is-visible");
      const toolbar = workSection.querySelector(".layout-toolbar");
      workSection.insertBefore(categoryRailEl, toolbar || workGrid);
    }
    categoryRailEl.setAttribute("aria-label", currentLang === "en" ? "Work category filter" : "作品分类筛选");

    if (!showcaseEl) {
      showcaseEl = makeEl("div", "work-showcase reveal is-visible");
      showcaseEl.id = "work-showcase";
      workSection.insertBefore(showcaseEl, workGrid);
    }
    showcaseEl.setAttribute("aria-live", "polite");

    layoutButtons.forEach((button) => {
      if (t("layouts")[button.dataset.layout]) {
        button.textContent = t("layouts")[button.dataset.layout];
      }
    });
  };

  const renderCategories = () => {
    if (!categoryRailEl) {
      return;
    }

    categoryRailEl.replaceChildren();
    const allButton = makeEl("button", "category-chip", `${t("all")} ${works.length}`);
    allButton.type = "button";
    allButton.dataset.category = "all";
    allButton.setAttribute("aria-pressed", String(categoryFilter === "all"));
    categoryRailEl.append(allButton);

    categories().forEach(({ name, count }) => {
      const button = makeEl("button", "category-chip", `${categoryLabel(name)} ${count}`);
      button.type = "button";
      button.dataset.category = name;
      button.setAttribute("aria-pressed", String(categoryFilter === name));
      categoryRailEl.append(button);
    });
  };

  const resolveMedia = async (work) => {
    const fileRecord = work.fileId ? await getFile(work.fileId) : null;

    if (fileRecord?.blob) {
      const url = URL.createObjectURL(fileRecord.blob);
      objectUrls.push(url);
      const type = fileRecord.type || work.fileType || "";
      const name = fileRecord.name || work.fileName || "Uploaded media";
      return {
        url,
        name,
        type,
        isVideo: type.startsWith("video/") || /\.(mp4|webm|mov|m4v|ogv)$/i.test(name),
        posterUrl: work.posterUrl || "",
        source: "upload",
      };
    }

    if (work.mediaUrl) {
      const type = work.fileType || "";
      const name = work.fileName || work.mediaUrl.split("/").pop() || "Portfolio media";
      return {
        url: assetPath(work.mediaUrl),
        name,
        type,
        isVideo: type.startsWith("video/") || /\.(mp4|webm|mov|m4v|ogv)$/i.test(work.mediaUrl),
        posterUrl: assetPath(work.posterUrl || ""),
        source: "static",
      };
    }

    return null;
  };

  const bindMediaState = (media, article, work) => {
    media.addEventListener("play", () => {
      if (currentMedia && currentMedia !== media) {
        currentMedia.pause();
      }
      currentMedia = media;
      document.body.classList.add("is-playing");
      targetEnergy = 0.72;
      document.querySelectorAll(".work-card").forEach((card) => {
        card.classList.toggle("is-playing", card.dataset.id === work.id);
      });
      if (article) {
        article.classList.add("is-playing");
      }
    });
    media.addEventListener("pause", () => {
      document.body.classList.remove("is-playing");
      targetEnergy = 0.15;
      if (article) {
        article.classList.remove("is-playing");
      }
    });
    media.addEventListener("ended", () => {
      document.body.classList.remove("is-playing");
      targetEnergy = 0.15;
      if (article) {
        article.classList.remove("is-playing");
      }
    });
  };

  const renderCategoryShowcase = async (items) => {
    if (!showcaseEl) {
      return;
    }

    showcaseEl.replaceChildren();
    const active = items.find((work) => work.id === activeWorkId) || items[0];
    showcaseEl.hidden = !active;

    if (!active) {
      return;
    }

    activeWorkId = active.id;
    const mediaData = await resolveMedia(active);
    setGlobalScene(mediaData, workSection?.dataset.switchDirection || "next");
    const categoryItems = categoryFilter === "all"
      ? items
      : works.filter((work) => categoryName(work) === categoryFilter);
    const sceneName = categoryFilter === "all" ? t("allWorks") : categoryLabel(categoryFilter);

    const panel = makeEl("article", "showcase-panel category-scene");
    panel.dataset.id = active.id;
    panel.dataset.category = categoryFilter;

    const background = makeEl("div", "showcase-bg");
    if (mediaData?.posterUrl) {
      const bg = document.createElement("img");
      bg.className = "showcase-bg-media";
      bg.src = mediaData.posterUrl;
      bg.alt = "";
      background.append(bg);
    } else if (mediaData?.isVideo) {
      const bg = document.createElement("video");
      bg.className = "showcase-bg-media";
      bg.src = mediaData.url;
      bg.autoplay = true;
      bg.muted = true;
      bg.loop = true;
      bg.playsInline = true;
      background.append(bg);
    }

    const details = makeEl("div", "showcase-details");
    details.append(makeEl("p", "showcase-kicker", `${sceneName} / ${categoryItems.length} ${t("works")}`));
    details.append(makeEl("h3", "", sceneName));
    details.append(makeEl("p", "showcase-copy", categoryIntro(categoryFilter, items.length)));
    details.append(buildTags(active.tags || []));

    const stats = makeEl("div", "showcase-stats");
    stats.append(makeEl("span", "", displayTitle(active)));
    stats.append(makeEl("span", "", displayRole(active)));
    details.append(stats);

    const mediaFrame = makeEl("div", "showcase-media-frame");
    if (mediaData?.isVideo) {
      const media = document.createElement("video");
      media.className = "showcase-video";
      media.controls = true;
      media.autoplay = true;
      media.muted = true;
      media.loop = true;
      media.playsInline = true;
      media.preload = "metadata";
      media.src = mediaData.url;
      if (mediaData.posterUrl) {
        media.poster = mediaData.posterUrl;
      }
      bindMediaState(media, null, active);
      mediaFrame.append(media);
    } else if (mediaData?.url) {
      const media = document.createElement("audio");
      media.className = "showcase-audio";
      media.controls = true;
      media.preload = "metadata";
      media.src = mediaData.url;
      bindMediaState(media, null, active);
      mediaFrame.append(media);
    }

    const reel = makeEl("div", "scene-reel");
    categoryItems.slice(0, 6).forEach((work) => {
      const thumb = makeEl("button", "scene-thumb", "");
      thumb.type = "button";
      thumb.dataset.workId = work.id;
      thumb.setAttribute("aria-label", `${t("switchWork")} ${displayTitle(work)}`);
      if (work.posterUrl) {
        const image = document.createElement("img");
        image.src = work.posterUrl;
        image.alt = "";
        thumb.append(image);
      }
      thumb.append(makeEl("span", "", displayTitle(work)));
      thumb.setAttribute("aria-pressed", String(work.id === active.id));
      reel.append(thumb);
    });

    panel.append(background, details, mediaFrame, reel);
    showcaseEl.append(panel);
  };

  const renderShowcase = async (items) => {
    return renderCategoryShowcase(items);

    if (!showcaseEl) {
      return;
    }

    showcaseEl.replaceChildren();
    const active = items.find((work) => work.id === activeWorkId) || items[0];
    showcaseEl.hidden = !active;

    if (!active) {
      return;
    }

    activeWorkId = active.id;
    const mediaData = await resolveMedia(active);
    const panel = makeEl("article", "showcase-panel");
    panel.dataset.id = active.id;

    const mediaFrame = makeEl("div", "showcase-media-frame");
    if (mediaData?.isVideo) {
      const media = document.createElement("video");
      media.className = "showcase-video";
      media.controls = true;
      media.autoplay = true;
      media.muted = true;
      media.loop = true;
      media.playsInline = true;
      media.preload = "metadata";
      media.src = mediaData.url;
      if (mediaData.posterUrl) {
        media.poster = mediaData.posterUrl;
      }
      bindMediaState(media, null, active);
      mediaFrame.append(media);
    } else if (mediaData?.url) {
      const media = document.createElement("audio");
      media.className = "showcase-audio";
      media.controls = true;
      media.preload = "metadata";
      media.src = mediaData.url;
      bindMediaState(media, null, active);
      mediaFrame.append(media);
    } else {
      mediaFrame.append(makeEl("div", "showcase-placeholder", "No media"));
    }

    const details = makeEl("div", "showcase-details");
    details.append(makeEl("p", "showcase-kicker", `${categoryName(active)} / ${active.year || "Portfolio"}`));
    details.append(makeEl("h3", "", active.title || "Untitled Work"));
    details.append(makeEl("p", "showcase-copy", active.description || "暂无说明。"));
    details.append(buildTags(active.tags || []));

    const stats = makeEl("div", "showcase-stats");
    stats.append(makeEl("span", "", active.role || "Sound Design"));
    stats.append(makeEl("span", "", mediaData?.name || "Portfolio media"));
    details.append(stats);

    panel.append(mediaFrame, details);
    showcaseEl.append(panel);
  };

  const selectWork = async (id) => {
    activeWorkId = id;
    await renderWorks();
    showcaseEl?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const updateLayout = (nextLayout) => {
    layout = ["grid", "compact", "reel"].includes(nextLayout) ? nextLayout : "grid";
    localStorage.setItem(LAYOUT_KEY, layout);
    workGrid.className = `work-grid layout-${layout}`;
    layoutButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.layout === layout));
    });
  };

  const ensureAudio = async () => {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }

    return audioContext;
  };

  const scheduleTone = (context, options) => {
    const {
      type = "sine",
      frequency = 220,
      endFrequency,
      start = 0,
      duration = 0.4,
      gain = 0.22,
      destination,
    } = options;
    const now = context.currentTime + start;
    const osc = context.createOscillator();
    const amp = context.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, now);

    if (endFrequency) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFrequency), now + duration);
    }

    amp.gain.setValueAtTime(0.0001, now);
    amp.gain.exponentialRampToValueAtTime(gain, now + 0.02);
    amp.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(amp);
    amp.connect(destination || context.destination);
    osc.start(now);
    osc.stop(now + duration + 0.03);
  };

  const makeNoise = (context, duration) => {
    const bufferSize = Math.max(1, Math.floor(context.sampleRate * duration));
    const buffer = context.createBuffer(1, bufferSize, context.sampleRate);
    const data = buffer.getChannelData(0);

    for (let index = 0; index < bufferSize; index += 1) {
      data[index] = Math.random() * 2 - 1;
    }

    const source = context.createBufferSource();
    source.buffer = buffer;
    return source;
  };

  const makeGain = (context, peak = 0.32) => {
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(peak, context.currentTime + 0.018);
    gain.connect(context.destination);
    return gain;
  };

  const playDemoSound = async (kind, id) => {
    const context = await ensureAudio();
    const master = makeGain(context, 0.34);
    document.body.classList.add("is-playing");
    targetEnergy = 0.86;
    clearTimeout(activeTimeout);
    document.querySelectorAll(".work-card").forEach((card) => {
      card.classList.toggle("is-playing", card.dataset.id === id);
    });

    if (kind === "impact") {
      master.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.82);
      scheduleTone(context, { frequency: 90, endFrequency: 38, duration: 0.58, gain: 0.9, destination: master });
      const noise = makeNoise(context, 0.18);
      const filter = context.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 2600;
      filter.Q.value = 5;
      noise.connect(filter);
      filter.connect(master);
      noise.start();
      noise.stop(context.currentTime + 0.18);
    } else if (kind === "ui") {
      master.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.9);
      [740, 960, 1240, 1640].forEach((frequency, index) => {
        scheduleTone(context, { frequency, duration: 0.12, start: index * 0.09, gain: 0.18, destination: master });
      });
    } else {
      const filter = context.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 900;
      const noise = makeNoise(context, 2.2);
      noise.connect(filter);
      filter.connect(master);
      master.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 2.35);
      noise.start();
      noise.stop(context.currentTime + 2.2);
      scheduleTone(context, { frequency: 164, endFrequency: 174, duration: 2.2, gain: 0.08, destination: master });
    }

    activeTimeout = window.setTimeout(() => {
      document.body.classList.remove("is-playing");
      targetEnergy = 0.15;
      document.querySelectorAll(".work-card").forEach((card) => card.classList.remove("is-playing"));
    }, kind === "ambience" ? 2350 : 1400);
  };

  const renderWorkCardGallery = async (work) => {
    const article = makeEl("article", "work-card reveal is-visible");
    article.dataset.id = work.id;
    article.classList.toggle("is-active", work.id === activeWorkId);

    const mediaData = await resolveMedia(work);
    const poster = makeEl("div", "work-poster");
    const select = makeEl("button", "poster-select", "");
    select.type = "button";
    select.dataset.action = "select";
    select.setAttribute("aria-label", `${t("preview")} ${displayTitle(work)}`);

    if (mediaData?.posterUrl) {
      const image = document.createElement("img");
      image.className = "work-poster-image";
      image.src = mediaData.posterUrl;
      image.alt = "";
      image.loading = "lazy";
      select.append(image);
    } else if (mediaData?.isVideo) {
      const media = document.createElement("video");
      media.className = "work-thumb-video";
      media.muted = true;
      media.loop = true;
      media.playsInline = true;
      media.preload = "metadata";
      media.src = mediaData.url;
      select.append(media);
    } else {
      select.append(makeEl("span", "poster-placeholder", "Audio"));
    }

    select.append(makeEl("span", "poster-overlay", t("preview")));
    poster.append(select);

    const content = makeEl("div", "card-content");
    const meta = makeEl("div", "work-meta");
    meta.append(makeEl("span", "", categoryLabel(categoryName(work))));
    meta.append(makeEl("span", "", work.year || t("portfolio")));
    content.append(meta);
    content.append(makeEl("h3", "", displayTitle(work)));
    content.append(makeEl("p", "", displayDescription(work)));
    content.append(buildTags(work.tags || []));

    const actions = makeEl("div", "card-actions");
    const moveActions = makeEl("div", "move-actions");
    const editActions = makeEl("div", "edit-actions");

    const up = makeEl("button", "icon-button", t("moveUp"));
    up.type = "button";
    up.dataset.action = "up";
    up.disabled = works.indexOf(work) === 0;
    up.setAttribute("aria-label", `${t("moveUp")} ${displayTitle(work)}`);

    const down = makeEl("button", "icon-button", t("moveDown"));
    down.type = "button";
    down.dataset.action = "down";
    down.disabled = works.indexOf(work) === works.length - 1;
    down.setAttribute("aria-label", `${t("moveDown")} ${displayTitle(work)}`);

    const edit = makeEl("button", "icon-button", t("edit"));
    edit.type = "button";
    edit.dataset.action = "edit";
    edit.setAttribute("aria-label", `${t("edit")} ${displayTitle(work)}`);

    const remove = makeEl("button", "icon-button danger", t("delete"));
    remove.type = "button";
    remove.dataset.action = "delete";
    remove.setAttribute("aria-label", `${t("delete")} ${displayTitle(work)}`);

    moveActions.append(up, down);
    editActions.append(edit, remove);
    actions.append(moveActions, editActions);
    article.append(poster, content, actions);
    return article;
  };

  const renderWorksGallery = async () => {
    ensureWorkInterface();
    clearObjectUrls();
    workGrid.replaceChildren();
    renderCategories();

    const items = visibleWorks();
    emptyState.hidden = works.length > 0 && items.length > 0;
    await renderShowcase(items);

    if (!items.length) {
      return;
    }

    if (layout === "compact" && categoryFilter === "all") {
      const groups = new Map();
      items.forEach((work) => {
        const name = categoryName(work);
        if (!groups.has(name)) {
          groups.set(name, []);
        }
        groups.get(name).push(work);
      });

      for (const [name, groupItems] of groups) {
        const group = makeEl("section", "category-group");
        const header = makeEl("div", "category-group-header");
        header.append(makeEl("h3", "", categoryLabel(name)));
        header.append(makeEl("span", "", `${groupItems.length} ${t("works")}`));
        const grid = makeEl("div", "category-group-grid");
        for (const work of groupItems) {
          grid.append(await renderWorkCardGallery(work));
        }
        group.append(header, grid);
        workGrid.append(group);
      }
      return;
    }

    for (const work of items) {
      workGrid.append(await renderWorkCardGallery(work));
    }
  };

  const renderWorks = async () => {
    return renderWorksGallery();

    clearObjectUrls();
    workGrid.replaceChildren();
    emptyState.hidden = works.length > 0;

    for (const work of works) {
      const article = makeEl("article", "work-card reveal is-visible");
      article.dataset.id = work.id;

      const content = makeEl("div", "card-content");
      const meta = makeEl("div", "work-meta");
      meta.append(makeEl("span", "", work.category || "Media"));
      meta.append(makeEl("span", "", work.year || "Portfolio"));
      content.append(meta);
      content.append(makeEl("h3", "", work.title || "Untitled Work"));
      content.append(makeEl("p", "", work.description || "暂无说明。"));
      content.append(buildTags(work.tags || []));

      const mediaSlot = makeEl("div", "media-slot");
      const fileRecord = work.fileId ? await getFile(work.fileId) : null;

      if (fileRecord?.blob) {
        const url = URL.createObjectURL(fileRecord.blob);
        objectUrls.push(url);
        const fileType = fileRecord.type || work.fileType || "";
        const fileName = fileRecord.name || work.fileName || "Uploaded media";
        const isVideo = fileType.startsWith("video/") || /\.(mp4|webm|mov|m4v|ogv)$/i.test(fileName);
        const label = makeEl("span", "card-label", fileName);
        const media = document.createElement(isVideo ? "video" : "audio");
        media.className = "media-player";
        media.controls = true;
        media.preload = "metadata";
        media.src = url;

        if (isVideo) {
          media.playsInline = true;
        }

        media.addEventListener("play", () => {
          if (currentMedia && currentMedia !== media) {
            currentMedia.pause();
          }
          currentMedia = media;
          document.body.classList.add("is-playing");
          targetEnergy = 0.72;
          document.querySelectorAll(".work-card").forEach((card) => {
            card.classList.toggle("is-playing", card.dataset.id === work.id);
          });
        });
        media.addEventListener("pause", () => {
          document.body.classList.remove("is-playing");
          targetEnergy = 0.15;
          article.classList.remove("is-playing");
        });
        media.addEventListener("ended", () => {
          document.body.classList.remove("is-playing");
          targetEnergy = 0.15;
          article.classList.remove("is-playing");
        });
        mediaSlot.append(label, media);
      } else if (work.mediaUrl) {
        const fileType = work.fileType || "";
        const fileName = work.fileName || work.mediaUrl.split("/").pop() || "Portfolio media";
        const isVideo = fileType.startsWith("video/") || /\.(mp4|webm|mov|m4v|ogv)$/i.test(work.mediaUrl);
        const label = makeEl("span", "card-label", fileName);
        const media = document.createElement(isVideo ? "video" : "audio");
        media.className = "media-player";
        media.controls = true;
        media.preload = "metadata";
        media.src = work.mediaUrl;

        if (isVideo) {
          media.playsInline = true;
          if (work.posterUrl) {
            media.poster = work.posterUrl;
          }
        }

        media.addEventListener("play", () => {
          if (currentMedia && currentMedia !== media) {
            currentMedia.pause();
          }
          currentMedia = media;
          document.body.classList.add("is-playing");
          targetEnergy = 0.72;
          document.querySelectorAll(".work-card").forEach((card) => {
            card.classList.toggle("is-playing", card.dataset.id === work.id);
          });
        });
        media.addEventListener("pause", () => {
          document.body.classList.remove("is-playing");
          targetEnergy = 0.15;
          article.classList.remove("is-playing");
        });
        media.addEventListener("ended", () => {
          document.body.classList.remove("is-playing");
          targetEnergy = 0.15;
          article.classList.remove("is-playing");
        });
        mediaSlot.append(label, media);
      } else if (work.demoSound) {
        const button = makeEl("button", "demo-button", "播放示例声音");
        button.type = "button";
        button.dataset.demoSound = work.demoSound;
        button.dataset.id = work.id;
        mediaSlot.append(button);
      } else {
        mediaSlot.append(makeEl("span", "card-label", "未上传视频"));
      }

      const actions = makeEl("div", "card-actions");
      const moveActions = makeEl("div", "move-actions");
      const editActions = makeEl("div", "edit-actions");

      const up = makeEl("button", "icon-button", "上移");
      up.type = "button";
      up.dataset.action = "up";
      up.disabled = works.indexOf(work) === 0;
      up.setAttribute("aria-label", `上移 ${work.title}`);

      const down = makeEl("button", "icon-button", "下移");
      down.type = "button";
      down.dataset.action = "down";
      down.disabled = works.indexOf(work) === works.length - 1;
      down.setAttribute("aria-label", `下移 ${work.title}`);

      const edit = makeEl("button", "icon-button", "编辑");
      edit.type = "button";
      edit.dataset.action = "edit";
      edit.setAttribute("aria-label", `编辑 ${work.title}`);

      const remove = makeEl("button", "icon-button danger", "删除");
      remove.type = "button";
      remove.dataset.action = "delete";
      remove.setAttribute("aria-label", `删除 ${work.title}`);

      moveActions.append(up, down);
      editActions.append(edit, remove);
      actions.append(moveActions, editActions);
      article.append(content, mediaSlot, actions);
      workGrid.append(article);
    }
  };

  const resetForm = () => {
    form.reset();
    fields.id.value = "";
    submitLabel.textContent = t("addWork");
    cancelEdit.hidden = true;
  };

  const fillForm = (work) => {
    fields.id.value = work.id;
    fields.title.value = work.title || "";
    fields.category.value = work.category || "Other";
    fields.role.value = work.role || "";
    fields.year.value = work.year || "";
    fields.description.value = work.description || "";
    fields.tags.value = (work.tags || []).join(", ");
    fields.file.value = "";
    submitLabel.textContent = t("saveChanges");
    cancelEdit.hidden = false;
    document.querySelector("#studio").scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!fields.title.value.trim()) {
      fields.title.focus();
      setStatus(t("statuses").titleRequired, "error");
      return;
    }

    const editingId = fields.id.value;
    const existing = works.find((work) => work.id === editingId);
    const id = editingId || uid();
    const file = fields.file.files?.[0];

    const nextWork = {
      id,
      title: fields.title.value.trim(),
      category: fields.category.value,
      role: fields.role.value.trim(),
      year: fields.year.value ? String(fields.year.value) : "",
      description: fields.description.value.trim(),
      tags: tagsFromText(fields.tags.value),
      fileId: existing?.fileId || "",
      fileName: existing?.fileName || "",
      fileType: existing?.fileType || "",
      demoSound: existing?.demoSound && !file ? existing.demoSound : "",
      createdAt: existing?.createdAt || Date.now(),
    };

    if (file) {
      try {
        await saveFile(id, file);
        nextWork.fileId = id;
        nextWork.fileName = file.name;
        nextWork.fileType = file.type;
        nextWork.demoSound = "";
      } catch {
        setStatus(t("statuses").saveFailed, "error");
        return;
      }
    }

    if (existing) {
      works = works.map((work) => (work.id === id ? nextWork : work));
      setStatus(t("statuses").updated);
    } else {
      works = [nextWork, ...works];
      setStatus(t("statuses").added);
    }

    saveWorks();
    resetForm();
    await renderWorks();
  };

  const moveWork = async (id, direction) => {
    const index = works.findIndex((work) => work.id === id);
    const target = direction === "up" ? index - 1 : index + 1;

    if (index < 0 || target < 0 || target >= works.length) {
      return;
    }

    [works[index], works[target]] = [works[target], works[index]];
    saveWorks();
    await renderWorks();
  };

  const deleteWork = async (id) => {
    const work = works.find((item) => item.id === id);

    if (!work || !window.confirm(t("deleteConfirm")(displayTitle(work)))) {
      return;
    }

    works = works.filter((item) => item.id !== id);
    if (work.fileId) {
      await deleteFile(work.fileId);
    }
    saveWorks();
    await renderWorks();
    setStatus(t("statuses").deleted);
  };

  const setupReveal = () => {
    const revealItems = Array.from(document.querySelectorAll(".reveal"));

    if (!("IntersectionObserver" in window) || prefersReducedMotion.matches) {
      revealItems.forEach((item) => item.classList.add("is-visible"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 },
    );

    revealItems.forEach((item) => observer.observe(item));
  };

  const setupModuleTransitions = () => {
    const modules = Array.from(document.querySelectorAll(".hero, .section"));
    modules.forEach((module) => module.classList.add("page-module"));

    const setActiveModule = () => {
      const center = window.innerHeight * 0.5;
      let closest = modules[0];
      let closestDistance = Number.POSITIVE_INFINITY;

      modules.forEach((module) => {
        const rect = module.getBoundingClientRect();
        if (rect.top <= center && rect.bottom >= center) {
          closest = module;
          closestDistance = 0;
          return;
        }
        const moduleCenter = rect.top + rect.height * 0.5;
        const distance = Math.abs(moduleCenter - center);
        if (distance < closestDistance) {
          closest = module;
          closestDistance = distance;
        }
      });

      modules.forEach((module) => {
        module.classList.toggle("is-module-active", module === closest);
      });
    };

    if (!("IntersectionObserver" in window) || prefersReducedMotion.matches) {
      modules.forEach((module) => module.classList.add("is-module-active"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle("is-module-active", entry.isIntersecting);
        });
      },
      { rootMargin: "-18% 0px -18% 0px", threshold: 0.18 },
    );

    modules.forEach((module) => observer.observe(module));
    setActiveModule();

    let scrollFrame = 0;
    window.addEventListener(
      "scroll",
      () => {
        window.cancelAnimationFrame(scrollFrame);
        scrollFrame = window.requestAnimationFrame(setActiveModule);
      },
      { passive: true },
    );
    window.addEventListener("resize", setActiveModule, { passive: true });
  };

  const setupNavTransitions = () => {
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.addEventListener("click", () => {
        const target = document.querySelector(link.getAttribute("href"));
        if (!target) {
          return;
        }

        const direction = target.getBoundingClientRect().top >= 0 ? "down" : "up";
        playModuleTransition(direction);
      });
    });
  };

  const setupLanguageSwitcher = () => {
    ensureLanguageSwitcher();
    updateLanguageSwitcher();

    languageSwitcherEl?.addEventListener("click", async (event) => {
      const button = event.target.closest(".lang-button");
      if (!button || button.dataset.lang === currentLang) {
        return;
      }

      currentLang = button.dataset.lang === "en" ? "en" : "zh";
      localStorage.setItem(LANG_KEY, currentLang);
      applyLanguage();
      await renderWorks();
    });
  };

  const resizeCanvas = () => {
    if (!canvas || !ctx) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.floor(rect.width * pixelRatio));
    canvas.height = Math.max(1, Math.floor(rect.height * pixelRatio));
    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  };

  const queueResize = () => {
    window.cancelAnimationFrame(resizeFrame);
    resizeFrame = window.requestAnimationFrame(resizeCanvas);
  };

  const drawHero = (time = 0) => {
    if (!canvas || !ctx) {
      return;
    }

    if (document.hidden) {
      canvasRunning = false;
      return;
    }

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    if (!width || !height) {
      animationFrame = window.requestAnimationFrame(drawHero);
      return;
    }

    const reduceMotion = prefersReducedMotion.matches;
    if (reduceMotion) {
      targetEnergy = 0.12;
    }

    const delta = Math.min(40, time - lastFrameTime || 16);
    lastFrameTime = time;
    visualEnergy += (targetEnergy - visualEnergy) * Math.min(1, delta / 280);
    ctx.clearRect(0, 0, width, height);

    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "rgba(79, 209, 197, 0.18)");
    gradient.addColorStop(0.48, "rgba(246, 164, 58, 0.12)");
    gradient.addColorStop(1, "rgba(154, 230, 110, 0.05)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    const centerY = height * 0.48;
    const lines = 8;

    for (let line = 0; line < lines; line += 1) {
      const amplitude = (28 + line * 8) * visualEnergy;
      const yOffset = (line - lines / 2) * 25;
      ctx.beginPath();

      for (let x = 0; x <= width; x += 10) {
        const progress = x / width;
        const phase = time * 0.00055 + line * 0.64;
        const y =
          centerY +
          yOffset +
          Math.sin(progress * Math.PI * (2.4 + line * 0.22) + phase) * amplitude +
          Math.sin(progress * Math.PI * 7 + phase * 1.7) * amplitude * 0.38;

        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.strokeStyle = line % 3 === 0
        ? "rgba(246, 164, 58, 0.35)"
        : line % 3 === 1
          ? "rgba(79, 209, 197, 0.28)"
          : "rgba(247, 243, 232, 0.16)";
      ctx.lineWidth = line === 3 ? 2.4 : 1.2;
      ctx.stroke();
    }

    if (!reduceMotion) {
      animationFrame = window.requestAnimationFrame(drawHero);
    } else {
      canvasRunning = false;
    }
  };

  const startCanvas = () => {
    if (canvasRunning || !canvas || !ctx || document.hidden) {
      return;
    }

    canvasRunning = true;
    lastFrameTime = 0;
    animationFrame = window.requestAnimationFrame(drawHero);
  };

  const stopCanvas = () => {
    canvasRunning = false;
    window.cancelAnimationFrame(animationFrame);
  };

  layoutButtons.forEach((button) => {
    button.addEventListener("click", async () => {
      updateLayout(button.dataset.layout);
      await renderWorks();
    });
  });

  workSection?.addEventListener("click", async (event) => {
    const thumb = event.target.closest(".scene-thumb");
    if (thumb) {
      await selectWork(thumb.dataset.workId);
      return;
    }

    const button = event.target.closest(".category-chip");
    if (!button) {
      return;
    }

    const order = categoryOrder();
    const previousIndex = order.indexOf(categoryFilter);
    const nextCategory = button.dataset.category || "all";
    const nextIndex = order.indexOf(nextCategory);
    workSection.dataset.switchDirection =
      previousIndex < 0 || nextIndex >= previousIndex ? "next" : "prev";
    categoryFilter = button.dataset.category || "all";
    localStorage.setItem("zq-audio-portfolio-category-v1", categoryFilter);
    activeWorkId = "";
    await renderWorks();
    window.setTimeout(() => {
      delete workSection.dataset.switchDirection;
    }, 700);
  });

  resetDemo?.addEventListener("click", async () => {
    works = defaultWorks();
    categoryFilter = "all";
    localStorage.setItem("zq-audio-portfolio-category-v1", categoryFilter);
    activeWorkId = "";
    saveWorks();
    resetForm();
    await renderWorks();
    setStatus(t("statuses").restored);
  });

  workGrid.addEventListener("click", async (event) => {
    const button = event.target.closest("button");
    const card = event.target.closest(".work-card");

    if (!card) {
      return;
    }

    const id = card.dataset.id;
    if (!button) {
      await selectWork(id);
      return;
    }

    const action = button.dataset.action;

    if (button.dataset.demoSound) {
      await playDemoSound(button.dataset.demoSound, button.dataset.id);
      return;
    }

    if (action === "select") {
      await selectWork(id);
    } else if (action === "up" || action === "down") {
      await moveWork(id, action);
    } else if (action === "edit") {
      const work = works.find((item) => item.id === id);
      if (work) {
        fillForm(work);
      }
    } else if (action === "delete") {
      await deleteWork(id);
    }
  });

  form.addEventListener("submit", handleSubmit);
  cancelEdit.addEventListener("click", () => {
    resetForm();
    setStatus(t("statuses").cancelled);
  });

  window.addEventListener("resize", queueResize, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopCanvas();
    } else {
      startCanvas();
    }
  });
  prefersReducedMotion.addEventListener("change", () => {
    stopCanvas();
    resizeCanvas();
    startCanvas();
  });
  window.addEventListener("pagehide", () => {
    clearObjectUrls();
    stopCanvas();
  });

  const init = async () => {
    await loadImportedWorks();
    loadWorks();
    setupReveal();
    setupModuleTransitions();
    setupNavTransitions();
    setupLanguageSwitcher();
    updateLayout(layout);
    applyLanguage();
    resizeCanvas();
    await renderWorks();
    startCanvas();
  };

  init();
})();
