import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";

export function LegalLink({ href, children }: { href: "/terms" | "/privacy"; children: ReactNode }) {
  return (
    <Link href={href} target="_blank" className="underline underline-offset-2 hover:text-gold-text">
      {children}
    </Link>
  );
}
