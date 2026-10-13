import "../globals.css";
import type { ReactNode } from "react";
import { alteHaas } from "@/lib/fonts";

export default function StudioLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pl" className={alteHaas.variable}>
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
