"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useReducedMotion } from "framer-motion";
import { useThemeColors } from "@/hooks/useThemeColors";
import {
  IMPACT_TIME,
  SETTLE_TIME,
  ZOOM_LAMBDA,
  ZOOM_OUT_LAMBDA,
  ZOOM_SETTLE_DELAY,
  BACKGROUND_FADE_DURATION,
} from "../menuTiming";

const MODEL_PATH = "/models/glasses-optimized.glb";
const TARGET_SIZE = 2.6;
const OUTLINE_WIDTH = 0.008;

const REST_ROTATION: [number, number, number] = [0.3, 0.72, -0.95];
const TUMBLE_OFFSET: [number, number, number] = [0.28, -0.32, 0.38];
const ACTIVE_ROTATION: [number, number, number] = [0.05, -0.15, 0.02];
const REST_POSITION_X = 0.3;
const GLINT_SWEEP_DURATION = 0.5;
const MAX_DELTA = 1 / 30;

function createOutlineGeometry(geometry: THREE.BufferGeometry, width: number) {
  const outlineGeometry = geometry.clone();
  const position = outlineGeometry.attributes.position as THREE.BufferAttribute;
  const normal = outlineGeometry.attributes.normal as THREE.BufferAttribute;
  const vertex = new THREE.Vector3();
  const vertexNormal = new THREE.Vector3();
  for (let i = 0; i < position.count; i++) {
    vertex.fromBufferAttribute(position, i);
    vertexNormal.fromBufferAttribute(normal, i);
    vertex.addScaledVector(vertexNormal, width);
    position.setXYZ(i, vertex.x, vertex.y, vertex.z);
  }
  position.needsUpdate = true;
  return outlineGeometry;
}

function computeHalfSphere(geometry: THREE.BufferGeometry, side: "min" | "max") {
  const position = geometry.attributes.position as THREE.BufferAttribute;
  let minX = Infinity;
  let maxX = -Infinity;
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
  }
  const splitX = (minX + maxX) / 2;

  const center = new THREE.Vector3();
  let count = 0;
  const point = new THREE.Vector3();
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    if ((side === "min" && x < splitX) || (side === "max" && x >= splitX)) {
      center.add(point.set(x, position.getY(i), position.getZ(i)));
      count += 1;
    }
  }
  center.divideScalar(count || 1);

  let radius = 0;
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i);
    if ((side === "min" && x < splitX) || (side === "max" && x >= splitX)) {
      point.set(x, position.getY(i), position.getZ(i));
      radius = Math.max(radius, point.distanceTo(center));
    }
  }
  return new THREE.Sphere(center, radius);
}

export type LensTarget = { object: THREE.Object3D; localSphere: THREE.Sphere };

function createToonRamp() {
  const data = new Uint8Array([40, 40, 110, 110, 190, 190, 255, 255]);
  const texture = new THREE.DataTexture(data, 4, 1, THREE.RedFormat);
  texture.needsUpdate = true;
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  return texture;
}

type LensShaderUniforms = {
  uSweepCenter: { value: number };
  uSweepWidth: { value: number };
  uSweepStrength: { value: number };
  uSweepColor: { value: THREE.Color };
  uFlatBlend: { value: number };
  uFlatColor: { value: THREE.Color };
};

