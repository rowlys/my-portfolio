"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useReducedMotion } from "framer-motion";
import { useThemeColors } from "@/hooks/useThemeColors";
import {
  SETTLE_TIME,
  ZOOM_LAMBDA,
  ZOOM_OUT_LAMBDA,
} from "../../transitions/menuTiming";

const MODEL_PATH = "/models/glasses-optimized.glb";
const TARGET_SIZE = 2.6;
const OUTLINE_WIDTH = 0.008;

const REST_ROTATION: [number, number, number] = [0.3, 0.72, -0.95];
const ACTIVE_ROTATION: [number, number, number] = [0.05, -0.15, 0.02];
const SIDE_SPIN_ANGLE = Math.PI * -4;
const WORLD_UP = new THREE.Vector3(0, 1, 0);
const REST_POSITION_X = 0.3;
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

export function GlassesModel({
  active = false,
  centered = false,
  lensRef,
  modelRadiusRef,
}: {
  active?: boolean;
  centered?: boolean;
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
  const lensMaterial = useMemo(
    () => new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, toneMapped: false }),
    [],
  );
  const outlineMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        side: THREE.BackSide,
      }),
    [],
  );

  const { wrapper: model, lensTarget, modelRadius } = useMemo(() => {
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
    lenses.forEach((mesh) => {
      mesh.geometry.computeBoundingBox();
      const bbox = mesh.geometry.boundingBox;
      const extent = bbox ? bbox.max.x - bbox.min.x : 0;
      if (extent > widestExtent) {
        widestExtent = extent;
        widestLens = mesh;
      }
    });

    let lensTarget: LensTarget | null = null;
    if (widestLens) {
      const mesh: THREE.Mesh = widestLens;
      lensTarget = { object: mesh, localSphere: computeHalfSphere(mesh.geometry, "min") };
    }

    const modelRadius = new THREE.Box3()
      .setFromObject(wrapper)
      .getBoundingSphere(new THREE.Sphere()).radius;

    return { wrapper, lensTarget, modelRadius };
  }, [scene, frameMaterial, lensMaterial, outlineMaterial]);

  useEffect(() => {
    if (lensRef) lensRef.current = lensTarget;
    if (modelRadiusRef) modelRadiusRef.current = modelRadius;
  }, [lensTarget, lensRef, modelRadius, modelRadiusRef]);

  useEffect(() => {
    frameMaterial.color.set(colors.foreground);
    lensMaterial.color.set(colors.accent);
    outlineMaterial.color.set(colors.foreground);
  }, [colors, frameMaterial, lensMaterial, outlineMaterial]);

  const startsActiveRef = useRef(active);

  const spinQuaternionRef = useRef(new THREE.Quaternion());
  const idleEulerRef = useRef(new THREE.Euler());
  const idleQuaternionRef = useRef(new THREE.Quaternion());

  const tumbleStart = useRef<number | null>(null);
  const activeBlend = useRef(active ? 1 : 0);

  useFrame((state, rawDelta) => {
    if (!group.current) return;
    const delta = Math.min(rawDelta, MAX_DELTA);
    const t = state.clock.elapsedTime;
    if (tumbleStart.current === null) {
      if (startsActiveRef.current) {
        tumbleStart.current = t - SETTLE_TIME - 2;
        group.current.rotation.set(ACTIVE_ROTATION[0], ACTIVE_ROTATION[1], ACTIVE_ROTATION[2]);
      } else {
        tumbleStart.current = t;
        group.current.rotation.set(REST_ROTATION[0], REST_ROTATION[1], REST_ROTATION[2]);
      }
    }
    const elapsed = t - tumbleStart.current;
    const settle = prefersReducedMotion ? 1 : Math.min(elapsed / SETTLE_TIME, 1);

    const idleX = prefersReducedMotion ? 0 : Math.sin(t * 0.2) * 0.15;
    const idleY = prefersReducedMotion ? 0 : Math.sin(t * 0.2 + 2) * 0.1;
    const idleZ = prefersReducedMotion ? 0 : Math.sin(t * 0.23 + 1) * 0.1;

    if (settle < 1) {
      const eased = 1 - Math.pow(1 - settle, 3);
      const spinAngle = SIDE_SPIN_ANGLE * (1 - eased);
      spinQuaternionRef.current.setFromAxisAngle(WORLD_UP, spinAngle);
      idleQuaternionRef.current.setFromEuler(
        idleEulerRef.current.set(REST_ROTATION[0] + idleX, REST_ROTATION[1] + idleY, REST_ROTATION[2] + idleZ),
      );
      group.current.quaternion.multiplyQuaternions(spinQuaternionRef.current, idleQuaternionRef.current);
    } else {
      const lambda = 4.6;

      const restRotX = REST_ROTATION[0] + idleX;
      const restRotY = REST_ROTATION[1] + idleY;
      const restRotZ = REST_ROTATION[2] + idleZ;

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
    }

    const idleWobbleY = prefersReducedMotion ? 0 : Math.sin(t * 0.5) * 0.015;
    const targetPositionX = prefersReducedMotion || centered ? 0 : REST_POSITION_X;
    group.current.position.x = THREE.MathUtils.damp(group.current.position.x, targetPositionX, 3.2, delta);
    group.current.position.y = THREE.MathUtils.damp(group.current.position.y, idleWobbleY, 3.2, delta);
    group.current.position.z = THREE.MathUtils.damp(group.current.position.z, 0, 3.2, delta);
  });

  return (
    <group ref={group} rotation={REST_ROTATION}>
      <primitive object={model} />
    </group>
  );
}

useGLTF.preload(MODEL_PATH);
