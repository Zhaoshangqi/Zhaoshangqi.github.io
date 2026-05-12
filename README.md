# Zhaoshangqi.github.io

High-end 3D portfolio for a game audio designer / sound designer / PV mixing designer. The site is designed as a “Sonic Lab + Game Audio Console + 3D Digital Gallery” rather than a standard flat portfolio.

## Run Locally

```powershell
npm run dev
```

Open:

```text
http://127.0.0.1:5174
```

## Build

```powershell
npm run build
```

The Next.js config exports a static site to `out/` for GitHub Pages.

## Stack

- Next.js / React / TypeScript
- Tailwind CSS with custom global design tokens
- Three.js, React Three Fiber, Drei
- Framer Motion, GSAP, Lenis smooth scroll

## Project Structure

- `src/app/`: Next.js app entry and metadata
- `src/components/`: Sonic Reactor, WebGL scenes, monitor wall, overlay, pipeline, lab, contact console
- `src/data/projects.ts`: UI copy, category metadata, tooling, and mapped portfolio data
- `src/styles/globals.css`: Neo Bauhaus / game-audio console visual system
- `data/works.json`: unchanged bilingual portfolio metadata
- `public/assets/`: videos, thumbnails, generated hero media, and static assets

## Content Model

Each work item keeps the existing content and includes:

- `categoryKey`: `foley`, `redesign`, `gameplay`, `ambience`, `elemental`, `character`, or `cinematic`
- `title`, `role`, `description`, and `tags`: bilingual `zh` / `en` fields
- `mediaUrl` and `posterUrl`: static asset paths served from `public/assets/`
