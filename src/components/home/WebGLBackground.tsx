"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function ParticleField() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 1200;
  
  // Create randomized positions & velocities
  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vels = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Position range: -10 to +10
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;

      // Small velocities
      vels[i * 3] = (Math.random() - 0.5) * 0.01;
      vels[i * 3 + 1] = (Math.random() - 0.5) * 0.01;
      vels[i * 3 + 2] = (Math.random() - 0.5) * 0.01;
    }
    return [pos, vels];
  }, []);

  // Track mouse coordinates
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useFrame((state) => {
    if (!pointsRef.current) return;
    
    const geom = pointsRef.current.geometry;
    const posAttr = geom.attributes.position as THREE.BufferAttribute;

    // Slowly rotate overall field
    pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.03;
    pointsRef.current.rotation.x = state.clock.getElapsedTime() * 0.015;

    // Adjust particle positions based on velocities and mouse gravity
    for (let i = 0; i < count; i++) {
      let x = posAttr.getX(i);
      let y = posAttr.getY(i);
      let z = posAttr.getZ(i);

      // Move particle
      x += velocities[i * 3];
      y += velocities[i * 3 + 1];
      z += velocities[i * 3 + 2];

      // Pull towards mouse slightly
      x += (mouse.current.x * 2 - x) * 0.002;
      y += (mouse.current.y * 2 - y) * 0.002;

      // Boundary reset
      if (Math.abs(x) > 10) x = (Math.random() - 0.5) * 15;
      if (Math.abs(y) > 10) y = (Math.random() - 0.5) * 15;
      if (Math.abs(z) > 10) z = (Math.random() - 0.5) * 15;

      posAttr.setXYZ(i, x, y, z);
    }
    
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#3b82f6"
        size={0.065}
        sizeAttenuation={true}
        transparent={true}
        opacity={0.65}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

function LineNetwork() {
  const lineRef = useRef<THREE.LineSegments>(null);
  const count = 40;

  const [positions, indices] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }

    const inds: number[] = [];
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const dx = pos[i * 3] - pos[j * 3];
        const dy = pos[i * 3 + 1] - pos[j * 3 + 1];
        const dz = pos[i * 3 + 2] - pos[j * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < 4.5) {
          inds.push(i, j);
        }
      }
    }
    return [pos, new Uint16Array(inds)];
  }, []);

  useFrame((state) => {
    if (!lineRef.current) return;
    lineRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
    lineRef.current.rotation.z = state.clock.getElapsedTime() * 0.02;
  });

  return (
    <lineSegments ref={lineRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="index"
          args={[indices, 1]}
        />
      </bufferGeometry>
      <lineBasicMaterial
        color="#a855f7"
        transparent={true}
        opacity={0.25}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </lineSegments>
  );
}

// React 19 / Fiber helper
import { useMemo } from "react";

export function WebGLBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden select-none bg-[#030712]">
      {/* Glow overlays */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.12)_0%,transparent_70%)] blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.12)_0%,transparent_70%)] blur-[100px]" />
      
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        style={{ width: "100%", height: "100%" }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <ParticleField />
        <LineNetwork />
      </Canvas>
    </div>
  );
}
