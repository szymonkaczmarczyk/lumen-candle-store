"use client";

import { X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { clsx } from "clsx";
import { getLenis } from "@/lib/lenis";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  side: "left" | "right";
  title: string;
  closeLabel: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function Sheet({ open, onClose, side, title, closeLabel, children, footer }: SheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      document.documentElement.dataset.sheetOpen = "true";
      getLenis()?.stop();
    }
    if (!open && dialog.open) {
      dialog.close();
    }
    if (!open) {
      delete document.documentElement.dataset.sheetOpen;
      getLenis()?.start();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-label={title}
      data-lenis-prevent
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
      className={clsx(
        "sheet fixed inset-y-0 m-0 h-dvh max-h-dvh w-full max-w-md bg-ivory p-0 text-ink backdrop:bg-night/40 backdrop:backdrop-blur-[2px]",
        side === "right" ? "sheet-right ml-auto mr-0" : "sheet-left mr-auto ml-0",
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-line px-4">
          <button
            type="button"
            onClick={onClose}
            className="-ml-2 inline-flex size-11 items-center justify-center rounded-xs transition-colors hover:bg-sand"
            aria-label={closeLabel}
          >
            <X className="size-5" strokeWidth={1.5} aria-hidden />
          </button>
          <h2 className="type-h4">{title}</h2>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
        {footer && <div className="shrink-0 border-t border-line p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">{footer}</div>}
      </div>
    </dialog>
  );
}
