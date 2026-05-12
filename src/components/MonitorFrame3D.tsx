"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

function Frame({ color = "#00FFD1" }: { color?: string }) {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.6) * 0.04;
    group.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.5) * 0.025;
  });

  return (
    <group ref={group} position={[0, 0, 0]}>
      <mesh position={[0, 1.14, 0]}>
        <boxGeometry args={[3.4, 0.075, 0.12]} />
        <meshStandardMaterial color="#050505" metalness={0.8} roughness={0.22} emissive={color} emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[0, -1.14, 0]}>
        <boxGeometry args={[3.4, 0.075, 0.12]} />
        <meshStandardMaterial color="#050505" metalness={0.8} roughness={0.22} emissive={color} emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[-1.72, 0, 0]}>
        <boxGeometry args={[0.075, 2.35, 0.12]} />
        <meshStandardMaterial color="#050505" metalness={0.8} roughness={0.22} emissive={color} emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[1.72, 0, 0]}>
        <boxGeometry args={[0.075, 2.35, 0.12]} />
        <meshStandardMaterial color="#050505" metalness={0.8} roughness={0.22} emissive={color} emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[0, 0, -0.08]}>
        <planeGeometry args={[3.45, 2.35]} />
        <meshBasicMaterial color={color} transparent opacity={0.08} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

export default function MonitorFrame3D({ color = "#00FFD1" }: { color?: string }) {
  return (
    <Canvas camera={{ position: [0, 0, 4.2], fov: 42 }} dpr={[1, 1.5]} gl={{ alpha: true, antialias: true }}>
      <ambientLight intensity={0.45} />
      <pointLight position={[0, 1.5, 3]} intensity={1.7} color={color} />
      <Frame color={color} />
    </Canvas>
  );
}

