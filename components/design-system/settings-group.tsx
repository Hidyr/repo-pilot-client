import { cn } from "@/lib/utils";

export function SettingsGroup({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "divide-y divide-border overflow-hidden rounded-lg border border-border bg-card",
        className
      )}
    >
      {children}
    </div>
  );
}

export function SettingsRow({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-3 bg-card px-4 py-3.5",
        className
      )}
    >
      {children}
    </div>
  );
}

export function SettingsRowText({
  title,
  description,
  titleClassName,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  titleClassName?: string;
}) {
  return (
    <div className="min-w-0 flex-1">
      <div
        className={cn(
          "text-[13px] font-normal text-[#d0d0d0]",
          titleClassName
        )}
      >
        {title}
      </div>
      {description ? (
        <p className="mt-0.5 text-[11px] text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}
