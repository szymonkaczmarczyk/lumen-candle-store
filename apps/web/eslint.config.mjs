import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  { ignores: [".next/**", "next-env.d.ts", "playwright-report/**", "test-results/**"] },
  { files: ["src/components/three/**"], rules: { "react-hooks/immutability": "off" } },
  { files: ["e2e/**"], rules: { "react-hooks/rules-of-hooks": "off" } },
];

export default eslintConfig;
