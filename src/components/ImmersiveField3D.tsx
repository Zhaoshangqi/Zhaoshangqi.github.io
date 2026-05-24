"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Suspense, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useLoader } from "@react-three/fiber";

type ImmersiveField3DProps = {
  activeColor?: string;
  blastKey?: number;
  imageUrl?: string;
};

const palette = ["#ff0080", "#9d00ff", "#00ccff", "#ffcc00"];

function usePointerState() {
  const state = useRef({
    x: 0,
    y: 0,
    speed: 0,
    wheelDepth: 0,
    clickX: 0,
    clickY: 0,
    blastAt: -10,
  });

  useEffect(() => {
    let lastX = window.innerWidth / 2;
    let lastY = window.innerHeight / 2;
    let lastAt = performance.now();

    const onMove = (event: PointerEvent) => {
      const now = performance.now();
      const elapsed = Math.max(16, now - lastAt);
      const dx = event.clientX - lastX;
      const dy = event.clientY - lastY;

      state.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      state.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
      state.current.speed = (Math.hypot(dx, dy) / elapsed) * 1000;

      lastX = event.clientX;
      lastY = event.clientY;
      lastAt = now;
    };

    const onWheel = (event: WheelEvent) => {
      state.current.wheelDepth = THREE.MathUtils.clamp(
        state.current.wheelDepth + Math.sign(event.deltaY) * 0.45,
        -6,
        6,
      );
    };

    const onClick = (event: PointerEvent) => {
      state.current.clickX = (event.clientX / window.innerWidth) * 2 - 1;
      state.current.clickY = -(event.clientY / window.innerHeight) * 2 + 1;
      state.current.blastAt = performance.now() / 1000;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onClick, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onClick);
      window.removeEventListener("wheel", onWheel);
    };
  }, []);

  return state;
}

