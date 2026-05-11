import * as THREE from "./assets/vendor/three.module.js";

const stage = document.querySelector("#three-stage");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (!stage) {
  throw new Error("Missing #three-stage container");
}

const state = {
  works: [],
  category: "all",
  activeWorkId: "",
  direction: "next",
};

const runtime = {
  renderer: null,
  scene: null,
  camera: null,
  clock: new THREE.Clock(),
  world: new THREE.Group(),
  corridor: new THREE.Group(),
  particles: null,
  rings: [],
  targetCategoryIndex: 0,
  currentCategoryOffset: 0,
  pointer: new THREE.Vector2(0, 0),
  pointerTarget: new THREE.Vector2(0, 0),
  scrollTarget: 0,
  scrollValue: 0,
  textures: new Set(),
  videoEls: new Set(),
  raf: 0,
  visible: true,
};

const palette = {
  cyan: 0x61d6d0,
  amber: 0xd8a85a,
  cream: 0xf7f3e8,
  ink: 0x07080d,
  glass: 0x182331,
};

const textureLoader = new THREE.TextureLoader();
textureLoader.setCrossOrigin("anonymous");

const assetUrl = (path) => {
  if (!path) {
    return "";
  }

  try {
    return new URL(path, window.location.href).href;
  } catch {
    return path;
  }
};

const categoryName = (work) => work?.category || "Other";

const categoryList = () => {
  const names = [];
  state.works.forEach((work) => {
    const name = categoryName(work);
    if (!names.includes(name)) {
      names.push(name);
    }
  });
  return ["all", ...names];
};

const worksForCategory = (name) => {
  if (name === "all") {
    return state.works;
  }
  return state.works.filter((work) => categoryName(work) === name);
};

const isVideoWork = (work) => {
  const type = work?.fileType || "";
  const mediaUrl = work?.mediaUrl || "";
  const fileName = work?.fileName || "";
  return type.startsWith("video/") || /\.(mp4|webm|mov|m4v|ogv)$/i.test(mediaUrl || fileName);
};

const disposeObject = (object) => {
  object.traverse((child) => {
    if (child.geometry) {
      child.geometry.dispose();
    }
    if (child.material) {
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material) => material.dispose());
    }
  });
};

const disposeMedia = () => {
  runtime.textures.forEach((texture) => texture.dispose());
  runtime.textures.clear();
  runtime.videoEls.forEach((video) => {
    video.pause();
    video.removeAttribute("src");
    video.load();
  });
  runtime.videoEls.clear();
};

const makeMaterial = (options = {}) => new THREE.MeshPhysicalMaterial({
  color: options.color ?? palette.glass,
  emissive: options.emissive ?? 0x000000,
  emissiveIntensity: options.emissiveIntensity ?? 0,
  roughness: options.roughness ?? 0.22,
  metalness: options.metalness ?? 0.22,
  transparent: options.transparent ?? true,
  opacity: options.opacity ?? 0.56,
  side: options.side ?? THREE.DoubleSide,
  depthWrite: options.depthWrite ?? false,
});

const loadPosterTexture = (work) => {
  const posterUrl = assetUrl(work?.posterUrl || "");
  if (!posterUrl) {
    return null;
  }

  const texture = textureLoader.load(posterUrl);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(8, runtime.renderer?.capabilities.getMaxAnisotropy?.() || 1);
  runtime.textures.add(texture);
  return texture;
};

const loadVideoTexture = (work) => {
  if (!isVideoWork(work) || !work.mediaUrl) {
    return null;
  }

  const video = document.createElement("video");
  video.src = assetUrl(work.mediaUrl);
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.autoplay = true;
  video.preload = "metadata";
  video.crossOrigin = "anonymous";
  video.play().catch(() => {});

  const texture = new THREE.VideoTexture(video);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  runtime.textures.add(texture);
  runtime.videoEls.add(video);
  return texture;
};

