import { useState } from "react";
import { Copy, GripVertical, Plus, Trash2 } from "lucide-react";
import { SaveBar } from "@/components/admin/SaveBar";
import { useContentEditorState } from "@/hooks/useContentEditorState";
import { updateNavItemContent } from "@/lib/onboarding/content.queries";
import type { ChecklistItem } from "@/lib/onboarding/nav-tree";

export function ChecklistEditor({
  itemId,
  items: initialItems,
  onDirtyChange,
}: {
  itemId: string;
  items: ChecklistItem[];
  onDirtyChange?: (dirty: boolean) => void;
}) {
  const {
    content: items,
    setContent: setItems,
    saving,
    hasUndo,
    save,
    undoLastSave,
  } = useContentEditorState(
    itemId,
    initialItems,
    (items) => updateNavItemContent(itemId, { items }),
    onDirtyChange,
  );
  const [dragId, setDragId] = useState<string | null>(null);

  const updateItem = (id: string, patch: Partial<ChecklistItem>) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  };

  const addItem = () => {
    setItems((prev) => [...prev, { id: crypto.randomUUID(), label: "Nueva tarea" }]);
  };

  const duplicateItem = (id: string) => {
    setItems((prev) => {
      const index = prev.findIndex((i) => i.id === id);
      if (index === -1) return prev;
      const copy = { ...prev[index], id: crypto.randomUUID() };
      return [...prev.slice(0, index + 1), copy, ...prev.slice(index + 1)];
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const reorderByDrag = (draggedId: string, dropId: string) => {
    if (draggedId === dropId) return;
    setItems((prev) => {
      const from = prev.findIndex((i) => i.id === draggedId);
      const to = prev.findIndex((i) => i.id === dropId);
      if (from === -1 || to === -1) return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div
          key={item.id}
          draggable
          onDragStart={() => setDragId(item.id)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (dragId) reorderByDrag(dragId, item.id);
            setDragId(null);
          }}
          onDragEnd={() => setDragId(null)}
          className={`flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-3 transition-opacity ${
            dragId === item.id ? "opacity-50" : ""
          }`}
        >
          <span className="flex h-9 w-5 shrink-0 cursor-grab items-center justify-center text-muted-foreground active:cursor-grabbing">
            <GripVertical className="h-4 w-4" />
          </span>
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
            onClick={() => duplicateItem(item.id)}
            title="Duplicar tarea"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:bg-secondary"
          >
            <Copy className="h-4 w-4" />
          </button>
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

      <SaveBar saving={saving} hasUndo={hasUndo} onSave={save} onUndo={undoLastSave} />
    </div>
  );
}
