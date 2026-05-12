"use client";

import gsap from "gsap";
import Lenis from "lenis";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import MonitorFrame3D from "@/components/MonitorFrame3D";
import SonicReactor from "@/components/SonicReactor";
import SoundSphere from "@/components/SoundSphere";
import Waveform3D from "@/components/Waveform3D";
import {
  categoryMeta,
  categoryOrder,
  categoryTools,
  getLocalized,
  labItems,
  pipeline,
  projects,
  soundLayers,
  tools,
  type CategoryKey,
  type Lang,
  type Project,
  uiCopy,
} from "@/data/projects";

type ProjectCardProps = {
  project: Project;
  index: number;
  lang: Lang;
  onOpen: (project: Project) => void;
  onHover: (color: string) => void;
};

function LoadingIntro({ onComplete }: { onComplete: () => void }) {
  const [percent, setPercent] = useState(0);
  const [phrase, setPhrase] = useState(0);
  const phrases = uiCopy.en.loading;

  useEffect(() => {
    const timer = window.setInterval(() => {
      setPercent((value) => Math.min(100, value + 2));
    }, 34);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    setPhrase(Math.min(phrases.length - 1, Math.floor(percent / 28)));
    if (percent === 100) {
      const done = window.setTimeout(onComplete, 650);
      return () => window.clearTimeout(done);
    }
    return undefined;
  }, [onComplete, percent, phrases.length]);

  return (
    <motion.div
      className="loading-intro"
      exit={{ opacity: 0, filter: "brightness(2.4)", transition: { duration: 0.65 } }}
    >
      <div className="loading-core">
        <div className="loading-ring" />
        <div className="loading-wave">
          {Array.from({ length: 44 }, (_, index) => (
            <span key={index} style={{ "--i": index } as React.CSSProperties} />
          ))}
        </div>
        <p>{phrases[phrase]}</p>
        <strong>{String(percent).padStart(3, "0")}%</strong>
      </div>
    </motion.div>
  );
}

type NavigateHandler = (event: React.MouseEvent<HTMLAnchorElement>, target: string) => void;

