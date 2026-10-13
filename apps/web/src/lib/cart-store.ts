"use client";

import { maxCartLines, maxQuantityPerLine } from "@lumen/shared";
import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface CartItem {
  variantId: string;
  quantity: number;
  productSlug: string;
  productName: string;
  variantLabel: string;
  unitPriceGrosze: number;
  accentColor: string;
  imageUrl: string | null;
}

interface CartState {
  items: CartItem[];
  drawerOpen: boolean;
  removalNotice: boolean;
  add: (item: Omit<CartItem, "quantity">, quantity: number) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  remove: (variantId: string) => void;
  replace: (items: CartItem[], removedSome: boolean) => void;
  clear: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const clampQuantity = (quantity: number) => Math.max(1, Math.min(maxQuantityPerLine, Math.round(quantity)));

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      drawerOpen: false,
      removalNotice: false,
      add: (item, quantity) =>
        set((state) => {
          const existing = state.items.find((line) => line.variantId === item.variantId);
          if (existing) {
            return {
              items: state.items.map((line) =>
                line.variantId === item.variantId ? { ...line, ...item, quantity: clampQuantity(line.quantity + quantity) } : line,
              ),
              removalNotice: false,
            };
          }
          if (state.items.length >= maxCartLines) return state;
          return { items: [...state.items, { ...item, quantity: clampQuantity(quantity) }], removalNotice: false };
        }),
      setQuantity: (variantId, quantity) =>
        set((state) => ({
          items: state.items.map((line) => (line.variantId === variantId ? { ...line, quantity: clampQuantity(quantity) } : line)),
        })),
      remove: (variantId) => set((state) => ({ items: state.items.filter((line) => line.variantId !== variantId) })),
      replace: (items, removedSome) => set((state) => ({ items, removalNotice: removedSome || state.removalNotice })),
      clear: () => set({ items: [] }),
      openDrawer: () => set({ drawerOpen: true }),
      closeDrawer: () => set({ drawerOpen: false }),
    }),
    {
      name: "lumen-cart",
      version: 2,
      migrate: () => ({ items: [] }),
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      skipHydration: true,
    },
  ),
);

export const selectItemCount = (state: CartState) => state.items.reduce((sum, line) => sum + line.quantity, 0);

export const selectSubtotal = (state: CartState) =>
  state.items.reduce((sum, line) => sum + line.unitPriceGrosze * line.quantity, 0);

export function useCartHydrated() {
  return useSyncExternalStore(
    (onChange) => useCartStore.persist.onFinishHydration(onChange),
    () => useCartStore.persist.hasHydrated(),
    () => false,
  );
}
