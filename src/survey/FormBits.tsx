import { ReactNode } from "react";
import { Check } from "lucide-react";
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
    {hint && !error && <p className="text-xs text-muted-foreground mt-1.5">{hint}</p>}
    {error && (
      <p className="text-xs text-destructive mt-1.5 flex items-center gap-1.5">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-destructive flex-shrink-0" />
        {error}
      </p>
    )}
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
  <div className="gov-card overflow-hidden">
    <div className="section-header">
      <h2 className="text-base md:text-lg font-semibold text-primary flex items-center gap-2.5">
        <span className="w-[3px] h-[1.15em] bg-secondary rounded-full flex-shrink-0" />
        {title}
      </h2>
      {description && (
        <p className="text-sm text-muted-foreground mt-1 pl-[15px]">{description}</p>
      )}
    </div>
    <div className="p-5 md:p-7">
      <div className="grid gap-5 md:grid-cols-2">{children}</div>
    </div>
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
              "mt-0.5 w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center transition-all duration-150",
              active ? "bg-secondary" : "border-2 border-muted-foreground/30",
            )}
          >
            {active && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
          </span>
          <span>
            <span className="block text-sm font-medium text-foreground">{opt.label}</span>
            {opt.description && (
              <span className="block text-xs text-muted-foreground mt-0.5 leading-snug">
                {opt.description}
              </span>
            )}
          </span>
        </button>
      );
    })}
  </div>
);
