"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useCartStore } from "@/lib/cart-store";

export function ClearCart() {
  useEffect(() => {
    void Promise.resolve(useCartStore.persist.rehydrate()).then(() => useCartStore.getState().clear());
  }, []);
  return null;
}

export function RefreshWhilePending({ pending }: { pending: boolean }) {
  const router = useRouter();
  useEffect(() => {
    if (!pending) return;
    const timer = window.setTimeout(() => router.refresh(), 3000);
    return () => window.clearTimeout(timer);
  }, [pending, router]);
  return null;
}
