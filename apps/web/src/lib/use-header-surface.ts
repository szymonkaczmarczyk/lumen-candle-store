"use client";

import { useEffect, useState } from "react";

export function useHeaderSurface(pathname: string) {
  const [overDark, setOverDark] = useState(false);

  useEffect(() => {
    const visible = new Set<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => (entry.isIntersecting ? visible.add(entry.target) : visible.delete(entry.target)));
        setOverDark(visible.size > 0);
      },
      { rootMargin: "0px 0px -92% 0px" },
    );
    const observeAll = () => document.querySelectorAll("[data-header-dark]").forEach((element) => observer.observe(element));
    observeAll();
    const mutations = new MutationObserver(observeAll);
    mutations.observe(document.getElementById("content") ?? document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      mutations.disconnect();
    };
  }, [pathname]);

  return overDark;
}
