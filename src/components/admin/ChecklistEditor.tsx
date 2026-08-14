import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { updateNavItemContent } from "@/lib/onboarding/content.queries";
import type { ChecklistItem } from "@/lib/onboarding/nav-tree";

export function ChecklistEditor({
  itemId,
  items: initialItems,
}: {
  itemId: string;
  items: ChecklistItem[];
}) {
  const queryClient = useQueryClient();
  const [items, setItems] = useState(initialItems);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const updateItem = (id: string, patch: Partial<ChecklistItem>) => {
    setSavedAt(null);
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  };

  const addItem = () => {
    setSavedAt(null);
    setItems((prev) => [...prev, { id: crypto.randomUUID(), label: "Nueva tarea" }]);
  };

  const removeItem = (id: string) => {
    setSavedAt(null);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const save = async () => {
    setSaving(true);
    try {
      await updateNavItemContent(itemId, { items });
      await queryClient.invalidateQueries({ queryKey: ["content-tree"] });
      setSavedAt(Date.now());
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-3"
        >
          <input
            value={item.label}
            onChange={(e) => updateItem(item.id, { label: e.target.value })}
            placeholder="Texto de la tarea"
            className="min-w-[180px] flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            value={item.href ?? ""}
            onChange={(e) => updateItem(item.id, { href: e.target.value || undefined })}
            placeholder="Link opcional (https://...)"
            className="min-w-[180px] flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="button"
            onClick={() => removeItem(item.id)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-destructive transition-colors hover:bg-destructive/10"
            aria-label="Borrar tarea"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={addItem}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/40"
      >
        <Plus className="h-4 w-4" />
        Agregar tarea
      </button>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-lg px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-soft)] transition-opacity disabled:opacity-60"
          style={{ background: "var(--gradient-hero)" }}
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
        {savedAt && <span className="text-xs text-muted-foreground">Guardado ✓</span>}
      </div>
    </div>
  );
}
