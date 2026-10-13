import type { ReactNode } from "react";
import { FlameMark } from "../brand/Logo";

export function AuthShell({ title, text, children }: { title: string; text: string; children: ReactNode }) {
  return (
    <div className="container-page grid min-h-[80svh] items-stretch gap-12 py-12 md:py-20 lg:grid-cols-2">
      <div className="flex flex-col justify-center gap-8 lg:pr-12">
        <header className="flex flex-col gap-3">
          <h1 className="type-h2">{title}</h1>
          <p className="type-body-lg measure text-ink-soft">{text}</p>
        </header>
        {children}
      </div>
      <div className="relative hidden overflow-hidden rounded-xs bg-night lg:block" aria-hidden>
        <div className="hero-glow absolute left-1/2 top-1/2 size-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full" />
        <FlameMark className="flame-flicker absolute left-1/2 top-1/2 h-1/3 w-auto -translate-x-1/2 -translate-y-1/2 text-gold-light" />
      </div>
    </div>
  );
}
