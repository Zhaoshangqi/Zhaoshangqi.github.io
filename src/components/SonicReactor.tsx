"use client";

import { Float } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

type SonicReactorProps = {
  activeColor?: string;
  blast?: number;
  compact?: boolean;
};

function ReactorParticles({ color }: { color: string }) {
  const points = useRef<THREE.Points>(null);
  const geometry = useMemo(() => {
    const count = 720;
    const positions = new Float32Array(count * 3);

    for (let index = 0; index < count; index += 1) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 1.8 + Math.random() * 2.8;
      const band = (Math.random() - 0.5) * 1.35;
      positions[index * 3] = Math.cos(angle) * radius;
      positions[index * 3 + 1] = band;
      positions[index * 3 + 2] = Math.sin(angle) * radius;
    }

    const buffer = new THREE.BufferGeometry();
    buffer.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return buffer;
  }, []);

  useFrame((state) => {
    if (!points.current) return;
    points.current.rotation.y = state.clock.elapsedTime * 0.12;
    points.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.08;
  });

  return (
    <points ref={points} geometry={geometry}>
      <pointsMaterial
        color={color}
        size={0.025}
        transparent
        opacity={0.85}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function SpectrumBars({ color }: { color: string }) {
  const refs = useRef<Array<THREE.Mesh | null>>([]);

  useFrame((state) => {
    refs.current.forEach((bar, index) => {
      if (!bar) return;
      const pulse = 0.42 + Math.sin(state.clock.elapsedTime * 2.6 + index * 0.7) * 0.28;
      bar.scale.y = 0.45 + Math.abs(pulse) * 1.25;
      bar.position.y = -1.8 + bar.scale.y * 0.08;
    });
  });

  return (
    <group position={[0, -0.18, 0]} rotation={[0.05, 0, 0]}>
      {Array.from({ length: 34 }, (_, index) => {
        const x = (index - 16.5) * 0.11;
        return (
          <mesh
            key={index}
            ref={(node) => {
              refs.current[index] = node;
            }}
            position={[x, -1.85, 0.08]}
          >
            <boxGeometry args={[0.045, 0.28, 0.045]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.2} />
          </mesh>
        );
      })}
    </group>
  );
}

function ReactorCore({ activeColor, blast = 0, compact = false }: Required<SonicReactorProps>) {
  const group = useRef<THREE.Group>(null);
  const ringA = useRef<THREE.Mesh>(null);
  const ringB = useRef<THREE.Mesh>(null);
  const { pointer } = useThree();

  useFrame((state) => {
    if (!group.current) return;

    const scroll = typeof window === "undefined" ? 0 : Math.min(1, window.scrollY / 900);
    const blastScale = blast ? 1.12 + Math.sin(state.clock.elapsedTime * 10) * 0.08 : 1;
    group.current.rotation.y += 0.006;
    group.current.rotation.x += (pointer.y * 0.35 - group.current.rotation.x) * 0.05;
    group.current.rotation.z += (pointer.x * 0.18 - group.current.rotation.z) * 0.05;
    group.current.scale.setScalar((compact ? 0.72 : 1) * blastScale * (1 + scroll * 0.06));

    if (ringA.current) {
      ringA.current.rotation.x = state.clock.elapsedTime * 0.55;
      ringA.current.rotation.z = state.clock.elapsedTime * 0.42;
      ringA.current.position.x = scroll * 0.4;
    }

    if (ringB.current) {
      ringB.current.rotation.y = state.clock.elapsedTime * -0.5;
      ringB.current.rotation.z = state.clock.elapsedTime * 0.28;
      ringB.current.position.x = -scroll * 0.4;
    }
  });

  return (
    <group ref={group}>
      <Float speed={1.3} rotationIntensity={0.25} floatIntensity={0.45}>
        <mesh>
          <sphereGeometry args={[0.72, 64, 64]} />
          <meshPhysicalMaterial
            color="#050505"
            roughness={0.18}
            metalness={0.72}
            clearcoat={1}
            emissive={activeColor}
            emissiveIntensity={0.35}
          />
        </mesh>
        <mesh ref={ringA}>
          <torusGeometry args={[1.18, 0.018, 16, 160]} />
          <meshStandardMaterial color={activeColor} emissive={activeColor} emissiveIntensity={2.2} />
        </mesh>
        <mesh ref={ringB} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.55, 0.012, 16, 160]} />
          <meshStandardMaterial color="#2563EB" emissive="#2563EB" emissiveIntensity={1.8} />
        </mesh>
        <mesh rotation={[0.7, 0.3, 0.6]}>
          <boxGeometry args={[1.15, 1.15, 1.15]} />
          <meshPhysicalMaterial
            color="#101010"
            roughness={0.12}
            metalness={0.9}
            transparent
            opacity={0.18}
            emissive="#00FFD1"
            emissiveIntensity={0.2}
          />
        </mesh>
        <SpectrumBars color={activeColor} />
        <ReactorParticles color={activeColor} />
      </Float>
    </group>
  );
}

export default function SonicReactor({
  activeColor = "#00FFD1",
  blast = 0,
  compact = false,
}: SonicReactorProps) {
  return (
    <Canvas
      camera={{ position: [0, 0.25, compact ? 6.4 : 5.4], fov: 43 }}
      dpr={[1, 1.8]}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.28} />
      <pointLight position={[2.5, 2.2, 3.5]} intensity={2.4} color="#00FFD1" />
      <pointLight position={[-3, -1, 2]} intensity={1.2} color="#FF3B30" />
      <ReactorCore activeColor={activeColor} blast={blast} compact={compact} />
    </Canvas>
  );
}

