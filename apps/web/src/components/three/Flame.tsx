"use client";

import { Billboard } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { AdditiveBlending, Color, type PointLight } from "three";

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform vec3 uCore;
  uniform vec3 uEdge;
  varying vec2 vUv;

  float hash(float n) { return fract(sin(n) * 43758.5453); }
  float noise(float x) { float i = floor(x); float f = fract(x); return mix(hash(i), hash(i + 1.0), smoothstep(0.0, 1.0, f)); }

  void main() {
    vec2 p = vUv - vec2(0.5, 0.18);
    float sway = (sin(uTime * 1.7) * 0.6 + (noise(uTime * 2.3) - 0.5)) * 0.1 * smoothstep(0.0, 0.7, p.y);
    p.x -= sway;
    float stretch = 1.0 + (noise(uTime * 3.1 + 7.0) - 0.5) * 0.12;
    p.y /= stretch;
    float width = mix(0.16, 0.0, smoothstep(-0.05, 0.62, p.y)) * smoothstep(-0.14, 0.02, p.y);
    float body = 1.0 - smoothstep(width * 0.55, width, abs(p.x));
    body *= smoothstep(-0.15, -0.02, p.y);
    float core = 1.0 - smoothstep(width * 0.1, width * 0.55, abs(p.x));
    core *= smoothstep(-0.08, 0.02, p.y) * (1.0 - smoothstep(0.05, 0.35, p.y));
    float base = smoothstep(0.08, -0.06, p.y) * (1.0 - smoothstep(0.0, 0.07, abs(p.x)));
    vec3 color = mix(uEdge, uCore, core);
    color = mix(color, vec3(0.35, 0.45, 1.0), base * 0.55);
    float alpha = clamp(body * 0.95 + core * 0.4, 0.0, 1.0);
    gl_FragColor = vec4(color * alpha, alpha);
  }
`;

const haloShader = `
  varying vec2 vUv;
  uniform float uStrength;
  void main() {
    float d = distance(vUv, vec2(0.5));
    float glow = pow(max(0.0, 1.0 - d * 2.0), 2.6) * uStrength;
    float dither = (fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453) - 0.5) / 96.0;
    glow = max(0.0, glow + dither * step(0.001, glow));
    gl_FragColor = vec4(vec3(1.0, 0.62, 0.25) * glow, glow);
  }
`;

export function Flame({ position, halo = 0, body = true }: { position: [number, number, number]; halo?: number; body?: boolean }) {
  const light = useRef<PointLight>(null);
  const haloUniforms = useMemo(() => ({ uStrength: { value: halo } }), [halo]);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uCore: { value: new Color("#fff6dc") },
      uEdge: { value: new Color("#ff9a2e") },
    }),
    [],
  );

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    uniforms.uTime.value = time;
    const flicker = Math.sin(time * 9.0) * 0.08 + Math.sin(time * 23.0) * 0.05;
    if (light.current) light.current.intensity = (2.2 + halo * 3) * (1 + flicker);
    haloUniforms.uStrength.value = halo * (1 + flicker * 1.4);
  });

  return (
    <group position={position}>
      {body && (
        <Billboard lockX lockZ>
          <mesh position={[0, 0.16, 0]}>
            <planeGeometry args={[0.32, 0.5]} />
            <shaderMaterial
              uniforms={uniforms}
              vertexShader={vertexShader}
              fragmentShader={fragmentShader}
              transparent
              depthWrite={false}
              blending={AdditiveBlending}
            />
          </mesh>
        </Billboard>
      )}
      {halo > 0 && (
        <Billboard>
          <mesh position={[0, 0.2, -0.05]}>
            <planeGeometry args={[3.2, 3.2]} />
            <shaderMaterial uniforms={haloUniforms} vertexShader={vertexShader} fragmentShader={haloShader} transparent depthWrite={false} blending={AdditiveBlending} />
          </mesh>
        </Billboard>
      )}
      <pointLight ref={light} position={[0, 0.18, 0]} color="#ffb259" intensity={2.2} distance={4} decay={2} />
    </group>
  );
}
