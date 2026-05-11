const fs = require("node:fs/promises");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");

const copyFile = async (from, to) => {
  await fs.mkdir(path.dirname(to), { recursive: true });
  await fs.copyFile(from, to);
};

const copyDir = async (from, to, options = {}) => {
  const entries = await fs.readdir(from, { withFileTypes: true });
  await fs.mkdir(to, { recursive: true });

  for (const entry of entries) {
    const source = path.join(from, entry.name);
    const target = path.join(to, entry.name);

    if (options.exclude?.(source, entry)) {
      continue;
    }

    if (entry.isDirectory()) {
      await copyDir(source, target, options);
    } else if (entry.isFile()) {
      await copyFile(source, target);
    }
  }
};

const extractHtml = async () => {
  const server = await fs.readFile(path.join(root, "server.js"), "utf8");
  const match = server.match(/const page = `([\s\S]*?)`;\r?\n\r?\nconst send =/);

  if (!match) {
    throw new Error("Could not extract HTML template from server.js");
  }

  return match[1]
    .replaceAll('href="/styles.css"', 'href="styles.css"')
    .replaceAll('src="/assets/', 'src="assets/')
    .replaceAll('src="/app.js"', 'src="app.js"');
};

const build = async () => {
  await fs.rm(dist, { recursive: true, force: true });
  await fs.mkdir(dist, { recursive: true });

  await fs.writeFile(path.join(dist, "index.html"), await extractHtml(), "utf8");
  await fs.writeFile(path.join(dist, ".nojekyll"), "", "utf8");
  await copyFile(path.join(root, "app.js"), path.join(dist, "app.js"));
  await copyFile(path.join(root, "three-scene.js"), path.join(dist, "three-scene.js"));
  await copyFile(path.join(root, "styles.css"), path.join(dist, "styles.css"));
  await copyDir(path.join(root, "data"), path.join(dist, "data"));
  await copyDir(path.join(root, "assets", "vendor"), path.join(dist, "assets", "vendor"));
  await copyDir(path.join(root, "assets", "thumbs"), path.join(dist, "assets", "thumbs"));
  await copyDir(path.join(root, "assets", "works"), path.join(dist, "assets", "works"), {
    exclude: (source) => path.basename(source) === "work-13.mp4",
  });
  await copyFile(
    path.join(root, "assets", "hero", "hero-interior-gallery.mp4"),
    path.join(dist, "assets", "hero", "hero-interior-gallery.mp4"),
  );

  console.log(`Static site exported to ${dist}`);
};

build().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
