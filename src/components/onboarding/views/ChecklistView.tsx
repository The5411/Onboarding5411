import { ExternalLink } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useOnboardingProgress } from "@/hooks/useOnboardingProgress";
import type { ChecklistItem } from "@/lib/onboarding/nav-tree";

export function ChecklistView({ items }: { items: ChecklistItem[] }) {
  const { progress, toggleItem } = useOnboardingProgress();

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        Todavía no hay checklist configurado para esta sección.
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {items.map((item) => {
        const checked = !!progress[item.id];
        return (
          <li
            key={item.id}
            className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
          >
            <Checkbox checked={checked} onCheckedChange={() => toggleItem(item.id)} id={item.id} />
            <label
              htmlFor={item.id}
              className={`flex-1 cursor-pointer text-sm ${checked ? "text-muted-foreground line-through" : "font-medium"}`}
            >
              {item.label}
            </label>
            {item.href && (
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 rounded-lg border border-border bg-secondary/40 px-2.5 py-1 text-xs font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Instructivo
              </a>
            )}
          </li>
        );
      })}
    </ul>
  );
}