function installLensSweep(material: THREE.MeshToonMaterial) {
  material.onBeforeCompile = (shader) => {
    shader.uniforms.uSweepCenter = { value: 0 };
    shader.uniforms.uSweepWidth = { value: 0.35 };
    shader.uniforms.uSweepStrength = { value: 0 };
    shader.uniforms.uSweepColor = { value: new THREE.Color(0xffffff) };
    shader.uniforms.uFlatBlend = { value: 0 };
    shader.uniforms.uFlatColor = { value: new THREE.Color(0x000000) };

    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vLensLocalPosition;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvLensLocalPosition = position;");

    shader.fragmentShader = shader.fragmentShader
      .replace(
        "#include <common>",
        "#include <common>\nvarying vec3 vLensLocalPosition;\nuniform float uSweepCenter;\nuniform float uSweepWidth;\nuniform float uSweepStrength;\nuniform vec3 uSweepColor;\nuniform float uFlatBlend;\nuniform vec3 uFlatColor;",
      )
      .replace(
        "#include <emissivemap_fragment>",
        `#include <emissivemap_fragment>
        float sweepDist = abs(vLensLocalPosition.x - uSweepCenter);
        float sweepGlow = (1.0 - smoothstep(0.0, uSweepWidth, sweepDist)) * uSweepStrength;
        totalEmissiveRadiance += uSweepColor * sweepGlow;`,
      )
      .replace(
        "#include <colorspace_fragment>",
        "#include <colorspace_fragment>\ngl_FragColor.rgb = mix(gl_FragColor.rgb, uFlatColor, uFlatBlend);",
      );

    material.userData.lensShader = shader as unknown as { uniforms: LensShaderUniforms };
  };
}

