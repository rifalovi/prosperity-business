import type { LucideIcon } from "lucide-react";

export function ComingSoon({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-2xl border border-dashed border-border bg-white p-10 text-center shadow-sm">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-[var(--color-cream)] text-[var(--color-leaf)]">
          <Icon className="size-7" />
        </span>
        <h1 className="mt-4 font-display text-2xl font-bold">{title}</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          {description}
        </p>
        <span className="mt-5 inline-block rounded-full bg-[var(--color-cream)] px-3 py-1 text-xs font-medium text-[var(--color-earth)]">
          Bientôt disponible
        </span>
      </div>
    </div>
  );
}