const createFrame = (width, height, depth, color) => {
  const group = new THREE.Group();
  const material = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
  });
  const horizontal = new THREE.BoxGeometry(width + 0.16, 0.035, depth);
  const vertical = new THREE.BoxGeometry(0.035, height + 0.08, depth);

  const top = new THREE.Mesh(horizontal, material);
  top.position.y = height / 2 + 0.055;
  const bottom = new THREE.Mesh(horizontal, material);
  bottom.position.y = -height / 2 - 0.055;
  const left = new THREE.Mesh(vertical, material);
  left.position.x = -width / 2 - 0.055;
  const right = new THREE.Mesh(vertical, material);
  right.position.x = width / 2 + 0.055;
  group.add(top, bottom, left, right);
  return group;
};

const createScreen = (work, index, total, active) => {
  const group = new THREE.Group();
  const width = active ? 3.2 : 2.15;
  const height = width * 0.5625;
  const offset = index - (total - 1) / 2;
  const isCenter = Math.abs(offset) < 0.5;

  group.position.set(offset * 1.72, 0.72 - Math.abs(offset) * 0.14, -2.1 - Math.abs(offset) * 0.55);
  group.rotation.y = -offset * 0.22;
  group.rotation.x = active && isCenter ? -0.04 : -0.02;

  const glass = new THREE.Mesh(
    new THREE.PlaneGeometry(width + 0.34, height + 0.28),
    makeMaterial({
      color: 0x142331,
      emissive: active ? palette.cyan : palette.amber,
      emissiveIntensity: active ? 0.18 : 0.08,
      opacity: active ? 0.34 : 0.22,
    }),
  );
  glass.position.z = -0.035;

  const videoTexture = active && isCenter ? loadVideoTexture(work) : null;
  const posterTexture = videoTexture || loadPosterTexture(work);
  const screenMaterial = posterTexture
    ? new THREE.MeshBasicMaterial({ map: posterTexture, transparent: true })
    : new THREE.MeshBasicMaterial({
      color: active ? 0x1f454a : 0x17222a,
      transparent: true,
      opacity: active ? 0.92 : 0.7,
    });

  const screen = new THREE.Mesh(new THREE.PlaneGeometry(width, height), screenMaterial);
  screen.position.z = 0.025;

  const frame = createFrame(width, height, 0.05, active && isCenter ? palette.cyan : palette.amber);
  frame.position.z = 0.05;

  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(width + 0.7, height + 0.7),
    new THREE.MeshBasicMaterial({
      color: active && isCenter ? palette.cyan : palette.amber,
      transparent: true,
      opacity: active && isCenter ? 0.2 : 0.08,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  );
  glow.position.z = -0.08;

  group.add(glow, glass, screen, frame);
  return group;
};

const createCategoryBay = (name, categoryIndex, names) => {
  const group = new THREE.Group();
  const items = worksForCategory(name).slice(0, 5);
  const active = items.find((work) => work.id === state.activeWorkId) || items[0];
  const maxItems = Math.min(5, items.length);
  const centerIndex = Math.floor(maxItems / 2);
  const others = active ? items.filter((work) => work.id !== active.id) : items.slice();
  const sorted = [];

  for (let index = 0; index < maxItems; index += 1) {
    sorted[index] = active && index === centerIndex ? active : others.shift();
  }

  const total = sorted.length || 1;
  sorted.forEach((work, index) => {
    if (!work) {
      return;
    }
    group.add(createScreen(work, index, total, work.id === active?.id));
  });

  const bayWidth = 6.2;
  const bayHeight = 3.15;
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(bayWidth, 0.035, 2.9),
    makeMaterial({ color: 0x101824, emissive: palette.cyan, emissiveIntensity: 0.06, opacity: 0.25 }),
  );
  base.position.set(0, -0.64, -2.52);

  const backPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(bayWidth, bayHeight),
    makeMaterial({ color: 0x132532, emissive: palette.cyan, emissiveIntensity: 0.05, opacity: 0.16 }),
  );
  backPlane.position.set(0, 0.72, -3.75);

  const sideMaterial = makeMaterial({ color: 0x16202d, emissive: palette.amber, emissiveIntensity: 0.06, opacity: 0.16 });
  const leftWall = new THREE.Mesh(new THREE.PlaneGeometry(2.5, bayHeight), sideMaterial);
  leftWall.position.set(-bayWidth / 2, 0.72, -2.5);
  leftWall.rotation.y = Math.PI / 2.6;
  const rightWall = new THREE.Mesh(new THREE.PlaneGeometry(2.5, bayHeight), sideMaterial);
  rightWall.position.set(bayWidth / 2, 0.72, -2.5);
  rightWall.rotation.y = -Math.PI / 2.6;

  const progress = names.length > 1 ? categoryIndex / (names.length - 1) : 0;
  const accentLine = new THREE.Mesh(
    new THREE.BoxGeometry(0.18 + progress * 1.6, 0.035, 0.035),
    new THREE.MeshBasicMaterial({ color: palette.cyan, transparent: true, opacity: 0.85 }),
  );
  accentLine.position.set(-2.8 + progress * 5.6, -0.44, -1.06);

  group.add(base, backPlane, leftWall, rightWall, accentLine);
  group.position.x = categoryIndex * 7.3;
  return group;
};

