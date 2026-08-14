import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { updateNavItemContent } from "@/lib/onboarding/content.queries";
import type { DocSection } from "@/lib/onboarding/nav-tree";

export function DocSectionsEditor({
  itemId,
  sections: initialSections,
}: {
  itemId: string;
  sections: DocSection[];
}) {
  const queryClient = useQueryClient();
  const [sections, setSections] = useState(initialSections);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const updateSection = (id: string, patch: Partial<DocSection>) => {
    setSavedAt(null);
    setSections((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };

  const addSection = () => {
    setSavedAt(null);
    setSections((prev) => [
      ...prev,
      { id: crypto.randomUUID(), title: "Nueva sección", html: "<p></p>" },
    ]);
  };

  const removeSection = (id: string) => {
    if (!window.confirm("¿Borrar esta tarjeta?")) return;
    setSavedAt(null);
    setSections((prev) => prev.filter((s) => s.id !== id));
  };

  const save = async () => {
    setSaving(true);
    try {
      await updateNavItemContent(itemId, { sections });
      await queryClient.invalidateQueries({ queryKey: ["content-tree"] });
      setSavedAt(Date.now());
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <div key={section.id} className="rounded-xl border border-border bg-card p-4">
          <div className="mb-3 flex items-center gap-2">
            <input
              value={section.title}
              onChange={(e) => updateSection(section.id, { title: e.target.value })}
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-ring"
              placeholder="Título de la tarjeta"
            />
            <button
              type="button"
              onClick={() => removeSection(section.id)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-destructive transition-colors hover:bg-destructive/10"
              aria-label="Borrar tarjeta"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <RichTextEditor
            html={section.html}
            onChange={(html) => updateSection(section.id, { html })}
          />
        </div>
      ))}

      <button
        type="button"
        onClick={addSection}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/40"
      >
        <Plus className="h-4 w-4" />
        Agregar tarjeta
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
