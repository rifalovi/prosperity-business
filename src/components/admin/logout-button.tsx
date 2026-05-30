"use client";

import { useTransition } from "react";
import { LogOut, Loader2 } from "lucide-react";
import { logoutAction } from "@/lib/actions/auth";

export function LogoutButton() {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      onClick={() => startTransition(() => logoutAction())}
      disabled={pending}
      className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--color-cream)] disabled:opacity-60"
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />}
      Déconnexion
    </button>
  );
}
