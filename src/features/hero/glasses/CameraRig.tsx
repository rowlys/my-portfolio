"use client";

import { useRef, type RefObject } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useReducedMotion } from "framer-motion";
import { ZOOM_LAMBDA, ZOOM_OUT_LAMBDA } from "../../transitions/menuTiming";
import type { LensTarget } from "./GlassesModel";

const IDLE_FILL_FRACTION = 0.65;
const IDLE_NDC_X = -0.3;
const IDLE_NDC_Y = 0;
const LENS_OVERSHOOT = 0.32;
const MAX_DELTA = 1 / 30;

export function CameraRig({
  active,
  lensRef,
  modelRadiusRef,
}: {
  active: boolean;
  lensRef: RefObject<LensTarget | null>;
  modelRadiusRef: RefObject<number>;
}) {
  const { camera, size } = useThree();
  const prefersReducedMotion = useReducedMotion();
  const progress = useRef(active ? 1 : 0);

  const idlePosition = useRef(new THREE.Vector3());
  const idleLookAt = useRef(new THREE.Vector3());
  const dollyPosition = useRef(new THREE.Vector3());
  const finalPosition = useRef(new THREE.Vector3());
  const finalLookAt = useRef(new THREE.Vector3());
  const worldSphere = useRef(new THREE.Sphere());

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, MAX_DELTA);
    const perspective = camera as THREE.PerspectiveCamera;
    const verticalFov = THREE.MathUtils.degToRad(perspective.fov);
    const aspect = size.width / size.height;
    const halfTan = Math.tan(verticalFov / 2);

    const modelRadius = modelRadiusRef.current;
    const idleDistance = modelRadius / (IDLE_FILL_FRACTION * halfTan);
    const idleHalfHeight = idleDistance * halfTan;
    const idleHalfWidth = idleHalfHeight * aspect;

    idlePosition.current.set(0, 0, idleDistance);
    idleLookAt.current.set(-IDLE_NDC_X * idleHalfWidth, -IDLE_NDC_Y * idleHalfHeight, 0);

    const targetProgress = active ? 1 : 0;
    progress.current = prefersReducedMotion
      ? targetProgress
      : THREE.MathUtils.damp(progress.current, targetProgress, active ? ZOOM_LAMBDA : ZOOM_OUT_LAMBDA, delta);

    const target = lensRef.current;
    if (progress.current < 0.001 || !target) {
      camera.position.copy(idlePosition.current);
      camera.lookAt(idleLookAt.current);
      return;
    }

    worldSphere.current.copy(target.localSphere).applyMatrix4(target.object.matrixWorld);
    const fillDistance = worldSphere.current.radius / (halfTan * Math.max(1, aspect));
    const dollyDistance = fillDistance * LENS_OVERSHOOT;

    dollyPosition.current
      .copy(idlePosition.current)
      .sub(worldSphere.current.center)
      .normalize()
      .multiplyScalar(dollyDistance)
      .add(worldSphere.current.center);

    finalPosition.current.lerpVectors(idlePosition.current, dollyPosition.current, progress.current);
    finalLookAt.current.lerpVectors(idleLookAt.current, worldSphere.current.center, progress.current);

    camera.position.copy(finalPosition.current);
    camera.lookAt(finalLookAt.current);
  });

  return null;
}
