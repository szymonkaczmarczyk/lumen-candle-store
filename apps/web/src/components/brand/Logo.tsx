import { flameMark, wordmark } from "./paths";

interface BrandSvgProps {
  className?: string;
  title?: string;
}

export function Wordmark({ className, title = "Lumen" }: BrandSvgProps) {
  return (
    <svg viewBox={wordmark.viewBox} className={className} role="img" aria-label={title} fill="currentColor">
      <path fillRule="evenodd" d={wordmark.path} />
    </svg>
  );
}

export function FlameMark({ className, title }: BrandSvgProps) {
  return (
    <svg
      viewBox={flameMark.viewBox}
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      fill="currentColor"
    >
      <path fillRule="evenodd" d={flameMark.path} />
    </svg>
  );
}