const buildCorridor = () => {
  runtime.corridor.clear();
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: palette.cyan,
    transparent: true,
    opacity: 0.38,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const amberMaterial = new THREE.MeshBasicMaterial({
    color: palette.amber,
    transparent: true,
    opacity: 0.3,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  runtime.rings = [];
  for (let i = 0; i < 12; i += 1) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(3.6 + i * 0.18, 0.01, 8, 96), i % 2 ? ringMaterial : amberMaterial);
    ring.position.set(0, 0.78, -2.4 - i * 0.72);
    ring.scale.y = 0.58;
    ring.rotation.z = i * 0.08;
    runtime.rings.push(ring);
    runtime.corridor.add(ring);
  }

  const grid = new THREE.GridHelper(32, 40, palette.cyan, 0x2b3440);
  grid.position.set(0, -0.68, -5.2);
  grid.material.transparent = true;
  grid.material.opacity = 0.24;
  runtime.corridor.add(grid);

  const positions = new Float32Array(720 * 3);
  for (let i = 0; i < positions.length; i += 3) {
    positions[i] = (Math.random() - 0.5) * 18;
    positions[i + 1] = Math.random() * 6 - 1.2;
    positions[i + 2] = -Math.random() * 14 - 0.5;
  }
  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  runtime.particles = new THREE.Points(
    particleGeometry,
    new THREE.PointsMaterial({
      color: palette.cream,
      size: 0.018,
      transparent: true,
      opacity: 0.52,
      depthWrite: false,
    }),
  );
  runtime.corridor.add(runtime.particles);
  runtime.scene.add(runtime.corridor);
};

const rebuildWorld = () => {
  disposeObject(runtime.world);
  disposeMedia();
  runtime.world.clear();

  const names = categoryList();
  names.forEach((name, index) => {
    runtime.world.add(createCategoryBay(name, index, names));
  });

  const categoryIndex = Math.max(0, names.indexOf(state.category));
  runtime.targetCategoryIndex = categoryIndex;
  runtime.scene.add(runtime.world);
};

const updateState = (detail = {}) => {
  const nextWorks = Array.isArray(detail.works) ? detail.works : state.works;
  state.works = nextWorks.filter(Boolean);
  state.category = detail.category || state.category || "all";
  state.activeWorkId = detail.activeWorkId || state.activeWorkId || "";
  state.direction = detail.direction || state.direction || "next";

  rebuildWorld();
};

const fitRenderer = () => {
  const width = Math.max(1, stage.clientWidth);
  const height = Math.max(1, stage.clientHeight);
  runtime.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
  runtime.renderer.setSize(width, height, false);
  runtime.camera.aspect = width / height;
  runtime.camera.updateProjectionMatrix();
};

