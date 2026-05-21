import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const Field = ({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
}) => (
  <div className="flex flex-col">
    <label className="field-label">
      {label} {required && <span className="required-mark">*</span>}
    </label>
    {children}
    {hint && !error && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
    {error && <p className="text-xs text-destructive mt-1">{error}</p>}
  </div>
);

export const SectionCard = ({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) => (
  <div className="gov-card p-5 md:p-7">
    <div className="mb-5">
      <h2 className="text-lg md:text-xl text-primary">{title}</h2>
      {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
    </div>
    <div className="grid gap-4 md:grid-cols-2">{children}</div>
  </div>
);

export const RadioCardGroup = <T extends string>({
  value,
  onChange,
  options,
  columns = 2,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; description?: string }[];
  columns?: 1 | 2 | 3;
}) => (
  <div
    className={cn(
      "grid gap-2",
      columns === 1 && "grid-cols-1",
      columns === 2 && "grid-cols-1 sm:grid-cols-2",
      columns === 3 && "grid-cols-1 sm:grid-cols-2 md:grid-cols-3",
    )}
  >
    {options.map((opt) => {
      const active = value === opt.value;
      return (
        <button
          type="button"
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn("radio-card text-left", active && "radio-card-active")}
        >
          <span
            className={cn(
              "mt-0.5 w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center",
              active ? "border-secondary" : "border-muted-foreground/40",
            )}
          >
            {active && <span className="w-2 h-2 rounded-full bg-secondary" />}
          </span>
          <span>
            <span className="block text-sm font-medium text-foreground">{opt.label}</span>
            {opt.description && <span className="block text-xs text-muted-foreground mt-0.5">{opt.description}</span>}
          </span>
        </button>
      );
    })}
  </div>
);
