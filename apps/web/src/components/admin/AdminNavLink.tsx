"use client";

import NextLink from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { clsx } from "clsx";

export function AdminNavLink({ href, icon, children, exact = false }: { href: string; icon: ReactNode; children: ReactNode; exact?: boolean }) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname.startsWith(href);

  return (
    <NextLink
      href={href}
      aria-current={active ? "page" : undefined}
      className={clsx(
        "type-caption inline-flex min-h-11 items-center gap-3 whitespace-nowrap rounded-xs px-3 transition-colors",
        active ? "bg-cream/10 text-cream" : "text-cream-soft hover:bg-cream/5 hover:text-cream",
      )}
    >
      {icon}
      {children}
    </NextLink>
  );
}