const animate = () => {
  runtime.raf = window.requestAnimationFrame(animate);
  if (!runtime.visible) {
    return;
  }

  const elapsed = runtime.clock.getElapsedTime();
  const reduced = reduceMotion.matches;
  const speed = reduced ? 0.14 : 1;
  const targetX = -runtime.targetCategoryIndex * 7.3;
  runtime.currentCategoryOffset += (targetX - runtime.currentCategoryOffset) * (reduced ? 0.05 : 0.075);
  runtime.pointer.x += (runtime.pointerTarget.x - runtime.pointer.x) * 0.06;
  runtime.pointer.y += (runtime.pointerTarget.y - runtime.pointer.y) * 0.06;
  runtime.scrollValue += (runtime.scrollTarget - runtime.scrollValue) * 0.055;

  runtime.world.position.x = runtime.currentCategoryOffset;
  runtime.world.position.x += 2.05;
  runtime.world.rotation.y = runtime.pointer.x * 0.12;
  runtime.world.rotation.x = -0.03 + runtime.scrollValue * 0.018;

  runtime.corridor.rotation.z = Math.sin(elapsed * 0.22 * speed) * 0.025;
  runtime.corridor.position.x = 1.35 + runtime.pointer.x * -0.4;
  runtime.corridor.position.y = runtime.scrollValue * -0.06;

  runtime.rings.forEach((ring, index) => {
    ring.rotation.z += (index % 2 ? -0.0016 : 0.0012) * speed;
    ring.position.z = -2.4 - index * 0.72 + Math.sin(elapsed * 0.7 * speed + index) * 0.025;
  });

  if (runtime.particles) {
    runtime.particles.rotation.y = elapsed * 0.018 * speed;
    runtime.particles.position.x = runtime.pointer.x * -0.55;
  }

  runtime.camera.position.x = runtime.pointer.x * 0.78;
  runtime.camera.position.y = 1.22 + runtime.pointer.y * 0.38 - runtime.scrollValue * 0.12;
  runtime.camera.position.z = 5.2 + Math.sin(elapsed * 0.18 * speed) * 0.08;
  runtime.camera.lookAt(0.92 + runtime.pointer.x * 0.24, 0.28 - runtime.scrollValue * 0.08, -2.65);

  runtime.renderer.render(runtime.scene, runtime.camera);
};

const fetchInitialWorks = async () => {
  try {
    const response = await fetch(assetUrl("data/works.json"), { cache: "no-store" });
    if (!response.ok) {
      return;
    }
    const works = await response.json();
    if (Array.isArray(works) && !state.works.length) {
      updateState({ works, category: "all", direction: "next" });
    }
  } catch {
    // The main app will still publish state when it finishes rendering.
  }
};

const init = () => {
  runtime.scene = new THREE.Scene();
  runtime.scene.fog = new THREE.FogExp2(0x07080d, 0.055);
  runtime.camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
  runtime.camera.position.set(0, 1.2, 5.2);

  runtime.renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    powerPreference: "high-performance",
    preserveDrawingBuffer: true,
  });
  runtime.renderer.outputColorSpace = THREE.SRGBColorSpace;
  runtime.renderer.setClearColor(0x000000, 0);
  stage.append(runtime.renderer.domElement);

  const ambient = new THREE.AmbientLight(0xb8f7ff, 0.58);
  const cyan = new THREE.PointLight(palette.cyan, 6, 12);
  cyan.position.set(-2.8, 2.4, 2.2);
  const amber = new THREE.PointLight(palette.amber, 5.8, 12);
  amber.position.set(3.2, 1.8, 0.6);
  const key = new THREE.DirectionalLight(0xffffff, 1.15);
  key.position.set(2.2, 3.8, 4.2);
  runtime.scene.add(ambient, cyan, amber, key);

  buildCorridor();
  rebuildWorld();
  runtime.world.scale.setScalar(1.14);
  fitRenderer();
  document.body.classList.add("has-3d-scene");
  animate();
  fetchInitialWorks();
};

window.addEventListener("resize", fitRenderer, { passive: true });
window.addEventListener("pointermove", (event) => {
  runtime.pointerTarget.x = (event.clientX / window.innerWidth - 0.5) * 2;
  runtime.pointerTarget.y = -(event.clientY / window.innerHeight - 0.5) * 2;
}, { passive: true });
window.addEventListener("scroll", () => {
  runtime.scrollTarget = Math.min(4, window.scrollY / Math.max(1, window.innerHeight));
}, { passive: true });
document.addEventListener("visibilitychange", () => {
  runtime.visible = !document.hidden;
  runtime.videoEls.forEach((video) => {
    if (runtime.visible) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  });
});
window.addEventListener("zsq:portfolio-state", (event) => updateState(event.detail || {}));

try {
  init();
} catch (error) {
  console.warn("3D scene failed to start", error);
  document.body.classList.remove("has-3d-scene");
  stage.remove();
}
