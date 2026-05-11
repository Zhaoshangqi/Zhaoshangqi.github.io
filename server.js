const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const PORT = Number(process.env.PORT || 5173);
const HOST = process.env.HOST || "127.0.0.1";
const ROOT = __dirname;

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".json": "application/json; charset=utf-8",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
};

const page = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="dark">
    <meta name="description" content="面向游戏、影视和交互产品岗位的音频设计师求职作品集。">
    <title>ZSQAudio | 求职作品集</title>
    <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='16' fill='%2307080d'/%3E%3Ccircle cx='32' cy='32' r='23' fill='none' stroke='%234fd1c5' stroke-width='4'/%3E%3Cpath d='M14 43c10-26 24 26 36 0' fill='none' stroke='%23f6a43a' stroke-width='5' stroke-linecap='round'/%3E%3Ctext x='32' y='36' text-anchor='middle' font-family='Arial,sans-serif' font-size='16' font-weight='800' fill='white'%3EZSQ%3C/text%3E%3C/svg%3E">
    <script>document.documentElement.classList.add("has-js");</script>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body>
    <a class="skip-link" href="#work">跳到作品</a>

    <header class="site-header" aria-label="主导航">
      <a class="brand" href="#top" aria-label="ZSQAudio 首页">
        <span class="brand-mark" aria-hidden="true"></span>
        <span>ZSQAudio</span>
      </a>
      <nav class="nav-links" aria-label="页面导航">
        <a href="#profile">简介</a>
        <a href="#work">作品</a>
        <a href="#studio">编辑</a>
        <a href="#contact">联系</a>
      </nav>
    </header>

    <main id="top">
      <section class="hero" aria-labelledby="hero-title">
        <video class="hero-bg-video" autoplay muted loop playsinline preload="metadata" aria-hidden="true">
          <source src="assets/hero/hero-interior-gallery.mp4" type="video/mp4">
        </video>
        <canvas id="hero-visual" class="hero-visual" aria-hidden="true"></canvas>
        <div class="hero-grid">
          <div class="hero-copy">
            <p class="eyebrow">Audio Designer Portfolio</p>
            <h1 id="hero-title">面向游戏与影像岗位的声音作品集。</h1>
            <p class="hero-lede">
              上传带画面的 Demo Reel、Gameplay Capture 或声音重设计片段。招聘方可以直接看画面、听声音，
              同时快速读到你的职责、设计思路和项目标签。
            </p>
            <div class="hero-actions" aria-label="主要操作">
              <a class="button button-primary" href="#work">查看作品</a>
              <a class="button button-ghost" href="#studio">上传视频</a>
            </div>
          </div>

          <aside class="profile-panel" aria-label="候选人摘要">
            <div class="profile-line">
              <span>Target</span>
              <strong>Game Audio / Sound Design</strong>
            </div>
            <div class="profile-line">
              <span>Media</span>
              <strong>Video Reel, Gameplay, Redesign</strong>
            </div>
            <div class="profile-line">
              <span>Tools</span>
              <strong>REAPER, Wwise, Middleware Ready</strong>
            </div>
            <div class="mini-spectrum" aria-hidden="true">
              <span style="--level: 52%"></span>
              <span style="--level: 26%"></span>
              <span style="--level: 78%"></span>
              <span style="--level: 44%"></span>
              <span style="--level: 88%"></span>
              <span style="--level: 62%"></span>
              <span style="--level: 34%"></span>
              <span style="--level: 70%"></span>
            </div>
          </aside>
        </div>
      </section>

      <section id="work" class="section section-work" aria-labelledby="work-title">
        <div class="section-heading reveal">
          <p class="eyebrow">Selected Work</p>
          <h2 id="work-title">作品展示</h2>
          <p>作品顺序和展示排版会保存在当前浏览器。视频作品会直接在卡片中预览播放。</p>
        </div>

        <div class="layout-toolbar reveal" aria-label="作品排版控制">
          <div class="segmented-control" role="group" aria-label="展示排版">
            <button type="button" data-layout="grid" aria-pressed="true">网格</button>
            <button type="button" data-layout="compact" aria-pressed="false">紧凑</button>
            <button type="button" data-layout="reel" aria-pressed="false">长卡</button>
          </div>
          <button class="button button-ghost button-small" type="button" data-reset-demo>
            恢复示例
          </button>
        </div>

        <div id="work-grid" class="work-grid layout-grid" aria-live="polite"></div>
        <div id="empty-state" class="empty-state" hidden>
          <h3>还没有作品</h3>
          <p>添加第一条视频作品后，这里会自动生成可播放的作品卡。</p>
          <a class="button button-primary" href="#studio">添加作品</a>
        </div>
      </section>

      <section id="studio" class="section studio-section" aria-labelledby="studio-title">
        <div class="section-heading reveal">
          <p class="eyebrow">Portfolio Studio</p>
          <h2 id="studio-title">上传与排版</h2>
          <p>视频和作品信息保存在当前浏览器；发布上线前可替换成真实后端或静态资源路径。</p>
        </div>

        <form id="work-form" class="work-form reveal" novalidate>
          <input type="hidden" id="work-id">
          <div class="form-grid">
            <label>
              <span>作品标题 *</span>
              <input id="work-title-input" name="title" type="text" required maxlength="72" placeholder="Gameplay Sound Redesign Reel">
            </label>
            <label>
              <span>类别</span>
              <select id="work-category" name="category">
                <option>Game Audio</option>
                <option>Gameplay Redesign</option>
                <option>Interface</option>
                <option>Cinematic</option>
                <option>Ambience</option>
                <option>Sonic Branding</option>
                <option>Other</option>
              </select>
            </label>
            <label>
              <span>职责 / 项目角色</span>
              <input id="work-role" name="role" type="text" maxlength="80" placeholder="Sound Design / Editing / Mix">
            </label>
            <label>
              <span>年份</span>
              <input id="work-year" name="year" type="number" min="2000" max="2100" inputmode="numeric" placeholder="2026">
            </label>
            <label class="form-wide">
              <span>作品视频 / 音频</span>
              <input id="work-file" name="file" type="file" accept="video/*,audio/*">
            </label>
            <label class="form-wide">
              <span>作品说明</span>
              <textarea id="work-description" name="description" rows="4" maxlength="320" placeholder="这个视频要展示什么声音能力？你负责了哪些声音层？最终声音如何支撑画面、玩法或剪辑节奏？"></textarea>
            </label>
            <label class="form-wide">
              <span>标签</span>
              <input id="work-tags" name="tags" type="text" maxlength="120" placeholder="gameplay, redesign, impact, wwise">
            </label>
          </div>

          <div class="form-actions">
            <button class="button button-primary" type="submit" data-submit-label>添加作品</button>
            <button class="button button-ghost" type="button" data-cancel-edit hidden>取消编辑</button>
            <p class="form-status" role="status" aria-live="polite" data-form-status></p>
          </div>
        </form>
      </section>

      <section id="profile" class="section profile-section" aria-labelledby="profile-title">
        <div class="section-heading reveal">
          <p class="eyebrow">Candidate Snapshot</p>
          <h2 id="profile-title">声音设计不是素材堆叠，而是反馈、情绪和信息密度的控制。</h2>
        </div>
        <div class="profile-grid">
          <div class="profile-note reveal">
            <h3>求职方向</h3>
            <p>游戏音频设计、影视预告片声音包装、交互产品声音体验。</p>
          </div>
          <div class="profile-note reveal">
            <h3>能力关键词</h3>
            <p>Layering、Transient、Loudness、Loop、Implementation、Iteration。</p>
          </div>
          <div class="profile-note reveal">
            <h3>作品呈现</h3>
            <p>每个项目保留目标、职责、声音思路和视频片段，方便招聘方快速判断。</p>
          </div>
        </div>
      </section>

      <section id="contact" class="section contact-section" aria-labelledby="contact-title">
        <div class="contact-copy reveal">
          <p class="eyebrow">Contact</p>
          <h2 id="contact-title">可面试 / 可发测试题 / 可提供分轨说明。</h2>
          <p>把邮箱、简历链接和 Demo Reel 地址替换成你的真实信息即可。</p>
        </div>
        <div class="contact-actions reveal">
          <a class="button button-primary" href="mailto:hello@zqaudio.design?subject=Audio%20Designer%20Portfolio">
            hello@zqaudio.design
          </a>
          <a class="button button-ghost" href="#studio">更新作品</a>
        </div>
      </section>
    </main>

    <footer class="site-footer">
      <p>© 2026 ZSQAudio. Web portfolio for focused listening and recruiter review.</p>
    </footer>

    <script src="app.js" defer></script>
  </body>
</html>`;

const send = (res, statusCode, body, contentType) => {
  res.writeHead(statusCode, {
    "Content-Type": contentType,
    "Cache-Control": "no-store",
  });
  res.end(body);
};

const serveStatic = (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = decodeURIComponent(url.pathname);

  if (pathname === "/" || pathname === "/index") {
    send(res, 200, page, "text/html; charset=utf-8");
    return;
  }

  const requested = path.normalize(path.join(ROOT, pathname.replace(/^\/+/, "")));
  if (!requested.startsWith(ROOT)) {
    send(res, 403, "Forbidden", "text/plain; charset=utf-8");
    return;
  }

  fs.readFile(requested, (error, data) => {
    if (error) {
      send(res, 404, "Not found", "text/plain; charset=utf-8");
      return;
    }

    const ext = path.extname(requested).toLowerCase();
    send(res, 200, data, mimeTypes[ext] || "application/octet-stream");
  });
};

const server = http.createServer(serveStatic);

server.listen(PORT, HOST, () => {
  console.log(`Audio portfolio web app running at http://${HOST}:${PORT}`);
});
