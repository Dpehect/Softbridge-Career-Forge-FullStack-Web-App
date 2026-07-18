"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/** Soft rising particles — warm, motivational, not cyber-dark */
function WarmParticles({ count = 70 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null);
  const { positions, colors, speeds } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const spd = new Float32Array(count);
    const palette = [
      new THREE.Color("#3B82F6"),
      new THREE.Color("#F97316"),
      new THREE.Color("#EC4899"),
      new THREE.Color("#A855F7"),
      new THREE.Color("#22C55E"),
      new THREE.Color("#FBBF24"),
    ];
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 18;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
      const c = palette[i % palette.length]!;
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
      spd[i] = 0.12 + Math.random() * 0.32;
    }
    return { positions: pos, colors: col, speeds: spd };
  }, [count]);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const attr = ref.current.geometry.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      let y = attr.getY(i) + speeds[i]! * delta;
      if (y > 6.5) y = -6.5;
      attr.setY(i, y);
    }
    attr.needsUpdate = true;
    ref.current.rotation.y += delta * 0.035;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.11}
        vertexColors
        transparent
        opacity={0.5}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function GlowingOrb({
  color,
  position,
  scale = 1,
  speed = 1,
}: {
  color: string;
  position: [number, number, number];
  scale?: number;
  speed?: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime * speed;
    ref.current.position.y = position[1] + Math.sin(t) * 0.4;
    ref.current.position.x = position[0] + Math.cos(t * 0.65) * 0.25;
  });

  return (
    <mesh ref={ref} position={position} scale={scale}>
      <sphereGeometry args={[1, 24, 24]} />
      <meshBasicMaterial color={color} transparent opacity={0.2} />
    </mesh>
  );
}

function ConnectionLines() {
  const ref = useRef<THREE.LineSegments>(null);
  const count = 24;
  const { positions, indices } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 14;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6;
    }
    const inds: number[] = [];
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const dx = pos[i * 3]! - pos[j * 3]!;
        const dy = pos[i * 3 + 1]! - pos[j * 3 + 1]!;
        const dz = pos[i * 3 + 2]! - pos[j * 3 + 2]!;
        if (Math.sqrt(dx * dx + dy * dy + dz * dz) < 3.6) inds.push(i, j);
      }
    }
    return { positions: pos, indices: new Uint16Array(inds) };
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.028;
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.12) * 0.05;
  });

  return (
    <lineSegments ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="index" args={[indices, 1]} />
      </bufferGeometry>
      <lineBasicMaterial color="#F472B6" transparent opacity={0.16} depthWrite={false} />
    </lineSegments>
  );
}

/** Soft drifting gradient plane via CSS layer (cheap) + light R3F scene */
export function WebGLBackground() {
  const [mounted, setMounted] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  if (!mounted) {
    return (
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-orange-50/70 to-violet-50 dark:from-slate-950 dark:via-violet-950/40 dark:to-slate-900" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none select-none">
      <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-orange-50/80 to-violet-50 dark:from-slate-950 dark:via-violet-950/40 dark:to-slate-900" />
      <div className="hero-blob hero-blob-sky absolute -top-24 -left-20 h-[440px] w-[440px] rounded-full bg-sky-300/35 blur-3xl" />
      <div className="hero-blob hero-blob-orange absolute top-1/3 -right-16 h-[400px] w-[400px] rounded-full bg-orange-300/28 blur-3xl" />
      <div className="hero-blob hero-blob-pink absolute -bottom-20 left-1/3 h-[360px] w-[360px] rounded-full bg-pink-300/22 blur-3xl" />
      <div className="hero-blob hero-blob-violet absolute top-1/2 left-1/4 h-[280px] w-[280px] rounded-full bg-violet-300/22 blur-3xl" />

      {!reduceMotion && (
        <Canvas
          camera={{ position: [0, 0, 9], fov: 55 }}
          dpr={[1, 1.4]}
          gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
          style={{ width: "100%", height: "100%" }}
          frameloop="always"
        >
          <ambientLight intensity={0.85} />
          <WarmParticles count={72} />
          <ConnectionLines />
          <GlowingOrb color="#60A5FA" position={[-3.5, 1.2, -2]} scale={1.35} speed={0.75} />
          <GlowingOrb color="#FB923C" position={[3.2, -0.8, -1.5]} scale={1.05} speed={1.05} />
          <GlowingOrb color="#F472B6" position={[0.5, 2.0, -3]} scale={0.85} speed={0.9} />
          <GlowingOrb color="#C084FC" position={[-1.5, -2, -2.5]} scale={1.15} speed={1.0} />
        </Canvas>
      )}
    </div>
  );
}
