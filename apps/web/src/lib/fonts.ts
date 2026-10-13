import localFont from "next/font/local";

export const alteHaas = localFont({
  src: [
    { path: "../fonts/AlteHaasGrotesk-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/AlteHaasGrotesk-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-alte-haas",
  display: "swap",
  fallback: ["Helvetica Neue", "Arial", "sans-serif"],
});
