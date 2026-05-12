"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

function SphereRig() {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    group.current.rotation.y = state.clock.elapsedTime * 0.18;
    group.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.4) * 0.22;
  });

  return (
    <group ref={group}>
      <mesh>
        <icosahedronGeometry args={[1.05, 4]} />
        <meshPhysicalMaterial
          color="#050505"
          metalness={0.82}
          roughness={0.18}
          wireframe
          emissive="#00FFD1"
          emissiveIntensity={0.55}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.72, 48, 48]} />
        <meshPhysicalMaterial
          color="#101010"
          metalness={0.72}
          roughness={0.16}
          transparent
          opacity={0.42}
          emissive="#2563EB"
          emissiveIntensity={0.32}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.45, 0.012, 16, 140]} />
        <meshStandardMaterial color="#36FF7A" emissive="#36FF7A" emissiveIntensity={1.4} />
      </mesh>
    </group>
  );
}

export default function SoundSphere() {
  return (
    <Canvas camera={{ position: [0, 0, 4.2], fov: 45 }} dpr={[1, 1.5]} gl={{ alpha: true, antialias: true }}>
      <ambientLight intensity={0.32} />
      <pointLight position={[1.8, 2.5, 2.8]} intensity={2} color="#00FFD1" />
      <pointLight position={[-2, -1, 2]} intensity={1.2} color="#FF3B30" />
      <SphereRig />
    </Canvas>
  );
}

