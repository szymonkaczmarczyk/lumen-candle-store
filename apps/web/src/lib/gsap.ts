"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);
gsap.defaults({ ease: "expo.out", duration: 1 });

export const reducedMotionQuery = "(prefers-reduced-motion: reduce)";
export const motionQuery = "(prefers-reduced-motion: no-preference)";

export { gsap, ScrollTrigger, SplitText, useGSAP };
