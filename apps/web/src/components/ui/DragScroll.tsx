"use client";

import { useRef, type HTMLAttributes, type PointerEvent as ReactPointerEvent } from "react";
import { clsx } from "clsx";
import { gsap } from "@/lib/gsap";

interface DragState {
  startX: number;
  startLeft: number;
  lastX: number;
  lastTime: number;
  velocity: number;
  moved: boolean;
}

const nearestSnapLeft = (list: HTMLElement, target: number) => {
  const padding = Number.parseFloat(getComputedStyle(list).scrollPaddingLeft) || 0;
  const max = list.scrollWidth - list.clientWidth;
  const stops = Array.from(list.children, (child) => Math.min(max, Math.max(0, (child as HTMLElement).offsetLeft - padding)));
  return stops.reduce((best, stop) => (Math.abs(stop - target) < Math.abs(best - target) ? stop : best), stops[0] ?? 0);
};

export function DragScroll({ className, children, ...props }: HTMLAttributes<HTMLUListElement>) {
  const listRef = useRef<HTMLUListElement>(null);
  const drag = useRef<DragState | null>(null);
  const suppressClick = useRef(false);

  const onPointerDown = (event: ReactPointerEvent<HTMLUListElement>) => {
    const list = listRef.current;
    if (!list || event.pointerType !== "mouse" || event.button !== 0) return;
    gsap.killTweensOf(list);
    drag.current = { startX: event.clientX, startLeft: list.scrollLeft, lastX: event.clientX, lastTime: performance.now(), velocity: 0, moved: false };
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLUListElement>) => {
    const list = listRef.current;
    const state = drag.current;
    if (!list || !state) return;
    const distance = event.clientX - state.startX;
    if (!state.moved && Math.abs(distance) > 4) {
      state.moved = true;
      list.dataset.dragging = "";
      list.setPointerCapture(event.pointerId);
    }
    if (!state.moved) return;
    const now = performance.now();
    state.velocity = (event.clientX - state.lastX) / Math.max(1, now - state.lastTime);
    state.lastX = event.clientX;
    state.lastTime = now;
    list.scrollLeft = state.startLeft - distance;
  };

  const release = (event: ReactPointerEvent<HTMLUListElement>) => {
    const list = listRef.current;
    const state = drag.current;
    drag.current = null;
    if (!list || !state?.moved) return;
    suppressClick.current = true;
    if (list.hasPointerCapture(event.pointerId)) list.releasePointerCapture(event.pointerId);
    const target = nearestSnapLeft(list, list.scrollLeft - state.velocity * 320);
    gsap.to(list, {
      scrollLeft: target,
      duration: 0.9,
      ease: "power3.out",
      onComplete: () => {
        delete list.dataset.dragging;
      },
    });
  };

  return (
    <ul
      ref={listRef}
      {...props}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={release}
      onPointerCancel={release}
      onDragStart={(event) => event.preventDefault()}
      onClickCapture={(event) => {
        if (!suppressClick.current) return;
        suppressClick.current = false;
        event.preventDefault();
        event.stopPropagation();
      }}
      className={clsx("[@media(pointer:fine)]:cursor-grab data-[dragging]:cursor-grabbing data-[dragging]:snap-none data-[dragging]:select-none", className)}
    >
      {children}
    </ul>
  );
}
