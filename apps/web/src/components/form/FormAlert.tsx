import { CircleAlert, CircleCheck } from "lucide-react";
import type { ReactNode } from "react";
import { clsx } from "clsx";

export function FormAlert({ tone, children }: { tone: "error" | "success"; children: ReactNode }) {
  const Icon = tone === "error" ? CircleAlert : CircleCheck;
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={clsx(
        "type-caption flex items-start gap-3 rounded-xs border p-4",
        tone === "error" ? "border-danger/30 bg-danger/5 text-danger" : "border-success/30 bg-success/5 text-success",
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} aria-hidden />
      <div>{children}</div>
    </div>
  );
}
