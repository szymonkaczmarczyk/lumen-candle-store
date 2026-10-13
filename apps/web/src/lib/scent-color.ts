const toRgb = (hex: string) => {
  const value = Number.parseInt(hex.replace("#", ""), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255] as const;
};

const toHex = (rgb: readonly number[]) => `#${rgb.map((channel) => Math.round(channel).toString(16).padStart(2, "0")).join("")}`;

const mix = (a: string, b: string, amount: number) => {
  const [ar, ag, ab] = toRgb(a);
  const [br, bg, bb] = toRgb(b);
  return toHex([ar + (br - ar) * amount, ag + (bg - ag) * amount, ab + (bb - ab) * amount]);
};

export const backdropFor = (accent: string) => mix(accent, "#d9d4cc", 0.58);

export const deepFor = (accent: string) => mix(accent, "#0d0b14", 0.78);

export const isDark = (hex: string) => {
  const [r, g, b] = toRgb(hex);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 140;
};
