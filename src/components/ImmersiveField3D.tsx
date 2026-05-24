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

const palette = ["#00ccff", "#00ffd1", "#9d00ff", "#ff0080"];

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

function AudioSignalField({
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

  const signalSet = useMemo(() => {
    const compact = typeof window !== "undefined" && window.innerWidth < 760;
    const lanes = compact ? 4 : 6;
    const samples = compact ? 150 : 240;
    const count = lanes * samples;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const origins = new Float32Array(count * 3);
    const phases = new Float32Array(count);
    const amplitudes = new Float32Array(count);
    const lanesByIndex = new Float32Array(count);
    const masses = new Float32Array(count);
    const color = new THREE.Color();
    const accent = new THREE.Color(activeColor);

    for (let lane = 0; lane < lanes; lane += 1) {
      for (let sample = 0; sample < samples; sample += 1) {
        const index = lane * samples + sample;
        const offset = index * 3;
        const progress = sample / (samples - 1);
        const laneOffset = lane - (lanes - 1) / 2;
        const x = (progress - 0.5) * 12.8;
        const y = laneOffset * 0.58 + Math.sin(progress * Math.PI * 2 + lane) * 0.12;
        const z = -4.6 + lane * 0.42 + Math.sin(progress * Math.PI * 4 + lane) * 0.16;

        origins[offset] = x;
        origins[offset + 1] = y;
        origins[offset + 2] = z;

        positions[offset] = x;
        positions[offset + 1] = y;
        positions[offset + 2] = z;

        color.set(palette[(lane + sample) % palette.length]).lerp(accent, lane % 2 ? 0.28 : 0.12);
        colors[offset] = color.r;
        colors[offset + 1] = color.g;
        colors[offset + 2] = color.b;
        phases[index] = progress * Math.PI * 7 + lane * 0.9;
        amplitudes[index] = 0.08 + (lane % 3) * 0.035 + Math.sin(progress * Math.PI) * 0.16;
        lanesByIndex[index] = lane;
        masses[index] = 0.72 + lane * 0.05;
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    return { count, geometry, origins, phases, amplitudes, lanesByIndex, masses };
  }, [activeColor]);

  useFrame((state, delta) => {
    if (!points.current) return;

    if (lastBlastKey.current !== blastKey) {
      localBlast.current = state.clock.elapsedTime;
      lastBlastKey.current = blastKey;
    }

    const position = signalSet.geometry.attributes.position as THREE.BufferAttribute;
    const positions = position.array as Float32Array;
    const { origins, phases, amplitudes, lanesByIndex, masses, count } = signalSet;
    const elapsed = state.clock.elapsedTime;
    const pointer = pointerState.current;
    const globalBlastAge = elapsed - localBlast.current;
    const clickBlastAge = elapsed - pointer.blastAt;
    const intro = Math.min(1, elapsed / 3);
    const introSpread = 0.55 + intro * intro * 0.45;
    const movementEnergy = THREE.MathUtils.clamp(pointer.speed / 900, 0, 1);

    for (let index = 0; index < count; index += 1) {
      const offset = index * 3;
      const mass = masses[index];
      const lane = lanesByIndex[index];
      const phase = phases[index];
      const amplitude = amplitudes[index] * (1 + movementEnergy * 0.45);
      const ox = origins[offset] * introSpread;
      const oy =
        origins[offset + 1] +
        Math.sin(phase + elapsed * (1.25 + lane * 0.11)) * amplitude +
        Math.sin(phase * 0.37 + elapsed * 0.68) * amplitude * 0.42 +
        pointer.y * 0.08 * mass;
      const oz =
        origins[offset + 2] +
        Math.cos(phase * 0.62 + elapsed * 0.52) * 0.12 +
        pointer.wheelDepth * 0.18;
      let x = ox + pointer.x * 0.08 * (lane - 2);
      let y = oy;
      let z = oz;

      if (clickBlastAge > 0 && clickBlastAge < 1) {
        const cx = pointer.clickX * 5.4;
        const cy = pointer.clickY * 3.1;
        const bx = x - cx;
        const by = y - cy;
        const bd = Math.max(0.15, Math.hypot(bx, by));
        const power = (1 - clickBlastAge) * 0.32;
        x += (bx / bd) * power;
        y += (by / bd) * power;
        z += Math.sin(index + elapsed) * power * 0.2;
      }

      if (globalBlastAge > 0 && globalBlastAge < 1.1) {
        const pulse = (1 - globalBlastAge / 1.1) * 0.24;
        y += Math.sin(phase + globalBlastAge * Math.PI * 4) * pulse;
        z += Math.cos(phase) * pulse * 0.28;
      }

      const smoothing = Math.min(1, delta * 8);
      positions[offset] = THREE.MathUtils.lerp(positions[offset], x, smoothing);
      positions[offset + 1] = THREE.MathUtils.lerp(positions[offset + 1], y, smoothing);
      positions[offset + 2] = THREE.MathUtils.lerp(positions[offset + 2], z, smoothing);
    }

    position.needsUpdate = true;
    points.current.rotation.y = Math.sin(elapsed * 0.14) * 0.035 + pointer.x * 0.045;
    points.current.rotation.x = pointer.y * 0.025;
  });

  return (
    <>
      <points ref={points} geometry={signalSet.geometry}>
        <pointsMaterial
          vertexColors
          size={0.03}
          transparent
          opacity={0.48}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
      <AudioDesignRig activeColor={activeColor} />
    </>
  );
}

function AudioDesignRig({ activeColor }: { activeColor: string }) {
  const group = useRef<THREE.Group>(null);
  const rings = useRef<Array<THREE.Mesh | null>>([]);
  const meters = useRef<Array<THREE.Mesh | null>>([]);
  const waveLines = useMemo(() => {
    const samples = 96;
    return Array.from({ length: 4 }, (_, index) => {
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(samples * 3), 3));
      const material = new THREE.LineBasicMaterial({
        color: index % 2 ? activeColor : "#00ccff",
        transparent: true,
        opacity: 0.32 - index * 0.035,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      return { geometry, line: new THREE.Line(geometry, material) };
    });
  }, [activeColor]);

  useFrame((state) => {
    if (!group.current) return;
    const elapsed = state.clock.elapsedTime;
    group.current.rotation.y = state.pointer.x * 0.09 + Math.sin(elapsed * 0.16) * 0.035;
    group.current.rotation.x = state.pointer.y * 0.055;
    group.current.position.z = Math.sin(elapsed * 0.24) * 0.18;

    rings.current.forEach((ring, index) => {
      if (!ring) return;
      ring.rotation.z = elapsed * (0.045 + index * 0.012);
      ring.rotation.x = Math.PI / 2 + Math.sin(elapsed * 0.18 + index) * 0.08;
      ring.scale.setScalar(1 + Math.sin(elapsed * 0.9 + index) * 0.018);
    });

    meters.current.forEach((bar, index) => {
      if (!bar) return;
      const band = 0.22 + Math.abs(Math.sin(elapsed * 1.45 + index * 0.37)) * 1.25;
      bar.scale.y = THREE.MathUtils.lerp(bar.scale.y, band, 0.12);
    });

    waveLines.forEach(({ geometry }, lane) => {
      const attribute = geometry.attributes.position as THREE.BufferAttribute;
      const positions = attribute.array as Float32Array;
      const samples = positions.length / 3;
      for (let sample = 0; sample < samples; sample += 1) {
        const offset = sample * 3;
        const progress = sample / (samples - 1);
        positions[offset] = (progress - 0.5) * 7.8;
        positions[offset + 1] =
          (lane - 1.5) * 0.34 +
          Math.sin(progress * Math.PI * (4 + lane) + elapsed * (1 + lane * 0.12)) * (0.08 + lane * 0.02);
        positions[offset + 2] = -1.9 - lane * 0.16 + Math.sin(progress * Math.PI * 2 + elapsed * 0.22) * 0.04;
      }
      attribute.needsUpdate = true;
    });
  });

  return (
    <group ref={group} position={[0, -0.05, -1.8]}>
      <mesh position={[0, 0, -2.45]} rotation={[0.28, 0.08, -0.03]}>
        <boxGeometry args={[5.8, 2.45, 0.12]} />
        <meshPhysicalMaterial
          color="#111111"
          roughness={0.2}
          metalness={0.18}
          transmission={0.48}
          transparent
          opacity={0.13}
          clearcoat={1}
          clearcoatRoughness={0.2}
          emissive={activeColor}
          emissiveIntensity={0.1}
        />
      </mesh>
      {waveLines.map(({ line }, index) => (
        <primitive key={`waveform-${index}`} object={line} />
      ))}
      {Array.from({ length: 5 }, (_, index) => (
        <mesh
          key={`field-ring-${index}`}
          ref={(node) => {
            rings.current[index] = node;
          }}
          position={[0, 0.05, -2.05 - index * 0.12]}
          rotation={[Math.PI / 2, 0, index * 0.2]}
        >
          <torusGeometry args={[1.1 + index * 0.42, 0.006, 10, 160]} />
          <meshBasicMaterial
            color={index % 2 ? activeColor : "#00ffd1"}
            transparent
            opacity={0.18 - index * 0.02}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}
      {Array.from({ length: 30 }, (_, index) => {
        const x = (index - 14.5) * 0.18;
        const hot = index % 7 === 0;
        return (
          <mesh
            key={`meter-${index}`}
            ref={(node) => {
              meters.current[index] = node;
            }}
            position={[x, -1.28, -1.62]}
          >
            <boxGeometry args={[0.055, 0.52, 0.035]} />
            <meshStandardMaterial
              color={hot ? "#ff0080" : "#00ccff"}
              emissive={hot ? "#ff0080" : activeColor}
              emissiveIntensity={hot ? 0.95 : 0.7}
              transparent
              opacity={0.55}
              roughness={0.4}
              metalness={0.55}
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

    const sampleWidth = 78;
    const sampleHeight = 44;
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

    for (let y = 0; y < sampleHeight; y += 3) {
      for (let x = 0; x < sampleWidth; x += 3) {
        const offset = (y * sampleWidth + x) * 4;
        const r = data[offset] / 255;
        const g = data[offset + 1] / 255;
        const b = data[offset + 2] / 255;
        const brightness = (r + g + b) / 3;
        if (brightness < 0.06) continue;

        positions.push(
          (x / sampleWidth - 0.5) * 6.6,
          -(y / sampleHeight - 0.5) * 3.75,
          (brightness - 0.5) * 0.42 + (Math.random() - 0.5) * 0.12,
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
    points.current.rotation.y = -0.2 + state.pointer.x * 0.05 + Math.sin(state.clock.elapsedTime * 0.18) * 0.018;
    points.current.rotation.x = 0.08 + state.pointer.y * 0.025;
    points.current.position.z = -4.1 + Math.sin(state.clock.elapsedTime * 0.32) * 0.12;
  });

  return (
    <group position={[0, 0.04, -4.1]} rotation={[0.08, -0.2, -0.06]}>
      <points ref={points} geometry={geometry}>
        <pointsMaterial
          vertexColors
          size={0.038}
          transparent
          opacity={0.36}
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
        <AudioSignalField activeColor={activeColor} blastKey={blastKey} />
      </Canvas>
    </div>
  );
}