export function GlassesModel({
  active = false,
  lensRef,
  modelRadiusRef,
}: {
  active?: boolean;
  lensRef?: RefObject<LensTarget | null>;
  modelRadiusRef?: RefObject<number>;
}) {
  const group = useRef<THREE.Group>(null);
  const { scene } = useGLTF(MODEL_PATH);
  const colors = useThemeColors();
  const prefersReducedMotion = useReducedMotion();
  const gradientMap = useMemo(() => createToonRamp(), []);

  const frameMaterial = useMemo(
    () => new THREE.MeshToonMaterial({ gradientMap }),
    [gradientMap],
  );
  const lensMaterial = useMemo(() => {
    const material = new THREE.MeshToonMaterial({
      gradientMap,
      emissiveIntensity: 0,
      side: THREE.DoubleSide,
    });
    installLensSweep(material);
    return material;
  }, [gradientMap]);
  const outlineMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        side: THREE.BackSide,
      }),
    [],
  );

  const { wrapper: model, lensTarget, modelRadius, lensXRange } = useMemo(() => {
    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const scale = TARGET_SIZE / Math.max(size.x, size.y, size.z, 0.0001);

    clone.position.sub(center);

    const wrapper = new THREE.Group();
    wrapper.add(clone);
    wrapper.scale.setScalar(scale);

    const meshes: THREE.Mesh[] = [];
    clone.traverse((child) => {
      if (child instanceof THREE.Mesh) meshes.push(child);
    });

    const lenses: THREE.Mesh[] = [];
    meshes.forEach((mesh) => {
      const sourceMaterial = Array.isArray(mesh.material)
        ? mesh.material[0]
        : mesh.material;
      const isLens = sourceMaterial?.transparent === true;
      mesh.material = isLens ? lensMaterial : frameMaterial;
      if (isLens) lenses.push(mesh);

      if (!isLens) {
        const outline = new THREE.Mesh(createOutlineGeometry(mesh.geometry, OUTLINE_WIDTH), outlineMaterial);
        outline.renderOrder = -1;
        mesh.add(outline);
      }
    });

    let widestLens: THREE.Mesh | null = null;
    let widestExtent = -Infinity;
    let lensMinX = Infinity;
    let lensMaxX = -Infinity;
    lenses.forEach((mesh) => {
      mesh.geometry.computeBoundingBox();
      const bbox = mesh.geometry.boundingBox;
      const extent = bbox ? bbox.max.x - bbox.min.x : 0;
      if (extent > widestExtent) {
        widestExtent = extent;
        widestLens = mesh;
      }
      if (bbox) {
        lensMinX = Math.min(lensMinX, bbox.min.x);
        lensMaxX = Math.max(lensMaxX, bbox.max.x);
      }
    });
    const lensXRange = { min: lensMinX, max: lensMaxX };

    let lensTarget: LensTarget | null = null;
    if (widestLens) {
      const mesh: THREE.Mesh = widestLens;
      lensTarget = { object: mesh, localSphere: computeHalfSphere(mesh.geometry, "min") };
    }

    const modelRadius = new THREE.Box3()
      .setFromObject(wrapper)
      .getBoundingSphere(new THREE.Sphere()).radius;

    return { wrapper, lensTarget, modelRadius, lensXRange };
  }, [scene, frameMaterial, lensMaterial, outlineMaterial]);

  useEffect(() => {
    if (lensRef) lensRef.current = lensTarget;
    if (modelRadiusRef) modelRadiusRef.current = modelRadius;
  }, [lensTarget, lensRef, modelRadius, modelRadiusRef]);

  const lensXRangeRef = useRef(lensXRange);
  useEffect(() => {
    lensXRangeRef.current = lensXRange;
  }, [lensXRange]);

  const lensMaterialRef = useRef(lensMaterial);
  const lensBaseColorRef = useRef(new THREE.Color());

  useEffect(() => {
    frameMaterial.color.set(colors.foreground);
    lensBaseColorRef.current.set(colors.accent);
    lensMaterial.color.set(colors.accent);
    lensMaterial.emissive.set(colors.accent);
    outlineMaterial.color.set(colors.foreground);
    lensMaterialRef.current = lensMaterial;
  }, [colors, frameMaterial, lensMaterial, outlineMaterial]);

  const startsActiveRef = useRef(active);

  const tumbleStart = useRef<number | null>(null);
  const activeBlend = useRef(active ? 1 : 0);
  const activeStart = useRef<number | null>(null);
  const inactiveStart = useRef<number | null>(null);

  useFrame((state, rawDelta) => {
    if (!group.current) return;
    const delta = Math.min(rawDelta, MAX_DELTA);
    const t = state.clock.elapsedTime;
    if (tumbleStart.current === null) {
      if (startsActiveRef.current) {
        tumbleStart.current = t - SETTLE_TIME - 2;
        activeStart.current = t - ZOOM_SETTLE_DELAY - BACKGROUND_FADE_DURATION - 1;
        group.current.rotation.set(ACTIVE_ROTATION[0], ACTIVE_ROTATION[1], ACTIVE_ROTATION[2]);
      } else {
        tumbleStart.current = t;
        group.current.rotation.set(
          REST_ROTATION[0] + (prefersReducedMotion ? 0 : TUMBLE_OFFSET[0]),
          REST_ROTATION[1] + (prefersReducedMotion ? 0 : TUMBLE_OFFSET[1]),
          REST_ROTATION[2] + (prefersReducedMotion ? 0 : TUMBLE_OFFSET[2]),
        );
      }
    }
    const elapsed = t - tumbleStart.current;
    const settle = prefersReducedMotion ? 1 : Math.min(elapsed / IMPACT_TIME, 1);
    const lambda = 2.4 + settle * 2.2;

    const idleX = prefersReducedMotion ? 0 : Math.sin(t * 0.4) * 0.015;
    const idleZ = prefersReducedMotion ? 0 : Math.sin(t * 0.33 + 1) * 0.012;

    const restRotX = REST_ROTATION[0] + TUMBLE_OFFSET[0] * (1 - settle) + idleX;
    const restRotY = REST_ROTATION[1] + TUMBLE_OFFSET[1] * (1 - settle);
    const restRotZ = REST_ROTATION[2] + TUMBLE_OFFSET[2] * (1 - settle) + idleZ;

    const targetActiveBlend = active ? 1 : 0;
    activeBlend.current = prefersReducedMotion
      ? targetActiveBlend
      : THREE.MathUtils.damp(activeBlend.current, targetActiveBlend, active ? ZOOM_LAMBDA : ZOOM_OUT_LAMBDA, delta);
    const targetRotX = THREE.MathUtils.lerp(restRotX, ACTIVE_ROTATION[0], activeBlend.current);
    const targetRotY = THREE.MathUtils.lerp(restRotY, ACTIVE_ROTATION[1], activeBlend.current);
    const targetRotZ = THREE.MathUtils.lerp(restRotZ, ACTIVE_ROTATION[2], activeBlend.current);

    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, targetRotX, lambda, delta);
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, targetRotY, lambda, delta);
    group.current.rotation.z = THREE.MathUtils.damp(group.current.rotation.z, targetRotZ, lambda, delta);

    const idleWobbleY = prefersReducedMotion ? 0 : Math.sin(t * 0.5) * 0.015;
    const targetPositionX = prefersReducedMotion ? 0 : REST_POSITION_X;
    group.current.position.x = THREE.MathUtils.damp(group.current.position.x, targetPositionX, 3.2, delta);
    group.current.position.y = THREE.MathUtils.damp(group.current.position.y, idleWobbleY, 3.2, delta);
    group.current.position.z = THREE.MathUtils.damp(group.current.position.z, 0, 3.2, delta);

    let targetScaleY = 1;
    let targetScaleXZ = 1;
    if (!prefersReducedMotion) {
      if (elapsed < IMPACT_TIME) {
        const fallProgress = elapsed / IMPACT_TIME;
        targetScaleY = 1 + fallProgress * 0.04;
        targetScaleXZ = 1 - fallProgress * 0.025;
      } else {
        const squashDecay = Math.exp(-(elapsed - IMPACT_TIME) * 6);
        targetScaleY = 1 - squashDecay * 0.12;
        targetScaleXZ = 1 + squashDecay * 0.07;
      }
    }
    group.current.scale.x = THREE.MathUtils.damp(group.current.scale.x, targetScaleXZ, 18, delta);
    group.current.scale.y = THREE.MathUtils.damp(group.current.scale.y, targetScaleY, 14, delta);
    group.current.scale.z = THREE.MathUtils.damp(group.current.scale.z, targetScaleXZ, 18, delta);

    const settleAt = prefersReducedMotion ? 0 : SETTLE_TIME;
    const sinceSettle = elapsed - settleAt;
    const lensShader = lensMaterialRef.current.userData.lensShader as
      | { uniforms: LensShaderUniforms }
      | undefined;
    if (active) {
      if (activeStart.current === null) activeStart.current = t;
      inactiveStart.current = null;
    } else {
      activeStart.current = null;
      if (inactiveStart.current === null) inactiveStart.current = t;
    }
    let colorBlend: number;
    if (prefersReducedMotion) {
      colorBlend = active ? 1 : 0;
    } else if (active) {
      const sinceActive = activeStart.current === null ? 0 : t - activeStart.current;
      colorBlend = THREE.MathUtils.clamp((sinceActive - ZOOM_SETTLE_DELAY) / BACKGROUND_FADE_DURATION, 0, 1);
    } else {
      const sinceInactive = inactiveStart.current === null ? 0 : t - inactiveStart.current;
      colorBlend = 1 - THREE.MathUtils.clamp(sinceInactive / BACKGROUND_FADE_DURATION, 0, 1);
    }

    if (lensShader) {
      const range = lensXRangeRef.current;
      const span = Math.max(range.max - range.min, 0.0001);
      const pad = span * 0.35;
      const sweepStart = range.max + pad;
      const sweepEnd = range.min - pad;
      const sweepProgress = THREE.MathUtils.clamp(sinceSettle / GLINT_SWEEP_DURATION, 0, 1);
      lensShader.uniforms.uSweepCenter.value = THREE.MathUtils.lerp(sweepStart, sweepEnd, sweepProgress);
      lensShader.uniforms.uSweepWidth.value = span * 0.25;
      lensShader.uniforms.uSweepStrength.value =
        sinceSettle > 0 && sinceSettle < GLINT_SWEEP_DURATION ? 1.6 : 0;
      lensShader.uniforms.uSweepColor.value.set(colors.accentStrong);

      lensShader.uniforms.uFlatBlend.value = colorBlend;
      lensBaseColorRef.current.getRGB(lensShader.uniforms.uFlatColor.value, THREE.SRGBColorSpace);
    }
  });

  return (
    <group ref={group} rotation={REST_ROTATION}>
      <primitive object={model} />
    </group>
  );
}

useGLTF.preload(MODEL_PATH);
