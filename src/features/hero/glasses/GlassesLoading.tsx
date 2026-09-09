"use client";

import { useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useThemeColors } from "@/hooks/useThemeColors";

export function GlassesLoading() {
  const ring = useRef<THREE.Mesh>(null);
  const colors = useThemeColors();

  useFrame((state) => {
    if (!ring.current) return;
    const pulse = 0.55 + Math.sin(state.clock.elapsedTime * 2.4) * 0.25;
    const material = ring.current.material as THREE.MeshBasicMaterial;
    material.opacity = pulse;
    ring.current.rotation.z = state.clock.elapsedTime * 0.5;
  });

  return (
    <mesh ref={ring}>
      <torusGeometry args={[0.7, 0.035, 16, 64]} />
      <meshBasicMaterial color={colors.accent} transparent opacity={0.6} />
    </mesh>
  );
}