function ParticleField({
  activeColor,
  blastKey = 0,
}: {
  activeColor: string;
  blastKey?: number;
}) {
  const pointerState = usePointerState();
  const points = useRef<THREE.Points>(null);
  const lastBlastKey = useRef(blastKey);
  const localBlast = useRef(-10);

  const particleSet = useMemo(() => {
    const count = typeof window !== "undefined" && window.innerWidth < 760 ? 2800 : 5600;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const origins = new Float32Array(count * 3);
    const masses = new Float32Array(count);
    const color = new THREE.Color();

    for (let index = 0; index < count; index += 1) {
      const depth = (Math.random() - 0.5) * 14;
      const radius = 1.2 + Math.random() * 8.5;
      const angle = Math.random() * Math.PI * 2;
      const height = (Math.random() - 0.5) * 5.6;
      const x = Math.cos(angle) * radius + (Math.random() - 0.5) * 2.2;
      const y = height;
      const z = Math.sin(angle) * radius + depth;

      origins[index * 3] = x;
      origins[index * 3 + 1] = y;
      origins[index * 3 + 2] = z;

      positions[index * 3] = x * 0.08;
      positions[index * 3 + 1] = y * 0.08;
      positions[index * 3 + 2] = z * 0.08;

      color.set(palette[index % palette.length]);
      colors[index * 3] = color.r;
      colors[index * 3 + 1] = color.g;
      colors[index * 3 + 2] = color.b;
      masses[index] = 0.5 + Math.random() * 0.7;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    return { count, geometry, origins, velocities, masses };
  }, []);

  useFrame((state, delta) => {
    if (!points.current) return;

    if (lastBlastKey.current !== blastKey) {
      localBlast.current = state.clock.elapsedTime;
      lastBlastKey.current = blastKey;
    }

    const position = particleSet.geometry.attributes.position as THREE.BufferAttribute;
    const positions = position.array as Float32Array;
    const { origins, velocities, masses, count } = particleSet;
    const elapsed = state.clock.elapsedTime;
    const pointer = pointerState.current;
    const attractX = pointer.x * 5.4;
    const attractY = pointer.y * 3.1;
    const globalBlastAge = elapsed - localBlast.current;
    const clickBlastAge = elapsed - pointer.blastAt;
    const intro = Math.min(1, elapsed / 3);
    const introSpread = 0.08 + intro * intro * 0.92;

    for (let index = 0; index < count; index += 1) {
      const offset = index * 3;
      const mass = masses[index];
      const ox = origins[offset] * introSpread;
      const oy = origins[offset + 1] * introSpread;
      const oz = origins[offset + 2] * introSpread + pointer.wheelDepth;
      const x = positions[offset];
      const y = positions[offset + 1];
      const z = positions[offset + 2];
      const dx = attractX - x;
      const dy = attractY - y;
      const distance = Math.max(0.001, Math.hypot(dx, dy));

      let force = 0;
      if (distance < 0.9) force = 0.52;
      else if (distance < 2.7) force = -0.11;

      velocities[offset] += (ox - x) * 0.015 * mass + (dx / distance) * force * delta;
      velocities[offset + 1] += (oy - y) * 0.015 * mass + (dy / distance) * force * delta;
      velocities[offset + 2] += (oz - z) * 0.012 * mass;

      if (pointer.speed > 50 && distance < 2.2) {
        velocities[offset] -= dx * 0.018;
        velocities[offset + 1] -= dy * 0.018;
      }

      if (clickBlastAge > 0 && clickBlastAge < 1) {
        const cx = pointer.clickX * 5.4;
        const cy = pointer.clickY * 3.1;
        const bx = x - cx;
        const by = y - cy;
        const bd = Math.max(0.15, Math.hypot(bx, by));
        const power = (1 - clickBlastAge) * 0.085;
        velocities[offset] += (bx / bd) * power;
        velocities[offset + 1] += (by / bd) * power;
        velocities[offset + 2] += Math.sin(index + elapsed) * power;
      }

      if (globalBlastAge > 0 && globalBlastAge < 1.1) {
        const pulse = (1 - globalBlastAge / 1.1) * 0.06;
        velocities[offset] += Math.cos(index) * pulse;
        velocities[offset + 1] += Math.sin(index * 1.7) * pulse;
      }

      velocities[offset] *= 0.84;
      velocities[offset + 1] *= 0.84;
      velocities[offset + 2] *= 0.86;

      positions[offset] += velocities[offset] * 60 * delta;
      positions[offset + 1] += velocities[offset + 1] * 60 * delta;
      positions[offset + 2] += velocities[offset + 2] * 60 * delta;

      if (Math.abs(positions[offset]) > 9.4) velocities[offset] *= -0.48;
      if (Math.abs(positions[offset + 1]) > 5.2) velocities[offset + 1] *= -0.48;
    }

    position.needsUpdate = true;
    points.current.rotation.y = Math.sin(elapsed * 0.18) * 0.06 + pointer.x * 0.08;
    points.current.rotation.x = pointer.y * 0.05;
  });

  return (
    <>
      <points ref={points} geometry={particleSet.geometry}>
        <pointsMaterial
          vertexColors
          size={0.035}
          transparent
          opacity={0.72}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
      <GlassMechanism activeColor={activeColor} />
    </>
  );
}

function GlassMechanism({ activeColor }: { activeColor: string }) {
  const group = useRef<THREE.Group>(null);
  const tubes = useRef<Array<THREE.Mesh | null>>([]);

  useFrame((state) => {
    if (!group.current) return;
    group.current.rotation.y = state.pointer.x * 0.18 + state.clock.elapsedTime * 0.025;
    group.current.rotation.x = state.pointer.y * 0.12;
    group.current.position.z = Math.sin(state.clock.elapsedTime * 0.34) * 0.35;

    tubes.current.forEach((tube, index) => {
      if (!tube) return;
      tube.rotation.z = Math.sin(state.clock.elapsedTime * 0.6 + index) * 0.26;
    });
  });

  return (
    <group ref={group} position={[0, 0, -1.8]}>
      <mesh position={[0, 0, -2.2]} rotation={[0.35, 0.18, -0.08]}>
        <boxGeometry args={[4.8, 2.8, 0.16]} />
        <meshPhysicalMaterial
          color="#111111"
          roughness={0.2}
          metalness={0.22}
          transmission={0.55}
          transparent
          opacity={0.18}
          clearcoat={1}
          clearcoatRoughness={0.2}
          emissive={activeColor}
          emissiveIntensity={0.2}
        />
      </mesh>
      {Array.from({ length: 10 }, (_, index) => {
        const x = (index - 4.5) * 0.62;
        return (
          <mesh
            key={`tube-${index}`}
            ref={(node) => {
              tubes.current[index] = node;
            }}
            position={[x, Math.sin(index) * 0.55, -1.4 + (index % 2) * 0.2]}
            rotation={[Math.PI / 2, 0, index * 0.32]}
          >
            <cylinderGeometry args={[0.025, 0.04, 2.6, 16]} />
            <meshStandardMaterial
              color={index % 2 ? "#ff0080" : "#9d00ff"}
              emissive={index % 2 ? "#ff0080" : "#9d00ff"}
              emissiveIntensity={1.35}
              roughness={0.32}
              metalness={0.8}
            />
          </mesh>
        );
      })}
      {Array.from({ length: 26 }, (_, index) => {
        const row = Math.floor(index / 7);
        const col = index % 7;
        return (
          <mesh key={`hex-${index}`} position={[(col - 3) * 0.55, (row - 1.8) * 0.48, -1.15]}>
            <circleGeometry args={[0.14, 6]} />
            <meshBasicMaterial
              color="#00ccff"
              transparent
              opacity={0.14 + ((index % 4) * 0.035)}
              blending={THREE.AdditiveBlending}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}
    </group>
  );
}

function ImageParticlePlane({ imageUrl, activeColor }: { imageUrl: string; activeColor: string }) {
  const points = useRef<THREE.Points>(null);
  const texture = useLoader(THREE.TextureLoader, imageUrl);

  const geometry = useMemo(() => {
    const image = texture.image as HTMLImageElement | undefined;
    const geometry = new THREE.BufferGeometry();
    if (!image?.width || !image?.height) return geometry;

    const sampleWidth = 104;
    const sampleHeight = 58;
    const canvas = document.createElement("canvas");
    canvas.width = sampleWidth;
    canvas.height = sampleHeight;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return geometry;

    context.drawImage(image, 0, 0, sampleWidth, sampleHeight);
    const data = context.getImageData(0, 0, sampleWidth, sampleHeight).data;
    const positions: number[] = [];
    const colors: number[] = [];
    const base = new THREE.Color(activeColor);
    const color = new THREE.Color();

    for (let y = 0; y < sampleHeight; y += 2) {
      for (let x = 0; x < sampleWidth; x += 2) {
        const offset = (y * sampleWidth + x) * 4;
        const r = data[offset] / 255;
        const g = data[offset + 1] / 255;
        const b = data[offset + 2] / 255;
        const brightness = (r + g + b) / 3;
        if (brightness < 0.06) continue;

        positions.push(
          (x / sampleWidth - 0.5) * 7.6,
          -(y / sampleHeight - 0.5) * 4.25,
          (brightness - 0.5) * 0.72 + (Math.random() - 0.5) * 0.22,
        );

        color.setRGB(r, g, b).lerp(base, 0.18);
        colors.push(color.r, color.g, color.b);
      }
    }

    geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    return geometry;
  }, [activeColor, texture]);

  useFrame((state) => {
    if (!points.current) return;
    points.current.rotation.y = -0.24 + state.pointer.x * 0.08 + Math.sin(state.clock.elapsedTime * 0.24) * 0.025;
    points.current.rotation.x = 0.12 + state.pointer.y * 0.045;
    points.current.position.z = -3.4 + Math.sin(state.clock.elapsedTime * 0.42) * 0.18;
  });

  return (
    <group position={[0, 0.04, -3.4]} rotation={[0.12, -0.24, -0.08]}>
      <points ref={points} geometry={geometry}>
        <pointsMaterial
          vertexColors
          size={0.058}
          transparent
          opacity={0.78}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}

export default function ImmersiveField3D({
  activeColor = "#00ccff",
  blastKey = 0,
  imageUrl,
}: ImmersiveField3DProps) {
  return (
    <div className="immersive-field" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 8.5], fov: 58 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
      >
        <ambientLight intensity={0.32} />
        <pointLight position={[3.6, 2.8, 5]} intensity={2.8} color="#00ccff" />
        <pointLight position={[-4, -2, 3]} intensity={1.8} color="#ff0080" />
        <pointLight position={[0, 4, -2]} intensity={1.25} color="#ffcc00" />
        {imageUrl ? (
          <Suspense fallback={null}>
            <ImageParticlePlane imageUrl={imageUrl} activeColor={activeColor} />
          </Suspense>
        ) : null}
        <ParticleField activeColor={activeColor} blastKey={blastKey} />
      </Canvas>
    </div>
  );
}
