"use client";

import { useEffect, useMemo } from "react";
import { CanvasTexture, Color, DoubleSide, SRGBColorSpace, Vector2 } from "three";
import { Flame } from "./Flame";

const vesselRadius = 0.82;
const vesselHeight = 1.8;
const wall = 0.05;
const bottom = 0.18;
const waxHeight = 1.4;
const labelHeight = 0.66;
const labelArc = 1.5;
const labelCenter = 0.82;

function labelLines(name: string): string[] {
  const words = name.split(" ");
  if (name.length <= 12 || words.length < 2) return [name];
  let best: string[] = [name];
  let bestScore = Number.POSITIVE_INFINITY;
  for (let index = 1; index < words.length; index += 1) {
    const first = words.slice(0, index);
    if ((first.at(-1) ?? "").length <= 2) continue;
    const lines = [first.join(" "), words.slice(index).join(" ")];
    const score = Math.abs((lines[0] ?? "").length - (lines[1] ?? "").length);
    if (score < bestScore) {
      best = lines;
      bestScore = score;
    }
  }
  return best;
}

interface CandleModelProps {
  glassColor: string;
  name: string;
  caption: string;
  lit?: boolean;
  mood?: "studio" | "night";
  flameBody?: boolean;
}

function useLabelTexture(name: string, caption: string) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1240;
    canvas.height = 660;
    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = 8;
    return texture;
  }, []);

  useEffect(() => {
    const canvas = texture.image as HTMLCanvasElement;
    const context = canvas.getContext("2d");
    if (!context) return;
    const styles = getComputedStyle(document.documentElement);
    const display = styles.getPropertyValue("--font-alte-haas").trim() || "Helvetica Neue";
    const draw = () => {
      context.fillStyle = "#f4f0e8";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "#9b7a46";
      context.textAlign = "center";
      context.font = `700 34px ${display}`;
      context.letterSpacing = "20px";
      context.fillText("LUMEN", canvas.width / 2 + 10, 150);
      context.letterSpacing = "-2px";
      context.fillStyle = "#16130f";
      const lines = labelLines(name);
      context.font = `700 92px ${display}`;
      lines.forEach((line, index) => context.fillText(line, canvas.width / 2, 300 + index * 96));
      context.letterSpacing = "6px";
      context.fillStyle = "#5e554a";
      context.font = `400 30px ${display}`;
      context.fillText(caption.toUpperCase(), canvas.width / 2, 530);
      context.fillStyle = "#b08a55";
      context.fillRect(canvas.width / 2 - 50, 565, 100, 3);
      texture.needsUpdate = true;
    };
    draw();
    void document.fonts.ready.then(draw);
  }, [texture, name, caption]);

  return texture;
}

export function CandleModel({ glassColor, name, caption, lit = true, mood = "studio", flameBody = true }: CandleModelProps) {
  const labelTexture = useLabelTexture(name, caption);
  const profile = useMemo(() => {
    const inner = vesselRadius - wall;
    return [
      new Vector2(0, bottom),
      new Vector2(inner - 0.06, bottom),
      new Vector2(inner - 0.01, bottom + 0.04),
      new Vector2(inner, bottom + 0.12),
      new Vector2(inner, vesselHeight - 0.01),
      new Vector2(inner + wall * 0.25, vesselHeight + 0.008),
      new Vector2(inner + wall * 0.75, vesselHeight + 0.008),
      new Vector2(vesselRadius, vesselHeight - 0.01),
      new Vector2(vesselRadius, 0.08),
      new Vector2(vesselRadius - 0.02, 0.025),
      new Vector2(vesselRadius - 0.07, 0),
      new Vector2(0, 0),
    ];
  }, []);
  const tint = useMemo(() => new Color(glassColor).lerp(new Color("#ffffff"), 0.25), [glassColor]);
  const waxTop = bottom + waxHeight;

  return (
    <group>
      <mesh castShadow>
        <latheGeometry args={[profile, 128]} />
        <meshPhysicalMaterial
          color={tint}
          transmission={1}
          thickness={0.22}
          roughness={0.04}
          ior={1.5}
          attenuationColor={tint}
          attenuationDistance={1.6}
          clearcoat={1}
          clearcoatRoughness={0.03}
          specularIntensity={1}
          envMapIntensity={2.2}
          side={DoubleSide}
        />
      </mesh>
      <mesh position={[0, bottom + waxHeight / 2, 0]}>
        <cylinderGeometry args={[vesselRadius - wall - 0.004, vesselRadius - wall - 0.004, waxHeight, 128]} />
        <meshPhysicalMaterial color="#efe4cf" roughness={0.55} sheen={0.6} sheenColor="#fff4dd" sheenRoughness={0.5} />
      </mesh>
      <mesh position={[0, waxTop + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[vesselRadius - wall - 0.004, 128]} />
        <meshPhysicalMaterial color={lit ? "#f3e2bf" : "#efe4cf"} roughness={lit ? 0.12 : 0.6} clearcoat={lit ? 1 : 0} />
      </mesh>
      <mesh position={[0, waxTop + 0.07, 0]}>
        <cylinderGeometry args={[0.011, 0.013, 0.14, 12]} />
        <meshStandardMaterial color="#1b1712" roughness={0.9} />
      </mesh>
      <mesh position={[0, labelCenter, 0]}>
        <cylinderGeometry args={[vesselRadius + 0.003, vesselRadius + 0.003, labelHeight, 128, 1, true, -labelArc / 2, labelArc]} />
        <meshStandardMaterial transparent map={labelTexture} roughness={0.85} metalness={0} emissive="#ffffff" emissiveMap={labelTexture} emissiveIntensity={mood === "night" ? 0.02 : 0.18} />
      </mesh>
      {lit && <Flame position={[0, waxTop + 0.13, 0]} halo={mood === "night" ? 0.9 : 0} body={flameBody} />}
    </group>
  );
}
