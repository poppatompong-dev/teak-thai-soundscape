import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const STEPS = [
  "ข้อมูลสถานที่",
  "ความต้องการติดตั้ง",
  "เพื่อตั้งงบประมาณ",
];

export const StepIndicator = ({ current }: { current: number }) => {
  const progressPct = ((current + 1) / STEPS.length) * 100;

  return (
    <div className="w-full space-y-4">
      {/* Animated progress bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-secondary rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <span className="text-xs font-semibold text-secondary tabular-nums whitespace-nowrap">
          {current + 1} / {STEPS.length}
        </span>
      </div>

      {/* Step circles + labels */}
      <div className="flex items-start">
        {STEPS.map((label, i) => {
          const done   = i < current;
          const active = i === current;
          return (
            <div key={label} className="flex items-center flex-1 min-w-0">
              <div className="flex flex-col items-center gap-1.5 min-w-0 flex-1">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
                    done   && "bg-secondary text-white shadow-sm",
                    active && "bg-primary text-white ring-4 ring-primary/15 step-badge-active",
                    !done && !active && "bg-muted border-2 border-border/60 text-muted-foreground/50",
                  )}
                >
                  {done ? <Check className="w-3.5 h-3.5" /> : <span>{i + 1}</span>}
                </div>
                <span
                  className={cn(
                    "text-[10px] md:text-xs text-center leading-snug px-1 transition-colors duration-200",
                    active         ? "text-primary font-semibold"   : "",
                    done           ? "text-secondary font-medium"   : "",
                    !done && !active ? "text-muted-foreground/55"   : "",
                  )}
                >
                  {label}
                </span>
              </div>

              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 mx-2 mb-6 rounded-full transition-all duration-500",
                    i < current ? "bg-secondary" : "bg-border/60",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
