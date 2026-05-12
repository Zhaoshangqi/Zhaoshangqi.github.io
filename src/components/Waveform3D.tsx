"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

function WaveBars({ color }: { color: string }) {
  const refs = useRef<Array<THREE.Mesh | null>>([]);

  useFrame((state) => {
    refs.current.forEach((bar, index) => {
      if (!bar) return;
      const wave = Math.sin(state.clock.elapsedTime * 3 + index * 0.55);
      bar.scale.y = 0.35 + Math.abs(wave) * 1.9;
      bar.position.z = Math.sin(state.clock.elapsedTime * 1.2 + index * 0.21) * 0.38;
    });
  });

  return (
    <group rotation={[0.1, -0.42, 0]}>
      {Array.from({ length: 42 }, (_, index) => (
        <mesh
          key={index}
          ref={(node) => {
            refs.current[index] = node;
          }}
          position={[(index - 21) * 0.11, 0, 0]}
        >
          <boxGeometry args={[0.045, 0.55, 0.05]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.8} />
        </mesh>
      ))}
    </group>
  );
}

export default function Waveform3D({ color = "#00FFD1" }: { color?: string }) {
  return (
    <Canvas camera={{ position: [0, 1.4, 6], fov: 46 }} dpr={[1, 1.5]} gl={{ alpha: true, antialias: true }}>
      <ambientLight intensity={0.28} />
      <pointLight position={[2, 3, 3]} color={color} intensity={2.2} />
      <WaveBars color={color} />
    </Canvas>
  );
}

