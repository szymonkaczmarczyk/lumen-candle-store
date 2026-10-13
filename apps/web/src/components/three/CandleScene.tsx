"use client";

import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, type ReactNode } from "react";
import type { Group } from "three";
import { CandleModel } from "./CandleModel";

export type CandleView = "front" | "top" | "detail" | "hero";

const cameras: Record<CandleView, { position: [number, number, number]; target: [number, number, number]; fov: number }> = {
  front: { position: [0, 2.6, 10.4], target: [0, 0.92, 0], fov: 22 },
  top: { position: [0, 8.4, 7.2], target: [0, 1.0, 0], fov: 24 },
  detail: { position: [1.6, 2.1, 3.4], target: [0, 1.3, 0], fov: 26 },
  hero: { position: [0, 2.2, 15], target: [0, -0.05, 0], fov: 22 },
};

interface CandleSceneProps {
  glassColor: string;
  background: string;
  name: string;
  caption: string;
  view?: CandleView;
  turntable?: boolean;
  lit?: boolean;
  flameBody?: boolean;
  className?: string;
  onReady?: () => void;
}

function Turntable({ enabled, children }: { enabled: boolean; children: ReactNode }) {
  const group = useRef<Group>(null);
  useFrame((state) => {
    if (!enabled || !group.current) return;
    group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.25) * 0.45;
  });
  return <group ref={group}>{children}</group>;
}

function CameraRig({ view }: { view: CandleView }) {
  const { target } = cameras[view];
  useFrame((state) => state.camera.lookAt(target[0], target[1], target[2]));
  return null;
}

export function CandleScene({ glassColor, background, name, caption, view = "front", turntable = false, lit = true, flameBody = true, className, onReady }: CandleSceneProps) {
  const camera = cameras[view];
  const night = view === "hero";

  return (
    <Canvas
      className={className}
      dpr={[1, 1.75]}
      shadows
      onCreated={() => onReady?.()}
      gl={{ antialias: true, preserveDrawingBuffer: true }}
      camera={{ position: camera.position, fov: camera.fov }}
    >
      <color attach="background" args={[background]} />
      <CameraRig view={view} />
      <ambientLight intensity={night ? 0.12 : 0.55} />
      <directionalLight position={[3, 6, 5]} intensity={night ? 0.7 : 2.2} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-4, 3, -3]} intensity={night ? 0.5 : 1.2} color="#ffe7c4" />
      <Turntable enabled={turntable}>
        <CandleModel glassColor={glassColor} name={name} caption={caption} lit={lit} flameBody={flameBody} mood={night ? "night" : "studio"} />
      </Turntable>
      <ContactShadows position={[0, 0, 0]} opacity={0.4} scale={5} blur={2.2} far={2.5} color="#1b140c" frames={1} />
      <Environment resolution={256} frames={1} environmentIntensity={night ? 0.6 : 1}>
        <Lightformer form="rect" intensity={4} position={[0, 5, 2]} rotation-x={Math.PI / 2} scale={[5, 5, 1]} />
        <Lightformer form="rect" intensity={1.6} position={[-3.2, 1.2, 2.4]} rotation-y={Math.PI / 3} scale={[1.2, 4, 1]} />
        <Lightformer form="rect" intensity={1} position={[3.2, 1.2, 2.4]} rotation-y={-Math.PI / 3} scale={[1.2, 4, 1]} />
        <Lightformer form="rect" intensity={2} position={[0, 1.5, -4]} scale={[8, 3, 1]} color="#ffe2b8" />
      </Environment>
    </Canvas>
  );
}
