"use client";

import { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { GlassesModel, type LensTarget } from "./GlassesModel";
import { GlassesLoading } from "./GlassesLoading";
import { GlassesGlyph } from "./GlassesGlyph";
import { CanvasBoundary } from "./CanvasBoundary";
import { CameraRig } from "./CameraRig";

export function GlassesCanvas({ active = false }: { active?: boolean }) {
  const lensRef = useRef<LensTarget | null>(null);
  const modelRadiusRef = useRef(1);

  return (
    <div className="pointer-events-none relative h-full w-full">
      <CanvasBoundary
        fallback={
          <div className="flex h-full w-full items-center justify-center p-8">
            <GlassesGlyph />
          </div>
        }
      >
        <Canvas
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true }}
          camera={{ position: [0, 0, 6], fov: 32 }}
          style={{ pointerEvents: "none" }}
        >
          <ambientLight intensity={0.65} />
          <directionalLight position={[3, 4, 5]} intensity={2.4} />
          <directionalLight position={[-4, -2, -3]} intensity={0.4} />
          <Suspense fallback={<GlassesLoading />}>
            <GlassesModel active={active} lensRef={lensRef} modelRadiusRef={modelRadiusRef} />
          </Suspense>
          <CameraRig active={active} lensRef={lensRef} modelRadiusRef={modelRadiusRef} />
        </Canvas>
      </CanvasBoundary>
    </div>
  );
}
