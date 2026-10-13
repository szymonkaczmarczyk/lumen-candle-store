import type { ProductImageView } from "@lumen/shared";
import Image from "next/image";
import { CandleFlame } from "./CandleFlame";
import { DragScroll } from "../ui/DragScroll";

export function ProductGallery({ images, label, background, dark }: { images: ProductImageView[]; label: string; background: string; dark: boolean }) {
  const ordered = (["COLOR", "TOP", "NEUTRAL"] as const).flatMap((role) => images.filter((image) => image.role === role));

  return (
    <section aria-label={label} className="-mt-[var(--header-h)]" style={{ backgroundColor: background }} data-header-dark={dark ? true : undefined}>
      <DragScroll tabIndex={0} aria-label={label} className="flex snap-x snap-mandatory gap-1 overflow-x-auto focus-visible:outline-offset-[-3px]" data-lenis-prevent-wheel>
        {ordered.map((image, index) => (
          <li key={image.role} className="relative h-[62svh] w-[78vw] shrink-0 snap-start md:h-[min(92svh,980px)] md:w-[calc(50%-2px)]" data-product-image={index === 0 ? true : undefined}>
            <Image
              src={image.url}
              alt={image.alt}
              fill
              preload={index === 0}
              loading={index < 2 ? "eager" : "lazy"}
              fetchPriority={index === 0 ? "high" : "auto"}
              sizes="(min-width: 768px) 50vw, 78vw"
              className="object-cover"
            />
            {image.role !== "NEUTRAL" && <CandleFlame shot={image.role === "TOP" ? "top" : "front"} seed={image.url} />}
          </li>
        ))}
      </DragScroll>
    </section>
  );
}
