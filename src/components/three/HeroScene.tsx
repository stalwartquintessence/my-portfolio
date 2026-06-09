"use client";

import { useRef, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Environment, Lightformer } from "@react-three/drei";
import type { Group, Points } from "three";

const PARTICLE_COUNT = 260;

// Generated once at module load. This module is imported with `ssr: false`, so
// it only ever runs on the client — keeping Math.random out of render keeps the
// component pure.
const PARTICLE_POSITIONS = ((): Float32Array => {
  const data = new Float32Array(PARTICLE_COUNT * 3);
  for (let i = 0; i < data.length; i += 1) {
    data[i] = (Math.random() - 0.5) * 16;
  }
  return data;
})();

/**
 * Slow-drifting particle field. A single <points> object (one draw call) keeps
 * this cheap; the whole field rotates gently rather than mutating the buffer
 * each frame, which holds 60fps comfortably.
 */
function ParticleField() {
  const pointsRef = useRef<Points>(null);

  useFrame((_, delta) => {
    const points = pointsRef.current;
    if (!points) {
      return;
    }
    points.rotation.y += delta * 0.02;
    points.rotation.x += delta * 0.006;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[PARTICLE_POSITIONS, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.028}
        color="#9ecbff"
        transparent
        opacity={0.7}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

interface GlassShapeProps {
  position: [number, number, number];
  scale?: number;
  speed?: number;
  rotationIntensity?: number;
  floatIntensity?: number;
  children: ReactNode;
}

/**
 * A floating piece of geometry wrapped in a glass-like physical material.
 * `<Float>` from drei supplies the idle drift/rotation.
 */
function GlassShape({
  position,
  scale = 1,
  speed = 1.2,
  rotationIntensity = 1,
  floatIntensity = 1.5,
  children,
}: GlassShapeProps) {
  return (
    <Float
      speed={speed}
      rotationIntensity={rotationIntensity}
      floatIntensity={floatIntensity}
    >
      <mesh position={position} scale={scale}>
        {children}
        <meshPhysicalMaterial
          transmission={1}
          thickness={1.2}
          roughness={0.08}
          metalness={0}
          ior={1.45}
          clearcoat={1}
          clearcoatRoughness={0.1}
          color="#bcd9ff"
          envMapIntensity={1.2}
          transparent
        />
      </mesh>
    </Float>
  );
}

/**
 * Group that eases its rotation toward the pointer for a subtle parallax. R3F
 * keeps `state.pointer` normalized to -1..1 across the canvas.
 */
function ParallaxGroup({ children }: { children: ReactNode }) {
  const groupRef = useRef<Group>(null);

  useFrame((state) => {
    const group = groupRef.current;
    if (!group) {
      return;
    }
    const targetX = state.pointer.x * 0.35;
    const targetY = state.pointer.y * 0.35;
    group.rotation.y += (targetX - group.rotation.y) * 0.05;
    group.rotation.x += (-targetY - group.rotation.x) * 0.05;
  });

  return <group ref={groupRef}>{children}</group>;
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[6, 5, 4]} intensity={45} color="#2997ff" />
      <pointLight position={[-6, -3, 3]} intensity={28} color="#ffffff" />
      <directionalLight position={[0, 6, 5]} intensity={1.2} color="#ffffff" />

      <ParticleField />

      <ParallaxGroup>
        <GlassShape position={[-2.6, 0.6, -1]} scale={1.05} speed={1.1}>
          <icosahedronGeometry args={[1, 0]} />
        </GlassShape>
        <GlassShape
          position={[2.7, -0.4, -0.5]}
          scale={0.7}
          speed={1.4}
          rotationIntensity={1.4}
        >
          <torusKnotGeometry args={[0.7, 0.25, 128, 32]} />
        </GlassShape>
        <GlassShape
          position={[0.4, 1.7, -2]}
          scale={0.55}
          speed={0.9}
          floatIntensity={2}
        >
          <icosahedronGeometry args={[1, 1]} />
        </GlassShape>
      </ParallaxGroup>

      {/* Procedural environment (no network HDR) so the glass has something to
          refract and reflect. Baked once for performance. */}
      <Environment resolution={256} frames={1}>
        <Lightformer
          intensity={2}
          position={[0, 4, -6]}
          scale={[12, 12, 1]}
          color="#2997ff"
        />
        <Lightformer
          intensity={1.6}
          position={[-5, 1, 2]}
          scale={[6, 6, 1]}
          color="#ffffff"
        />
        <Lightformer
          intensity={1.1}
          position={[5, -1, 2]}
          scale={[6, 6, 1]}
          color="#9ecbff"
        />
      </Environment>
    </>
  );
}

export default function HeroScene() {
  return (
    <Canvas
      className="h-full w-full"
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: [0, 0, 6], fov: 45 }}
    >
      <Scene />
    </Canvas>
  );
}
