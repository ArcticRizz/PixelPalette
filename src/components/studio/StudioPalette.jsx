import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { readableOn } from "@/lib/pixel";

export default function StudioPalette({ palette, selected, onSelect, remaining }) {
  const activeLeft = remaining[selected] || 0;

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Palette</p>
        <p className="text-[11px] text-muted-foreground">
          Colour {selected} · {activeLeft} left
        </p>
      </div>

      <div className="mt-3 grid grid-cols-6 gap-2 sm:grid-cols-8 lg:grid-cols-5">
        {palette.map((hex, i) => {
          const number = i + 1;
          const left = remaining[number] || 0;
          const done = left === 0;
          const active = selected === number;
          return (
            <button
              key={number}
              type="button"
              onClick={() => onSelect(number)}
              title={`Colour ${number}${done ? " — finished" : ` — ${left} left`}`}
              className={cn(
                "group relative flex aspect-square items-center justify-center rounded-full transition-all duration-200",
                active ? "scale-110 ring-2 ring-foreground ring-offset-2 ring-offset-card" : "ring-1 ring-black/5",
                done ? "opacity-35" : "hover:scale-105 active:scale-95"
              )}
              style={{ backgroundColor: hex }}
            >
              <span className="text-[11px] font-semibold" style={{ color: readableOn(hex) }}>
                {number}
              </span>
              {done && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white shadow-sm">
                  <Check className="h-3 w-3 text-[#3E5B3B]" strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}