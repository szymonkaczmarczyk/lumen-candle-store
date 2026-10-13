"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState, type ReactNode } from "react";
import { useCartStore } from "@/lib/cart-store";
import { SmoothScroll } from "../motion/SmoothScroll";

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false } } }),
  );

  useEffect(() => {
    void useCartStore.persist.rehydrate();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SmoothScroll />
      {children}
    </QueryClientProvider>
  );
}