function TransitionLayer({ blastKey, sweepKey }: { blastKey: number; sweepKey: number }) {
  return (
    <>
      <AnimatePresence>
        {blastKey > 0 ? (
          <motion.div
            key={blastKey}
            className="sonic-blast"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          >
            <motion.span
              initial={{ scale: 0, opacity: 0.9 }}
              animate={{ scale: 4.8, opacity: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
      <AnimatePresence>
        {sweepKey > 0 ? (
          <motion.div
            key={sweepKey}
            className="sonic-sweep"
            initial={{ opacity: 0, y: "-24%" }}
            animate={{ opacity: [0, 1, 0], y: ["-24%", "18%", "110%"] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.05, ease: [0.16, 1, 0.3, 1] }}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}

function Header({
  lang,
  setLang,
  copy,
  onNavigate,
}: {
  lang: Lang;
  setLang: (lang: Lang) => void;
  copy: (typeof uiCopy)[Lang];
  onNavigate: NavigateHandler;
}) {
  const anchors = ["#hero", "#works", "#breakdown", "#pipeline", "#lab", "#contact"];

  return (
    <header className="site-shell-header">
      <a href="#hero" className="brand-lockup" aria-label="Zhao Shangqi portfolio home" onClick={(event) => onNavigate(event, "#hero")}>
        <span />
        <strong>ZSQ AUDIO</strong>
      </a>
      <nav aria-label="Main navigation">
        {copy.nav.map((item, index) => (
          <a key={item} href={anchors[index]} onClick={(event) => onNavigate(event, anchors[index])}>
            {item}
          </a>
        ))}
      </nav>
      <div className="lang-toggle" role="group" aria-label="Language">
        <button type="button" aria-pressed={lang === "zh"} onClick={() => setLang("zh")}>
          中文
        </button>
        <button type="button" aria-pressed={lang === "en"} onClick={() => setLang("en")}>
          EN
        </button>
      </div>
    </header>
  );
}

function Hero({
  lang,
  copy,
  activeCategory,
  setActiveCategory,
  activeColor,
  blastKey,
  onNavigate,
}: {
  lang: Lang;
  copy: (typeof uiCopy)[Lang];
  activeCategory: CategoryKey;
  setActiveCategory: (category: CategoryKey) => void;
  activeColor: string;
  blastKey: number;
  onNavigate: NavigateHandler;
}) {
  return (
    <section id="hero" className="hero-stage">
      <div className="hero-identity">
        <p className="section-kicker">{copy.heroKicker}</p>
        <h1>
          ZHAO
          <br />
          SHANGQI
        </h1>
        <div className="identity-stack">
          {copy.identity.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
        <p>{copy.heroLead}</p>
        <div className="hero-actions">
          <a href="#works" className="control-button primary" onClick={(event) => onNavigate(event, "#works")}>
            {copy.ctaWork}
          </a>
          <a href="#breakdown" className="control-button" onClick={(event) => onNavigate(event, "#breakdown")}>
            {copy.ctaLab}
          </a>
        </div>
      </div>

      <div className="reactor-stage" aria-label="3D Sonic Reactor">
        <SonicReactor activeColor={activeColor} blast={blastKey} />
      </div>

      <aside className="hero-hud-panel">
        <HudRow label="ROLE" value={copy.hud.role} />
        <HudRow label="FOCUS" value={copy.hud.focus} />
        <HudRow label="TOOLS" value={copy.hud.tools} />
        <HudRow label="STATUS" value={copy.hud.status} active />
      </aside>

      <div className="hero-category-nav">
        {categoryOrder.map((category) => {
          const meta = categoryMeta[category];
          return (
            <button
              key={category}
              type="button"
              aria-pressed={activeCategory === category}
              onClick={() => setActiveCategory(category)}
              style={{ "--accent": meta.accent } as React.CSSProperties}
            >
              <span>{getLocalized(meta.short, lang)}</span>
              <strong>
                {category === "all"
                  ? projects.length
                  : projects.filter((project) => project.categoryKey === category).length}
              </strong>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function HudRow({ label, value, active = false }: { label: string; value: string; active?: boolean }) {
  return (
    <div className="hud-row">
      <span>{label}</span>
      <strong className={active ? "signal-online" : ""}>{value}</strong>
    </div>
  );
}

function ProjectCard3D({ project, index, lang, onOpen, onHover }: ProjectCardProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const meta = categoryMeta[project.categoryKey];
  const title = getLocalized(project.title, lang);
  const role = getLocalized(project.role, lang);

  const handleEnter = () => {
    onHover(meta.accent);
    videoRef.current?.play().catch(() => undefined);
  };

  const handleLeave = () => {
    videoRef.current?.pause();
  };

  return (
    <motion.article
      className={`project-monitor ${index === 0 ? "featured" : ""}`}
      data-id={project.id}
      role="button"
      tabIndex={0}
      aria-label={`${title} - ${role}`}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onClick={() => onOpen(project)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpen(project);
        }
      }}
      style={{ "--accent": meta.accent } as React.CSSProperties}
      whileHover={{ y: -16, rotateX: 2, rotateY: index % 2 ? -3 : 3 }}
      transition={{ type: "spring", stiffness: 180, damping: 18 }}
    >
      <div className="monitor-frame">
        <MonitorFrame3D color={meta.accent} />
      </div>
      <video ref={videoRef} src={project.mediaUrl} poster={project.posterUrl} muted loop playsInline preload="metadata" />
      <div className="monitor-overlay">
        <span>{String(index + 1).padStart(2, "0")}</span>
        <p>{getLocalized(meta.label, lang)}</p>
        <h3>{title}</h3>
        <small>{role}</small>
        <div className="mini-wave" aria-hidden="true">
          {Array.from({ length: 18 }, (_, wave) => (
            <i key={wave} style={{ "--i": wave } as React.CSSProperties} />
          ))}
        </div>
      </div>
    </motion.article>
  );
}

function ProjectGrid({
  lang,
  copy,
  activeCategory,
  setActiveCategory,
  onOpen,
  onHover,
}: {
  lang: Lang;
  copy: (typeof uiCopy)[Lang];
  activeCategory: CategoryKey;
  setActiveCategory: (category: CategoryKey) => void;
  onOpen: (project: Project) => void;
  onHover: (color: string) => void;
}) {
  const filteredProjects = useMemo(
    () =>
      activeCategory === "all"
        ? projects
        : projects.filter((project) => project.categoryKey === activeCategory),
    [activeCategory],
  );
  const activeMeta = categoryMeta[activeCategory];

  return (
    <section id="works" className="content-section works-section">
      <div className="section-heading">
        <p className="section-kicker">{copy.featuredTitle}</p>
        <h2>{copy.featuredHeading}</h2>
        <p>{copy.featuredLead}</p>
      </div>
      <div className="mission-console">
        <div className="mission-tabs">
          {categoryOrder.map((category) => {
            const meta = categoryMeta[category];
            const count =
              category === "all"
                ? projects.length
                : projects.filter((project) => project.categoryKey === category).length;
            return (
              <button
                key={category}
                type="button"
                aria-pressed={activeCategory === category}
                onClick={() => setActiveCategory(category)}
                style={{ "--accent": meta.accent } as React.CSSProperties}
              >
                <span>{getLocalized(meta.short, lang)}</span>
                <strong>{String(count).padStart(2, "0")}</strong>
              </button>
            );
          })}
        </div>
        <aside style={{ "--accent": activeMeta.accent } as React.CSSProperties}>
          <span>{copy.missionType}</span>
          <strong>{getLocalized(activeMeta.label, lang)}</strong>
          <p>{getLocalized(activeMeta.lead, lang)}</p>
        </aside>
      </div>
      <div className="monitor-wall">
        {filteredProjects.map((project, index) => (
          <ProjectCard3D
            key={project.id}
            project={project}
            index={index}
            lang={lang}
            onOpen={onOpen}
            onHover={onHover}
          />
        ))}
      </div>
    </section>
  );
}

function ProjectOverlay({
  project,
  lang,
  copy,
  onClose,
}: {
  project: Project | null;
  lang: Lang;
  copy: (typeof uiCopy)[Lang];
  onClose: () => void;
}) {
  if (!project) return null;

  const title = getLocalized(project.title, lang);
  const role = getLocalized(project.role, lang);
  const description = getLocalized(project.description, lang);
  const tags = getLocalized(project.tags, lang);
  const meta = categoryMeta[project.categoryKey];
  const toolset = categoryTools[project.categoryKey];

  return (
    <motion.div className="project-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <button type="button" className="overlay-close" onClick={onClose}>
        {copy.overlay.close}
      </button>
      <div className="overlay-info">
        <p className="section-kicker">{getLocalized(meta.label, lang)}</p>
        <h2>{title}</h2>
        <dl>
          <div>
            <dt>{copy.overlay.role}</dt>
            <dd>{role}</dd>
          </div>
          <div>
            <dt>{copy.overlay.tools}</dt>
            <dd>{toolset.join(" / ")}</dd>
          </div>
          <div>
            <dt>{copy.overlay.year}</dt>
            <dd>{project.year}</dd>
          </div>
        </dl>
      </div>
      <div className="overlay-video">
        <video src={project.mediaUrl} poster={project.posterUrl} controls playsInline preload="metadata" />
      </div>
      <div className="overlay-notes">
        <Note title={copy.overlay.audioDirection} body={description} />
        <Note title={copy.overlay.designGoal} body={copy.overlay.designGoalBody} />
        <Note title={copy.overlay.layering} body={copy.overlay.layeringBody} />
        <Note title={copy.overlay.mixing} body={copy.overlay.mixingBody} />
      </div>
      <div className="overlay-timeline">
        {copy.overlay.timeline.map((item, index) => (
          <span key={item}>
            {String(index + 1).padStart(2, "0")} {item}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

function Note({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <span>{title}</span>
      <p>{body}</p>
    </div>
  );
}

function SoundBreakdown({ lang, copy }: { lang: Lang; copy: (typeof uiCopy)[Lang] }) {
  const [activeLayer, setActiveLayer] = useState(soundLayers[0]);

  return (
    <section id="breakdown" className="content-section breakdown-section">
      <div className="section-heading">
        <p className="section-kicker">{copy.breakdownTitle}</p>
        <h2>{copy.breakdownHeading}</h2>
        <p>{copy.breakdownLead}</p>
      </div>
      <div className="breakdown-console">
        <div className="track-stack">
          {soundLayers.map((layer, index) => (
            <button
              key={layer.key}
              type="button"
              aria-pressed={activeLayer.key === layer.key}
              onClick={() => setActiveLayer(layer)}
              style={{ "--accent": layer.color } as React.CSSProperties}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{getLocalized(layer.label, lang)}</strong>
              <i />
            </button>
          ))}
        </div>
        <aside>
          <Waveform3D color={activeLayer.color} />
          <div>
            <span>{copy.activeLayer}</span>
            <h3>{getLocalized(activeLayer.label, lang)}</h3>
            <p>{getLocalized(activeLayer.description, lang)}</p>
          </div>
        </aside>
      </div>
    </section>
  );
}

function AudioPipeline({ lang, copy }: { lang: Lang; copy: (typeof uiCopy)[Lang] }) {
  return (
    <section id="pipeline" className="content-section pipeline-section">
      <div className="section-heading">
        <p className="section-kicker">{copy.pipelineTitle}</p>
        <h2>{copy.pipelineHeading}</h2>
      </div>
      <div className="pipeline-grid">
        {pipeline.map((item, index) => (
          <motion.div key={item.en} whileHover={{ y: -8, scale: 1.02 }} className="pipeline-node">
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{getLocalized(item, lang)}</strong>
            <p>{index < pipeline.length - 1 ? "→" : "✓"}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function ToolsSystem({ lang, copy }: { lang: Lang; copy: (typeof uiCopy)[Lang] }) {
  return (
    <section className="content-section tools-section">
      <div className="section-heading">
        <p className="section-kicker">{copy.toolsTitle}</p>
        <h2>{copy.toolsHeading}</h2>
      </div>
      <div className="tool-grid">
        {tools.map((tool, index) => (
          <motion.div key={tool.name} className="tool-module" whileHover={{ rotateX: 5, rotateY: index % 2 ? -5 : 5 }}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{tool.name}</strong>
            <p>
              {copy.toolStatus} / {getLocalized(tool.note, lang)}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function InteractiveLab({ lang, copy }: { lang: Lang; copy: (typeof uiCopy)[Lang] }) {
  return (
    <section id="lab" className="content-section lab-section">
      <div className="section-heading">
        <p className="section-kicker">{copy.labTitle}</p>
        <h2>{copy.labHeading}</h2>
      </div>
      <div className="lab-grid">
        {labItems.map((item, index) => (
          <article key={item.title.en} className="lab-panel">
            <div className="lab-meter">
              {Array.from({ length: 16 }, (_, meter) => (
                <span key={meter} style={{ "--i": meter + index } as React.CSSProperties} />
              ))}
            </div>
            <h3>{getLocalized(item.title, lang)}</h3>
            <p>
              MOD {String(index + 1).padStart(2, "0")} / {getLocalized(item.description, lang)}
            </p>
            <button type="button">{copy.armDevice}</button>
          </article>
        ))}
      </div>
    </section>
  );
}

function AboutContact({
  copy,
  onNavigate,
}: {
  copy: (typeof uiCopy)[Lang];
  onNavigate: NavigateHandler;
}) {
  return (
    <section id="contact" className="content-section about-contact">
      <div>
        <p className="section-kicker">{copy.aboutTitle}</p>
        <h2>Zhao Shangqi</h2>
        <p>{copy.aboutRole}</p>
        <ul>
          {copy.aboutFocus.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <div className="contact-console">
          <span>{copy.contact}</span>
          <a href="mailto:hello@zqaudio.design">hello@zqaudio.design</a>
          <a href="#works" onClick={(event) => onNavigate(event, "#works")}>
            {copy.backToWorks}
          </a>
        </div>
      </div>
      <aside>
        <SoundSphere />
      </aside>
    </section>
  );
}

export default function PortfolioExperience() {
  const [lang, setLang] = useState<Lang>("zh");
  const [loadingDone, setLoadingDone] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("all");
  const [activeColor, setActiveColor] = useState("#00FFD1");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [blastKey, setBlastKey] = useState(0);
  const [sweepKey, setSweepKey] = useState(0);
  const lenisRef = useRef<Lenis | null>(null);
  const copy = uiCopy[lang];

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.08,
      wheelMultiplier: 0.85,
    });
    lenisRef.current = lenis;
    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  }, [lang]);

  const triggerBlast = () => {
    setBlastKey((value) => value + 1);
    gsap.fromTo(
      document.body,
      { filter: "brightness(1)" },
      { filter: "brightness(1.65)", duration: 0.12, yoyo: true, repeat: 1, clearProps: "filter" },
    );
  };

  const navigateTo: NavigateHandler = (event, target) => {
    event.preventDefault();
    const targetElement = document.querySelector<HTMLElement>(target);
    if (!targetElement) return;

    setSweepKey((value) => value + 1);
    setActiveColor(target === "#works" ? categoryMeta[activeCategory].accent : "#00FFD1");

    window.setTimeout(() => {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(targetElement, {
          offset: -28,
          duration: 1.25,
          easing: (time: number) => 1 - Math.pow(1 - time, 3),
        });
        return;
      }

      targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 120);
  };

  const openProject = (project: Project) => {
    setActiveColor(categoryMeta[project.categoryKey].accent);
    triggerBlast();
    window.setTimeout(() => setSelectedProject(project), 360);
  };

  const closeProject = () => {
    triggerBlast();
    window.setTimeout(() => setSelectedProject(null), 180);
  };

  return (
    <main className="portfolio-root">
      <AnimatePresence>{!loadingDone ? <LoadingIntro onComplete={() => setLoadingDone(true)} /> : null}</AnimatePresence>
      <TransitionLayer blastKey={blastKey} sweepKey={sweepKey} />
      <Header lang={lang} setLang={setLang} copy={copy} onNavigate={navigateTo} />
      <Hero
        lang={lang}
        copy={copy}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        activeColor={activeColor}
        blastKey={blastKey}
        onNavigate={navigateTo}
      />
      <ProjectGrid
        lang={lang}
        copy={copy}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        onOpen={openProject}
        onHover={setActiveColor}
      />
      <SoundBreakdown lang={lang} copy={copy} />
      <AudioPipeline lang={lang} copy={copy} />
      <ToolsSystem lang={lang} copy={copy} />
      <InteractiveLab lang={lang} copy={copy} />
      <AboutContact copy={copy} onNavigate={navigateTo} />
      <AnimatePresence>
        {selectedProject ? (
          <ProjectOverlay project={selectedProject} lang={lang} copy={copy} onClose={closeProject} />
        ) : null}
      </AnimatePresence>
    </main>
  );
}
