"use client";

import { LogOut } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { apiFetch } from "@/lib/client-api";
import { buttonStyles } from "../ui/button-styles";

export function LogoutButton() {
  const t = useTranslations("account");
  const router = useRouter();

  return (
    <button
      type="button"
      className={buttonStyles("outline")}
      onClick={async () => {
        await apiFetch("/auth/logout", { method: "POST" });
        router.push("/");
        router.refresh();
      }}
    >
      <LogOut className="size-4" strokeWidth={1.5} aria-hidden />
      {t("logout")}
    </button>
  );
}
