import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const STEPS = [
  "ข้อมูลสถานที่",
  "ความต้องการติดตั้ง",
  "เพื่อตั้งงบประมาณ",
];

export const StepIndicator = ({ current }: { current: number }) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-1 overflow-x-auto pb-2">
        {STEPS.map((label, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <div key={label} className="flex items-center flex-1 min-w-fit">
              <div className="flex flex-col items-center gap-1.5 min-w-[72px]">
                <div
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all",
                    done && "bg-secondary border-secondary text-secondary-foreground",
                    active && "bg-primary border-primary text-primary-foreground shadow-elevated scale-110",
                    !done && !active && "bg-card border-border text-muted-foreground",
                  )}
                >
                  {done ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span
                  className={cn(
                    "text-[11px] md:text-xs text-center leading-tight max-w-[88px]",
                    (active || done) ? "text-foreground font-medium" : "text-muted-foreground",
                  )}
                >
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn("h-0.5 flex-1 mx-1 rounded-full", i < current ? "bg-secondary" : "bg-border")} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
